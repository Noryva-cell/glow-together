export const GOAL_OPTIONS = [
  { value: 'apparence', label: 'Améliorer mon apparence générale', category: 'beaute' },
  { value: 'peau', label: 'Améliorer ma peau', category: 'beaute' },
  { value: 'cheveux', label: 'Améliorer mes cheveux', category: 'beaute' },
  { value: 'force', label: 'Développer ma force et ma condition physique', category: 'sport' },
  { value: 'sport_specifique', label: 'Progresser dans un sport précis', category: 'sport' },
  { value: 'exercice', label: 'Réussir un exercice sportif précis', category: 'sport' },
  { value: 'mobilite', label: 'Améliorer ma mobilité, mon endurance ou ma posture', category: 'sport' },
  { value: 'alimentation', label: 'Améliorer mon alimentation', category: 'alimentation' },
  { value: 'cuisiner', label: 'Apprendre à cuisiner', category: 'alimentation' },
  { value: 'culture', label: 'Développer ma culture générale', category: 'culture' },
  { value: 'langue', label: 'Apprendre une langue ou une compétence', category: 'culture' },
  { value: 'discipline', label: 'Améliorer ma discipline', category: 'organisation' },
  { value: 'procrastination', label: 'Arrêter de procrastiner', category: 'organisation' },
  { value: 'temps', label: 'Mieux organiser mon temps', category: 'organisation' },
  { value: 'rangement', label: 'Ranger ma chambre, ma maison, mon bureau', category: 'menage' },
  { value: 'confiance', label: 'Développer ma confiance en moi', category: 'personnel' },
  { value: 'sommeil', label: 'Améliorer mon sommeil et mes habitudes', category: 'personnel' },
];

export const GOAL_LABEL = Object.fromEntries(GOAL_OPTIONS.map((g) => [g.value, g.label]));

// Domaines pour lesquels Mimo prépare un programme adapté
export const DOMAINS = [
  {
    value: 'sport',
    label: 'Sport',
    placeholder: 'Ex. apprendre à faire 10 pompes propres, me lancer dans la callisthénie',
    hint: 'Mimo part de ton niveau et progresse par étapes.',
  },
  {
    value: 'beaute',
    label: 'Soins & beauté',
    placeholder: 'Ex. réduire mes boutons sur les joues, avoir les cheveux moins secs',
    hint: 'Des gestes doux, sans produit agressif.',
  },
  {
    value: 'alimentation',
    label: 'Repas',
    placeholder: 'Ex. manger équilibré le midi au travail, cuisiner 3 recettes simples',
    hint: 'Mimo respecte ton budget, ton régime et tes allergies.',
  },
  {
    value: 'menage',
    label: 'Rangement',
    placeholder: 'Ex. ranger mon bureau une fois pour toutes, 15 min par jour',
    hint: 'Des zones et des durées réalistes.',
  },
  {
    value: 'culture',
    label: 'Culture',
    placeholder: 'Ex. comprendre l’histoire de l’art, lire 10 pages par jour',
    hint: 'Un rythme tenable sur la semaine.',
  },
  {
    value: 'organisation',
    label: 'Organisation',
    placeholder: 'Ex. arrêter de repousser mes devoirs, mieux gérer mon temps',
    hint: 'Des méthodes simples à appliquer tout de suite.',
  },
  {
    value: 'personnel',
    label: 'Confiance & bien-être',
    placeholder: 'Ex. dormir mieux, moins stresser avant un examen',
    hint: 'Aucun diagnostic, uniquement des habitudes concrètes.',
  },
];

export const DOMAIN_LABEL = Object.fromEntries(DOMAINS.map((d) => [d.value, d.label]));

