import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MEAL_LABEL = {
  petit_dejeuner: 'petit-déjeuner',
  dejeuner: 'déjeuner',
  diner: 'dîner',
  collation: 'collation',
};

const RECIPE_SCHEMA = {
  type: 'object',
  properties: {
    recipes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nom du plat, court et reconnaissable.' },
          servings: { type: 'number', description: 'Nombre de portions (1 à 4).' },
          prep_minutes: { type: 'number', description: 'Temps total réaliste en minutes.' },
          estimated_cost: { type: 'number', description: 'Coût estimé en euros pour la recette entière.' },
          tags: { type: 'array', items: { type: 'string' }, description: '2 à 3 tags : rapide, économique, végétarien, protéiné…' },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'Ingrédient, sans quantité.' },
                quantity: { type: 'string', description: 'Quantité avec unité, ex. « 200 g », « 2 ». Vide si au goût.' },
              },
              required: ['label', 'quantity'],
            },
          },
          steps: { type: 'array', items: { type: 'string' }, description: '3 à 6 étapes courtes et ordonnées.' },
          notes: { type: 'string', description: 'Une astuce ou une variante, sinon chaîne vide.' },
        },
        required: ['name', 'ingredients', 'steps'],
      },
    },
  },
  required: ['recipes'],
};

const RAYON_KEYWORDS = [
  { rayon: 'Fruits', words: ['banane', 'pomme', 'orange', 'fraise', 'kiwi', 'myrtille', 'poire', 'pêche', 'framboise', 'avocat', 'raisin', 'mangue', 'citron', 'abricot'] },
  { rayon: 'Légumes', words: ['tomate', 'courgette', 'carotte', 'oignon', 'ail', 'salade', 'poivron', 'brocoli', 'haricot', 'épinard', 'champignon', 'concombre', 'aubergine', 'patate', 'pomme de terre', 'poireau', 'chou', 'betterave'] },
  { rayon: 'Viande & poisson', words: ['poulet', 'boeuf', 'bœuf', 'porc', 'saumon', 'thon', 'oeuf', 'œuf', 'jambon', 'dinde', 'crevette', 'poisson', 'steak', 'tofu', 'lardons'] },
  { rayon: 'Produits laitiers', words: ['lait', 'yaourt', 'fromage', 'beurre', 'crème', 'skyr', 'feta', 'parmesan', 'chèvre', 'mascarpone'] },
  { rayon: 'Féculents', words: ['riz', 'pâte', 'quinoa', 'pain', 'semoule', 'lentille', 'pois chiche', 'boulgour', 'flocon', 'avoine', 'farine', 'tortilla', 'polenta', 'nouille'] },
  { rayon: 'Épicerie', words: ['huile', 'sel', 'poivre', 'épice', 'miel', 'sucre', 'sauce', 'conserve', 'concentré', 'vinaigre', 'moutarde', 'cacao', 'levure', 'curry', 'cumin', 'noix', 'amande', 'cannelle'] },
  { rayon: 'Boissons', words: ['eau', 'jus', 'café', 'thé', 'infusion'] },
  { rayon: 'Surgelés', words: ['surgelé', 'glace'] },
];

