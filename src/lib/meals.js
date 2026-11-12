import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export const MEAL_TYPES = [
  { value: 'petit_dejeuner', label: 'Petit-déjeuner' },
  { value: 'dejeuner', label: 'Déjeuner' },
  { value: 'diner', label: 'Dîner' },
  { value: 'collation', label: 'Collation' },
];

export const RAYONS = [
  'Légumes',
  'Fruits',
  'Viande & poisson',
  'Produits laitiers',
  'Féculents',
  'Épicerie',
  'Boissons',
  'Surgelés',
  'Hygiène',
  'Autre',
];

const RAYON_KEYWORDS = [
  { rayon: 'Fruits', words: ['banane', 'pomme', 'orange', 'fraise', 'kiwi', 'myrtille', 'poire', 'pêche', 'framboise', 'avocat', 'raisin', 'mangue', 'citron'] },
  { rayon: 'Légumes', words: ['tomate', 'courgette', 'carotte', 'oignon', 'ail', 'salade', 'poivron', 'brocoli', 'haricot', 'épinard', 'champignon', 'concombre', 'aubergine', 'patate', 'pomme de terre', 'poireau'] },
  { rayon: 'Viande & poisson', words: ['poulet', 'boeuf', 'bœuf', 'porc', 'saumon', 'thon', 'oeuf', 'œuf', 'jambon', 'dinde', 'crevette', 'poisson', 'steak', 'tofu'] },
  { rayon: 'Produits laitiers', words: ['lait', 'yaourt', 'fromage', 'beurre', 'crème', 'skyr', 'feta', 'parmesan'] },
  { rayon: 'Féculents', words: ['riz', 'pâte', 'quinoa', 'pain', 'semoule', 'lentille', 'pois chiche', 'boulgour', 'flocon', 'avoine', 'farine', 'tortilla'] },
  { rayon: 'Épicerie', words: ['huile', 'sel', 'poivre', 'épice', 'miel', 'sucre', 'sauce', 'conserve', 'concentré', 'vinaigre', 'moutarde', 'cacao', 'levure'] },
  { rayon: 'Boissons', words: ['eau', 'jus', 'café', 'thé', 'infusion'] },
  { rayon: 'Surgelés', words: ['surgelé', 'glace'] },
  { rayon: 'Hygiène', words: ['savon', 'shampoing', 'dentifrice', 'gel douche', 'coton', 'papier'] },
];

export function guessRayon(label = '') {
  const text = String(label).toLowerCase();
  const found = RAYON_KEYWORDS.find((group) =>
    group.words.some((word) => new RegExp(`(^|[^a-zà-ÿ])${word}`, 'i').test(text))
  );
  return found ? found.rayon : 'Autre';
}

export function parseIngredient(line = '') {
  const raw = String(line).trim();
  const match = raw.match(
    /^([\d.,/]+\s*(?:g|kg|ml|cl|l|c\.?\s?à\.?\s?s\.?|càs|càc|tranches?|bo[iî]tes?|sachets?|gousses?|pinc[eé]es?)?)\s+(?:de\s+|d['’])?(.+)$/i
  );
  const quantity = match ? match[1].trim() : '';
  const label = (match ? match[2] : raw).trim();
  return { label, quantity, rayon: guessRayon(label) };
}

const QUANTITY_PATTERN = /^([\d.,]+)\s*(.*)$/;

export function combineQuantities(values = []) {
  const totals = new Map();
  const others = [];
  values.forEach((raw) => {
    const text = String(raw || '').trim();
    if (!text) return;
    const match = text.match(QUANTITY_PATTERN);
    const value = match ? Number(match[1].replace(',', '.')) : NaN;
    if (Number.isNaN(value)) {
      if (!others.includes(text)) others.push(text);
      return;
    }
    const unit = match[2].trim();
    totals.set(unit, (totals.get(unit) || 0) + value);
  });
  const parts = [...totals.entries()].map(([unit, total]) => {
    const clean = Math.round(total * 100) / 100;
    const display = String(clean).replace('.', ',');
    return unit ? `${display} ${unit}` : display;
  });
  return [...parts, ...others].join(' + ');
}

export function aggregateIngredients(plans = [], byId) {
  const map = new Map();
  plans.forEach((plan) => {
    const recipe = byId.get(plan.recipe_id);
    if (!recipe) return;
    (recipe.ingredients || []).forEach((ingredient) => {
      const label = String(ingredient.label || '').trim();
      if (!label) return;
      const key = label.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          key,
          label,
          rayon: ingredient.rayon || guessRayon(label),
          quantities: [],
          recipe_id: recipe.id,
        });
      }
      map.get(key).quantities.push(ingredient.quantity || '');
    });
  });
  return [...map.values()].map((entry) => ({
    key: entry.key,
    label: entry.label,
    rayon: entry.rayon,
    quantity: combineQuantities(entry.quantities),
    recipe_id: entry.recipe_id,
  }));
}

export function filterRecipes(recipes = [], { search = '', mealType = '', maxMinutes = 0 } = {}) {
  const text = search.trim().toLowerCase();
  return recipes.filter((recipe) => {
    if (mealType && recipe.meal_type !== mealType) return false;
    if (maxMinutes && Number(recipe.prep_minutes || 0) > maxMinutes) return false;
    if (!text) return true;
    const haystack = [
      recipe.name,
      ...(recipe.tags || []),
      ...(recipe.ingredients || []).map((ingredient) => ingredient.label),
    ].join(' ').toLowerCase();
    return haystack.includes(text);
  });
}

export const weekStartKey = (date = new Date()) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

export const weekDayKeys = (startKey) =>
  [...Array(7)].map((_, i) => format(addDays(new Date(`${startKey}T12:00:00`), i), 'yyyy-MM-dd'));

export const dayLabel = (key) => format(new Date(`${key}T12:00:00`), 'EEEE d MMMM', { locale: fr });

export const shortDayLabel = (key) => format(new Date(`${key}T12:00:00`), 'EEE d', { locale: fr });

export const mealLabel = (value) => MEAL_TYPES.find((m) => m.value === value)?.label || 'Repas';