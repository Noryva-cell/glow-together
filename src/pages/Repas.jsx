import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, ListChecks, Utensils, PackageSearch } from 'lucide-react';
import RecipeCard from '@/components/meals/RecipeCard';
import RecipeDialog from '@/components/meals/RecipeDialog';
import RecipeView from '@/components/meals/RecipeView';
import RecipePicker from '@/components/meals/RecipePicker';
import WeekMenu from '@/components/meals/WeekMenu';
import ShoppingList from '@/components/meals/ShoppingList';
import EmptyState from '@/components/EmptyState';
import RecipeFilters from '@/components/meals/RecipeFilters';
import RecipeLibraryPanel from '@/components/meals/RecipeLibraryPanel';
import { STARTER_RECIPES } from '@/lib/starterRecipes';
import { aggregateIngredients, filterRecipes, weekStartKey, weekDayKeys } from '@/lib/meals';
import { cn } from '@/lib/utils';

const TABS = [
  { value: 'menu', label: 'Menu', icon: Utensils },
  { value: 'recettes', label: 'Recettes', icon: Plus },
  { value: 'courses', label: 'Courses', icon: ListChecks },
];

export default function Repas() {
  const { profile } = useOutletContext();
  const [tab, setTab] = useState('menu');
  const [recipes, setRecipes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [picker, setPicker] = useState(null);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('');
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [visible, setVisible] = useState(30);

  const start = weekStartKey();
  const days = useMemo(() => weekDayKeys(start), [start]);

  const loadRecipes = async () => {
    const all = [];
    let page = await base44.entities.Recipe.list({ sort: 'name', limit: 200 });
    all.push(...(page.items || []));
    while (page.has_more && page.next_cursor && all.length < 600) {
      page = await base44.entities.Recipe.list({ sort: 'name', limit: 200, cursor: page.next_cursor });
      all.push(...(page.items || []));
    }
    return all;
  };

  const load = async () => {
    const [recipeList, weekPlans, weekItems] = await Promise.all([
      loadRecipes(),
      base44.entities.MealPlan.filter({ date: { $gte: days[0], $lte: days[6] } }),
      base44.entities.ShoppingItem.filter({ week_start: start }),
    ]);
    setRecipes(recipeList);
    setPlans(weekPlans);
    setItems(weekItems);
    setLoading(false);
  };

  useEffect(() => { load(); }, [start]);

  useEffect(() => { setVisible(30); }, [search, mealType, maxMinutes]);

  const byId = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), [recipes]);
  const weeklyCost = plans.reduce((sum, plan) => sum + (byId.get(plan.recipe_id)?.estimated_cost || 0), 0);
  const weeklyBudget = profile?.monthly_budget ? Number(profile.monthly_budget) / 4 : null;

  const filteredRecipes = useMemo(
    () => filterRecipes(recipes, { search, mealType, maxMinutes }),
    [recipes, search, mealType, maxMinutes]
  );

  const missingStarters = useMemo(() => {
    const names = new Set(recipes.map((recipe) => recipe.name.toLowerCase()));
    return STARTER_RECIPES.filter((recipe) => !names.has(recipe.name.toLowerCase())).length;
  }, [recipes]);

  const saveRecipe = async (payload) => {
    if (editing?.id) await base44.entities.Recipe.update(editing.id, payload);
    else await base44.entities.Recipe.create(payload);
    setEditing(null);
    setRecipeOpen(false);
    await load();
  };

  const deleteRecipe = async (recipe) => {
    if (!window.confirm('Supprimer cette recette et son emplacement dans le menu ?')) return;
    const linked = plans.filter((plan) => plan.recipe_id === recipe.id);
    await base44.entities.MealPlan.deleteMany({ recipe_id: recipe.id });
    await base44.entities.Recipe.delete(recipe.id);
    setViewing(null);
    await load();
    return linked;
  };

  const addToPlan = async (recipe) => {
    await base44.entities.MealPlan.create({
      date: picker.date,
      meal_type: picker.meal_type,
      recipe_id: recipe.id,
      servings: recipe.servings || 2,
    });
    setPicker(null);
    await load();
  };

  const removePlan = async (plan) => {
    await base44.entities.MealPlan.delete(plan.id);
    await load();
  };

  const togglePlan = async (plan) => {
    await base44.entities.MealPlan.update(plan.id, { done: !plan.done });
    await load();
  };

  const seedStarters = async () => {
    setBusy(true);
    const names = new Set(recipes.map((recipe) => recipe.name.toLowerCase()));
    const missing = STARTER_RECIPES.filter((recipe) => !names.has(recipe.name.toLowerCase()));
    if (missing.length) await base44.entities.Recipe.bulkCreate(missing);
    setBusy(false);
    await load();
  };

  const generateShopping = async () => {
    setBusy(true);
    const needed = aggregateIngredients(plans, byId);
    const auto = items.filter((item) => item.recipe_id);
    const manualKeys = new Set(items.filter((item) => !item.recipe_id).map((item) => item.label.toLowerCase()));
    const byLabel = new Map(auto.map((item) => [item.label.toLowerCase(), item]));
    const updates = [];
    const creations = [];

    needed.forEach((need) => {
      const existing = byLabel.get(need.key);
      if (existing) {
        if (existing.quantity !== need.quantity || existing.rayon !== need.rayon) {
          updates.push({ id: existing.id, quantity: need.quantity, rayon: need.rayon });
        }
        return;
      }
      if (manualKeys.has(need.key)) return;
      creations.push({
        label: need.label,
        quantity: need.quantity,
        rayon: need.rayon,
        recipe_id: need.recipe_id,
        week_start: start,
        checked: false,
      });
    });

    const neededKeys = new Set(needed.map((need) => need.key));
    const stale = auto.filter((item) => !neededKeys.has(item.label.toLowerCase()));

    if (updates.length) await base44.entities.ShoppingItem.bulkUpdate(updates);
    if (creations.length) await base44.entities.ShoppingItem.bulkCreate(creations);
    if (stale.length) await base44.entities.ShoppingItem.deleteMany({ id: { $in: stale.map((item) => item.id) } });

    setBusy(false);
    setTab('courses');
    await load();
  };

  const addItem = async (payload) => {
    await base44.entities.ShoppingItem.create({ ...payload, week_start: start, checked: false });
    await load();
  };

  const toggleItem = async (item) => {
    await base44.entities.ShoppingItem.update(item.id, { checked: !item.checked });
    await load();
  };

  const deleteItem = async (item) => {
    await base44.entities.ShoppingItem.delete(item.id);
    await load();
  };

  const clearChecked = async () => {
    await base44.entities.ShoppingItem.deleteMany({ week_start: start, checked: true });
    await load();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h1 className="font-display text-xl leading-tight">Repas</h1>
        <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-muted-foreground">
          Tes recettes, ton menu de la semaine et ta liste de courses — avec le coût estimé.
        </p>
      </header>

      <div className="flex gap-1 rounded-full bg-muted/70 p-1">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] transition-all',
              tab === value ? 'bg-card shadow-sm' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'menu' && (
        <>
          <div className="surface flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Cette semaine</p>
              <p className="mt-0.5 font-display text-sm">
                {plans.length} repas · ≈ {weeklyCost.toFixed(2)} €
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Budget</p>
              <p className={cn('mt-0.5 font-display text-sm', weeklyBudget && weeklyCost > weeklyBudget ? 'text-destructive' : 'text-primary')}>
                {weeklyBudget ? `${weeklyBudget.toFixed(0)} €` : 'non défini'}
              </p>
            </div>
          </div>

          <WeekMenu
            days={days}
            plans={plans}
            recipes={recipes}
            onPick={(date, mealType) => setPicker({ date, meal_type: mealType })}
            onRemove={removePlan}
            onToggle={togglePlan}
          />

          <div className="space-y-1.5">
            <button
              onClick={generateShopping}
              disabled={busy || !plans.length}
              className="w-full rounded-full border border-primary/30 bg-primary/10 px-4 py-3 text-[13px] font-medium text-primary disabled:opacity-50"
            >
              {busy
                ? 'Un instant…'
                : items.some((item) => item.recipe_id)
                  ? 'Recalculer ma liste de courses'
                  : 'Générer ma liste de courses'}
            </button>
            <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">
              La liste reprend les ingrédients de ton menu et additionne les quantités. Les articles cochés ou ajoutés à la main sont conservés.
            </p>
          </div>
        </>
      )}

      {tab === 'recettes' && (
        <>
          <RecipeFilters
            search={search}
            onSearch={setSearch}
            mealType={mealType}
            onMealType={setMealType}
            maxMinutes={maxMinutes}
            onMaxMinutes={setMaxMinutes}
            count={filteredRecipes.length}
          />

          <RecipeLibraryPanel recipes={recipes} onReload={load} />

          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(null); setRecipeOpen(true); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Nouvelle recette
            </button>
            {missingStarters > 0 && (
              <button
                onClick={seedStarters}
                disabled={busy}
                className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 text-[11px] font-medium text-primary disabled:opacity-50"
              >
                {busy ? 'Ajout…' : `+ ${missingStarters} de départ`}
              </button>
            )}
          </div>

          {filteredRecipes.length ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredRecipes.slice(0, visible).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onOpen={() => setViewing(recipe)}
                    onEdit={() => { setEditing(recipe); setRecipeOpen(true); }}
                    onDelete={() => deleteRecipe(recipe)}
                  />
                ))}
              </div>
              {filteredRecipes.length > visible && (
                <button
                  onClick={() => setVisible((value) => value + 30)}
                  className="w-full rounded-full border border-border/60 py-2.5 text-[11.5px] text-muted-foreground"
                >
                  Voir plus ({filteredRecipes.length - visible} restantes)
                </button>
              )}
            </>
          ) : recipes.length ? (
            <p className="surface px-4 py-8 text-center text-[12px] leading-relaxed text-muted-foreground">
              Aucune recette ne correspond à ces filtres.
            </p>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="Aucune recette"
              description="Commence avec 24 recettes simples et économiques, ou crée les tiennes."
              action={
                <button onClick={seedStarters} disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
                  {busy ? 'Ajout…' : 'Ajouter les recettes de départ'}
                </button>
              }
            />
          )}
        </>
      )}

      {tab === 'courses' && (
        <ShoppingList
          items={items}
          onToggle={toggleItem}
          onDelete={deleteItem}
          onAdd={addItem}
          onClearChecked={clearChecked}
        />
      )}

      <RecipeDialog
        key={editing?.id || 'new'}
        open={recipeOpen}
        onOpenChange={(open) => { setRecipeOpen(open); if (!open) setEditing(null); }}
        recipe={editing}
        onSave={saveRecipe}
      />

      <RecipeView recipe={viewing} onOpenChange={(open) => { if (!open) setViewing(null); }} />

      <RecipePicker
        open={Boolean(picker)}
        onOpenChange={(open) => { if (!open) setPicker(null); }}
        recipes={recipes}
        onSelect={addToPlan}
      />
    </div>
  );
}