export const CATEGORIES = [
  { value: 'sport', label: 'Sport', dot: 'bg-[#7C9A81]', chip: 'bg-[#7C9A81]/12 text-[#5C7A61]' },
  { value: 'beaute', label: 'Beauté', dot: 'bg-[#C98F80]', chip: 'bg-[#C98F80]/12 text-[#A96A5B]' },
  { value: 'alimentation', label: 'Alimentation', dot: 'bg-[#C7A15E]', chip: 'bg-[#C7A15E]/14 text-[#9A7A3C]' },
  { value: 'culture', label: 'Culture', dot: 'bg-[#7E93A8]', chip: 'bg-[#7E93A8]/12 text-[#5B7185]' },
  { value: 'menage', label: 'Ménage', dot: 'bg-[#A98F7A]', chip: 'bg-[#A98F7A]/14 text-[#856B58]' },
  { value: 'organisation', label: 'Organisation', dot: 'bg-[#8F7FA8]', chip: 'bg-[#8F7FA8]/12 text-[#6C5C86]' },
  { value: 'travail', label: 'Travail / Études', dot: 'bg-[#6E7B8B]', chip: 'bg-[#6E7B8B]/12 text-[#4F5C6B]' },
  { value: 'repos', label: 'Repos', dot: 'bg-[#A8B5A0]', chip: 'bg-[#A8B5A0]/16 text-[#6F7F68]' },
  { value: 'personnel', label: 'Personnel', dot: 'bg-[#C4849A]', chip: 'bg-[#C4849A]/12 text-[#A05C74]' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

export const PRIORITIES = [
  { value: 'haute', label: 'Haute' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'basse', label: 'Basse' },
];

export const PRIORITY_ORDER = { haute: 0, moyenne: 1, basse: 2 };

export const DAYS = [
  { js: 1, key: 'lun', short: 'Lun', label: 'Lundi' },
  { js: 2, key: 'mar', short: 'Mar', label: 'Mardi' },
  { js: 3, key: 'mer', short: 'Mer', label: 'Mercredi' },
  { js: 4, key: 'jeu', short: 'Jeu', label: 'Jeudi' },
  { js: 5, key: 'ven', short: 'Ven', label: 'Vendredi' },
  { js: 6, key: 'sam', short: 'Sam', label: 'Samedi' },
  { js: 0, key: 'dim', short: 'Dim', label: 'Dimanche' },
];

export const BLOCK_TYPES = [
  { value: 'travail', label: 'Travail' },
  { value: 'etudes', label: 'Études' },
  { value: 'trajet', label: 'Trajet' },
  { value: 'sport', label: 'Entraînement' },
  { value: 'personnel', label: 'Obligation personnelle' },
  { value: 'indisponible', label: 'Indisponible' },
];

// Modèles de tâches générées depuis les objectifs
export const TASK_TEMPLATES = {
  apparence: [{ title: 'Rituel apparence (soin + tenue préparée)', category: 'beaute', duration: 15, perWeek: 2, slot: 'soir' }],
  peau: [{ title: 'Routine peau du soir', category: 'beaute', duration: 10, perWeek: 5, slot: 'soir' }],
  cheveux: [{ title: 'Soin cheveux', category: 'beaute', duration: 20, perWeek: 2, slot: 'soir' }],
  force: [{ title: 'Séance de renforcement musculaire', category: 'sport', duration: 40, perWeek: 3, slot: 'soir' }],
  sport_specifique: [{ title: 'Entraînement spécifique', category: 'sport', duration: 45, perWeek: 2, slot: 'soir' }],
  exercice: [{ title: 'Entraînement ciblé (exercice objectif)', category: 'sport', duration: 25, perWeek: 3, slot: 'matin' }],
  mobilite: [{ title: 'Mobilité et étirements', category: 'sport', duration: 15, perWeek: 4, slot: 'matin' }],
  alimentation: [{ title: 'Préparer un repas maison', category: 'alimentation', duration: 30, perWeek: 3, slot: 'soir' }],
  cuisiner: [{ title: 'Atelier cuisine (nouvelle recette)', category: 'alimentation', duration: 45, perWeek: 1, slot: 'soir' }],
  culture: [{ title: 'Leçon de culture générale', category: 'culture', duration: 15, perWeek: 5, slot: 'soir' }],
  langue: [{ title: 'Apprentissage de la langue', category: 'culture', duration: 20, perWeek: 4, slot: 'soir' }],
  discipline: [{ title: 'Bloc de concentration', category: 'organisation', duration: 25, perWeek: 5, slot: 'matin' }],
  procrastination: [{ title: 'Priorité du jour (première action)', category: 'organisation', duration: 15, perWeek: 5, slot: 'matin' }],
  temps: [{ title: 'Revue du planning et des priorités', category: 'organisation', duration: 15, perWeek: 3, slot: 'soir' }],
  rangement: [{ title: 'Ranger 10 minutes', category: 'menage', duration: 10, perWeek: 5, slot: 'soir' }],
  confiance: [{ title: 'Journal : 3 réussites du jour', category: 'personnel', duration: 10, perWeek: 3, slot: 'soir' }],
  sommeil: [{ title: 'Routine du soir sans écran', category: 'repos', duration: 20, perWeek: 5, slot: 'soir' }],
};

export const COACHING_STYLES = [
  { value: 'doux', label: 'Doux', desc: 'Des mots calmes, sans pression.' },
  { value: 'encourageant', label: 'Encourageant', desc: 'Des encouragements et des rappels positifs.' },
  { value: 'direct', label: 'Direct', desc: 'Des consignes claires et concises.' },
  { value: 'structure', label: 'Structuré', desc: 'Des étapes précises, un cadre rassurant.' },
];

export const ROUTINE_DEFAULT = {
  matin: ['Boire un grand verre d’eau', 'Soin du matin', 'Petit-déjeuner posé', '3 priorités du jour'],
  soir: ['Ranger le plan de travail', 'Routine peau du soir', 'Écrans coupés', '3 réussites du jour'],
};