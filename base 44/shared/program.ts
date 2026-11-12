export const DOMAINS = ['sport', 'beaute', 'alimentation', 'menage', 'culture', 'organisation', 'personnel'];

export const DOMAIN_LABEL = {
  sport: 'sport',
  beaute: 'soins et beauté',
  alimentation: 'repas et cuisine',
  menage: 'rangement et ménage',
  culture: 'culture et apprentissage',
  organisation: 'organisation et discipline',
  personnel: 'confiance et bien-être',
};

export const CATEGORY_BY_DOMAIN = {
  sport: 'sport',
  beaute: 'beaute',
  alimentation: 'alimentation',
  menage: 'menage',
  culture: 'culture',
  organisation: 'organisation',
  personnel: 'personnel',
};

const str = (value, max) => String(value ?? '').trim().slice(0, max);
const num = (value, fallback, min, max) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

export function cleanSteps(list) {
  return (Array.isArray(list) ? list : [])
    .slice(0, 12)
    .map((step) => ({
      title: str(step?.title, 140),
      detail: str(step?.detail, 700),
      minutes: num(step?.minutes, 5, 1, 240),
    }))
    .filter((step) => step.title && step.detail);
}

export function cleanSession(item) {
  return {
    title: str(item?.title, 140),
    objective: str(item?.objective, 500),
    minutes: num(item?.minutes, 30, 5, 240),
    materials: str(item?.materials, 500),
    instructions: str(item?.instructions, 2500),
    errors: str(item?.errors, 800),
    adaptations: str(item?.adaptations, 800),
    caution: str(item?.caution, 400),
    steps: cleanSteps(item?.steps),
  };
}

export function cleanMilestones(list) {
  return (Array.isArray(list) ? list : [])
    .slice(0, 6)
    .map((m) => ({ title: str(m?.title, 160), criteria: str(m?.criteria, 300), done: false }))
    .filter((m) => m.title);
}

/**
 * Nettoie un programme généré par l'IA. Une séance sans étapes détaillées est
 * rejetée : c'est précisément ce que l'on veut éviter (consignes vagues).
 */
export function cleanProgram(raw) {
  const sessions = (Array.isArray(raw?.sessions) ? raw.sessions : [])
    .map(cleanSession)
    .filter((session) => session.title && session.steps.length >= 2)
    .slice(0, 4);

  return {
    objective: str(raw?.objective, 400),
    start_level: str(raw?.start_level, 200),
    target: str(raw?.target, 300),
    summary: str(raw?.summary, 800),
    safety: str(raw?.safety, 500),
    rationale: str(raw?.rationale, 800),
    review_weeks: num(raw?.review_weeks, 2, 1, 8),
    milestones: cleanMilestones(raw?.milestones),
    items: sessions,
  };
}

export const PROGRAM_SCHEMA = {
  type: 'object',
  properties: {
    objective: { type: 'string', description: 'Objectif reformulé, mesurable.' },
    start_level: { type: 'string', description: 'Niveau de départ constaté, en une phrase courte.' },
    target: { type: 'string', description: 'Résultat visé et horizon réaliste.' },
    summary: { type: 'string', description: '2 à 3 phrases : la logique du parcours.' },
    rationale: { type: 'string', description: 'Pourquoi ce contenu et cette progression (si adaptation : ce qui change par rapport à la version précédente).' },
    safety: { type: 'string', description: 'Une phrase de vigilance adaptée au domaine.' },
    review_weeks: { type: 'number', description: 'Dans combien de semaines réévaluer (1 à 8).' },
    milestones: {
      type: 'array',
      description: '3 paliers de progression au maximum.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Nom du palier.' },
          criteria: { type: 'string', description: 'Critère observable pour le valider.' },
        },
        required: ['title', 'criteria'],
      },
    },
    sessions: {
      type: 'array',
      description: '3 séances/activités types, entièrement détaillées.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Nom de la séance, ex. « Séance progression pompes — étape 1 ».' },
          objective: { type: 'string', description: 'Ce que cette séance fait progresser.' },
          minutes: { type: 'number', description: 'Durée totale réaliste en minutes.' },
          materials: { type: 'string', description: 'Matériel ou produits nécessaires (vide si aucun).' },
          instructions: { type: 'string', description: 'Consignes générales : déroulé, rythme, respiration.' },
          errors: { type: 'string', description: 'Erreurs fréquentes à éviter, concrètes.' },
          adaptations: { type: 'string', description: 'Version plus simple et version plus difficile.' },
          caution: { type: 'string', description: 'Signe pour arrêter.' },
          steps: {
            type: 'array',
            description: 'Étapes numérotées, dans l’ordre, exécutables sans recherche.',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Nom de l’étape, ex. « Pompes contre le mur ».' },
                detail: { type: 'string', description: 'Position de départ, mouvement, respiration, séries × répétitions ou durée, repos, point technique.' },
                minutes: { type: 'number', description: 'Durée de l’étape en minutes.' },
              },
              required: ['title', 'detail'],
            },
          },
        },
        required: ['title', 'objective', 'minutes', 'steps'],
      },
    },
  },
  required: ['objective', 'sessions'],
};

/**
 * Désactive les modèles de post-it de la version précédente puis crée
 * un modèle par séance du programme : c'est la bibliothèque du planning.
 */
export async function syncProgramTemplates(base44, program) {
  if (!program?.id) return [];

  await base44.entities.ActivityTemplate.updateMany(
    { domain: program.domain, origin: 'ia', active: true, program_id: { $ne: program.id } },
    { $set: { active: false } }
  );

  const existing = await base44.entities.ActivityTemplate.filter({ program_id: program.id });
  const known = new Set((existing || []).map((t) => t.name));

  const toCreate = (program.items || [])
    .filter((item) => item?.title && !known.has(item.title))
    .slice(0, 4)
    .map((item) => ({
      name: item.title,
      category: CATEGORY_BY_DOMAIN[program.domain] || 'organisation',
      domain: program.domain,
      duration_minutes: Number(item.minutes) || 30,
      objective: item.objective || '',
      instructions: item.instructions || '',
      materials: item.materials || '',
      errors: item.errors || '',
      adaptations: item.adaptations || '',
      caution: item.caution || '',
      steps: item.steps || [],
      program_id: program.id,
      origin: 'ia',
      active: true,
    }));

  if (toCreate.length) await base44.entities.ActivityTemplate.bulkCreate(toCreate);
  return toCreate;
}

export async function archiveDomainPrograms(base44, domain, keepId) {
  await base44.entities.Program.updateMany(
    { domain, status: 'actif', ...(keepId ? { id: { $ne: keepId } } : {}) },
    { $set: { active: false, status: 'archive' } }
  );
  await base44.entities.Program.updateMany(
    { domain, status: 'propose', ...(keepId ? { id: { $ne: keepId } } : {}) },
    { $set: { active: false, status: 'archive' } }
  );
}