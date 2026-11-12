import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MEAL_TYPES, parseIngredient } from '@/lib/meals';

const field = 'mt-1 w-full rounded-xl border border-border/70 bg-card/70 px-3 py-2 text-sm';

export default function RecipeDialog({ open, onOpenChange, recipe, onSave }) {
  const [form, setForm] = useState(() => ({
    name: recipe?.name || '',
    meal_type: recipe?.meal_type || 'dejeuner',
    servings: recipe?.servings ?? 2,
    prep_minutes: recipe?.prep_minutes ?? 20,
    estimated_cost: recipe?.estimated_cost ?? 0,
    tags: (recipe?.tags || []).join(', '),
    ingredients: (recipe?.ingredients || [])
      .map((ing) => [ing.quantity, ing.label].filter(Boolean).join(' '))
      .join('\n'),
    steps: (recipe?.steps || []).join('\n'),
  }));

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      meal_type: form.meal_type,
      servings: Number(form.servings) || 1,
      prep_minutes: Number(form.prep_minutes) || 0,
      estimated_cost: Number(form.estimated_cost) || 0,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      ingredients: form.ingredients.split('\n').map((line) => line.trim()).filter(Boolean).map(parseIngredient),
      steps: form.steps.split('\n').map((line) => line.trim()).filter(Boolean),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-base">{recipe ? 'Modifier la recette' : 'Nouvelle recette'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nom</Label>
            <Input className={field} value={form.name} onChange={set('name')} placeholder="Bowl poulet et riz" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Repas</Label>
              <select className={field} value={form.meal_type} onChange={set('meal_type')}>
                {MEAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Portions</Label>
              <Input type="number" min="1" className={field} value={form.servings} onChange={set('servings')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Durée (min)</Label>
              <Input type="number" min="0" className={field} value={form.prep_minutes} onChange={set('prep_minutes')} />
            </div>
            <div>
              <Label>Coût estimé (€)</Label>
              <Input type="number" min="0" step="0.1" className={field} value={form.estimated_cost} onChange={set('estimated_cost')} />
            </div>
          </div>

          <div>
            <Label>Ingrédients</Label>
            <Textarea
              className={`${field} min-h-[92px]`}
              value={form.ingredients}
              onChange={set('ingredients')}
              placeholder={'200 g riz\n2 filets de poulet\n1 courgette'}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Un ingrédient par ligne, avec la quantité devant. Le rayon est deviné automatiquement.</p>
          </div>

          <div>
            <Label>Étapes</Label>
            <Textarea
              className={`${field} min-h-[92px]`}
              value={form.steps}
              onChange={set('steps')}
              placeholder={'Cuire le riz\nSaisir le poulet 8 minutes'}
            />
          </div>

          <div>
            <Label>Étiquettes</Label>
            <Input className={field} value={form.tags} onChange={set('tags')} placeholder="végétarien, rapide, économique" />
          </div>

          <Button className="w-full rounded-full py-5" onClick={submit} disabled={!form.name.trim()}>
            {recipe ? 'Enregistrer' : 'Créer la recette'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}