function guessRayon(label) {
  const text = String(label || '').toLowerCase();
  const found = RAYON_KEYWORDS.find((group) =>
    group.words.some((word) => new RegExp(`(^|[^a-zà-ÿ])${word}`, 'i').test(text))
  );
  return found ? found.rayon : 'Autre';
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mealType = MEAL_LABEL[body.meal_type] ? body.meal_type : '';
    if (!mealType) return Response.json({ error: 'meal_type invalide' }, { status: 400 });
    const count = Math.min(25, Math.max(5, Math.round(Number(body.count) || 20)));

    const [existingPage, total] = await Promise.all([
      base44.entities.Recipe.filter({ meal_type: mealType }, { sort: '-created_date', limit: 150 }),
      base44.entities.Recipe.count({ meal_type: mealType }),
    ]);

    const existingNames = (existingPage.items || []).map((r) => r.name).filter(Boolean);
    const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
    const profile = profiles[0] || {};

    const prompt = `Tu constitues une bibliothèque de recettes pour l'application GlowUp, en français.

CATÉGORIE : ${MEAL_LABEL[mealType]}
NOMBRE DE RECETTES À CRÉER : ${count}

CONTRAINTES DU PROFIL (à respecter sans être restrictif) :
${JSON.stringify({
  regime: profile.diet || null,
  allergies: profile.allergies || null,
  aime: profile.food_likes || null,
  n_aime_pas: profile.food_dislikes || null,
  niveau_cuisine: profile.cooking_level || null,
  budget_mensuel: profile.monthly_budget || null,
})}

RECETTES DÉJÀ PRÉSENTES (ne les répète pas, et ne propose pas le même plat sous un autre nom) :
${existingNames.length ? JSON.stringify(existingNames.slice(0, 100)) : 'aucune'}

RÈGLES :
- Choisis les ${count} plats les plus connus et les plus préparés en France et dans le monde pour cette catégorie : des classiques reconnaissables, pas des inventions.
- Réalistes avec des ingrédients de supermarché, peu d'ustensiles, budget maîtrisé.
- 4 à 9 ingrédients avec des quantités exactes (« 200 g », « 2 », « 1 c. à s. »).
- 3 à 6 étapes courtes, dans l'ordre, compréhensibles sans recherche.
- « prep_minutes » réaliste, « estimated_cost » en euros pour la recette entière.
- Aucune calorie imposée, aucun régime restrictif, aucune mention médicale, aucun produit rare ou introuvable.
- Deux recettes ne doivent pas avoir le même nom.
- Français simple, phrases courtes, TUTOIEMENT dans les étapes (« mélange », « ajoute »).

Réponds uniquement via le format JSON demandé.`;

    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RECIPE_SCHEMA,
    });

    const known = new Set(existingNames.map((n) => n.toLowerCase()));
    const payload = [];
    (Array.isArray(raw?.recipes) ? raw.recipes : []).forEach((recipe) => {
      const name = String(recipe?.name || '').trim().slice(0, 120);
      if (!name) return;
      const key = name.toLowerCase();
      if (known.has(key)) return;
      known.add(key);
      const ingredients = (Array.isArray(recipe?.ingredients) ? recipe.ingredients : [])
        .slice(0, 12)
        .map((item) => {
          const label = String(item?.label || '').trim().slice(0, 120);
          if (!label) return null;
          return { label, quantity: String(item?.quantity || '').slice(0, 40), rayon: guessRayon(label) };
        })
        .filter(Boolean);
      const steps = (Array.isArray(recipe?.steps) ? recipe.steps : [])
        .slice(0, 8)
        .map((s) => String(s || '').trim().slice(0, 400))
        .filter(Boolean);
      if (!ingredients.length || steps.length < 2) return;
      payload.push({
        name,
        meal_type: mealType,
        servings: Math.min(6, Math.max(1, Math.round(Number(recipe?.servings) || 2))),
        prep_minutes: Math.min(240, Math.max(3, Math.round(Number(recipe?.prep_minutes) || 20))),
        estimated_cost: Math.min(60, Math.max(0.5, Number(recipe?.estimated_cost) || 4)),
        tags: (Array.isArray(recipe?.tags) ? recipe.tags : []).slice(0, 4).map((t) => String(t).slice(0, 40)),
        ingredients,
        steps,
        notes: String(recipe?.notes || '').slice(0, 400),
      });
    });

    if (payload.length) await base44.entities.Recipe.bulkCreate(payload);
    const after = await base44.entities.Recipe.count({ meal_type: mealType });

    return Response.json({ created: payload.length, total: after, meal_type: mealType });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}