import { base44 } from '@/api/base44Client';

export const durationLabel = (minutes) => {
  const total = Number(minutes) || 0;
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`;
};

export const FEEDBACK_OPTIONS = [
  { value: 'reussi', label: 'J’ai tout réussi' },
  { value: 'partiel', label: 'J’ai réussi une partie' },
  { value: 'trop_difficile', label: 'C’était trop difficile' },
  { value: 'trop_facile', label: 'C’était trop facile' },
  { value: 'interrompu', label: 'Je n’ai pas pu terminer' },
  { value: 'non_fait', label: 'Je n’ai pas réalisé l’activité' },
];

export const FEEDBACK_LABEL = Object.fromEntries(FEEDBACK_OPTIONS.map((o) => [o.value, o.label]));

export const DIFFICULTY_OPTIONS = [
  { value: 'trop_facile', label: 'Plus facile que prévu' },
  { value: 'adaptee', label: 'Adaptée à mon niveau' },
  { value: 'trop_difficile', label: 'Plus difficile que prévu' },
];

export const PAIN_DOMAINS = ['sport', 'beaute'];

export const PROGRAM_DOMAINS = ['sport', 'beaute', 'alimentation', 'menage', 'culture', 'organisation', 'personnel'];

const step = (title, detail, minutes) => ({ title, detail, minutes });

const DEFAULT_POSTITS = [
  {
    name: 'Travail',
    category: 'travail',
    duration_minutes: 180,
    objective: 'Avancer sur tes tâches professionnelles ou scolaires, sans te disperser.',
    materials: 'Ordinateur ou cahier, casque si besoin',
    steps: [
      step('Couper les distractions', 'Téléphone en silencieux, notifications fermées, un seul document ouvert.', 3),
      step('Choisir la priorité', 'Écris sur un papier la tâche la plus utile du jour.', 2),
      step('Bloc de travail', 'Travaille 45 min sans t’arrêter, puis 10 min de pause réelle (debout, eau, air).', 45),
    ],
  },
  {
    name: 'École / révisions',
    category: 'travail',
    duration_minutes: 45,
    objective: 'Comprendre et retenir une notion, pas seulement relire.',
    materials: 'Cours, feuilles, stylo',
    steps: [
      step('Relire activement', 'Lis la leçon en surlignant uniquement les définitions et les formules.', 10),
      step('Fermer le cours', 'Récite à voix haute ce que tu as retenu, sans regarder.', 10),
      step('Se tester', 'Écris 3 questions sur la leçon et réponds-y de mémoire.', 20),
    ],
  },
  {
    name: 'Séance de sport',
    category: 'sport',
    duration_minutes: 40,
    objective: 'Bouger avec une séance structurée : échauffement, corps de séance, retour au calme.',
    materials: 'Tenue souple, serviette, eau',
    steps: [
      step('Échauffement', '3 min de marche sur place, 20 cercles d’épaules, 10 rotations de bassin, 10 montées de genoux.', 5),
      step('Corps de séance', '3 tours : 10 squats au poids du corps, 8 pompes inclinées sur un support stable, 20 s de gainage. Repos 60 s entre les tours.', 25),
      step('Retour au calme', 'Respiration lente 4 s inspiration / 6 s expiration, puis étirement des cuisses 20 s par côté.', 10),
    ],
  },
  {
    name: 'Soins du visage — matin',
    category: 'beaute',
    duration_minutes: 10,
    objective: 'Nettoyer, hydrater et protéger ta peau sans l’agresser.',
    materials: 'Nettoyant doux, crème hydratante, protection solaire 50',
    steps: [
      step('Nettoyer', 'Eau tiède, une noisette de nettoyant doux, mouvements circulaires 30 s, rinçage à l’eau tiède.', 3),
      step('Hydrater', 'Sur peau encore humide, applique une noisette de crème en tapotant, sans frotter.', 2),
      step('Protéger', 'Deux doigts de protection solaire 50 sur le visage et le cou, tous les matins, même en hiver.', 2),
    ],
  },
  {
    name: 'Routine cheveux',
    category: 'beaute',
    duration_minutes: 30,
    objective: 'Laver sans agresser la fibre et laisser le soin agir le temps nécessaire.',
    materials: 'Shampooing doux, masque ou après-shampooing',
    steps: [
      step('Mouiller et laver', 'Eau tiède, shampooing dilué dans la main, massage du cuir chevelu 30 s, rinçage complet.', 6),
      step('Poser le soin', 'Applique sur les longueurs seulement, respecte le temps de pose indiqué sur le produit (souvent 3 à 5 min).', 5),
      step('Rincer et sécher', 'Rinçage à l’eau froide 30 s, essorage doux à la serviette, séchage à l’air libre si possible.', 8),
    ],
  },
  {
    name: 'Rangement express',
    category: 'menage',
    duration_minutes: 15,
    objective: 'Remettre de l’ordre dans une seule zone, en actions simples et ordonnées.',
    materials: 'Un sac pour le linge, une caisse pour ce qui traîne',
    steps: [
      step('Vider le sol', 'Ramasse tout ce qui traîne par terre et pose-le sur le lit.', 4),
      step('Trier', 'Vêtements dans le sac, objets à leur place, papiers inutiles à la poubelle.', 6),
      step('Finir par le bureau', 'Dégage la surface, garde seulement l’essentiel, remets les objets à leur place.', 5),
    ],
  },
  {
    name: 'Ménage d’une pièce',
    category: 'menage',
    duration_minutes: 30,
    objective: 'Nettoyer une pièce du sol au plafond, sans t’épuiser.',
    materials: 'Chiffon, produit multi-surfaces, aspirateur ou balai',
    steps: [
      step('Désencombrer', 'Retire ce qui ne devrait pas être dans la pièce.', 5),
      step('Dépoussiérer', 'De haut en bas : étagères, rebords, surfaces. Un chiffon humide suffit.', 10),
      step('Sol', 'Aspire ou balaie, puis passe la serpillière si nécessaire.', 12),
      step('Vérification', 'Regarde la pièce depuis la porte : deux choses à corriger maximum.', 3),
    ],
  },
  {
    name: 'Leçon de culture',
    category: 'culture',
    duration_minutes: 20,
    objective: 'Comprendre un sujet précis et être capable de l’expliquer en 3 phrases.',
    materials: 'Cahier ou notes',
    steps: [
      step('Choisir le sujet', 'Un seul sujet, formulé en question (ex. « Pourquoi les volcans entrent-ils en éruption ? »).', 2),
      step('Étudier', 'Lis ou regarde une source fiable, note 3 notions clés avec tes mots.', 12),
      step('Restituer', 'Ferme la source et résume le sujet à voix haute en 3 phrases.', 6),
    ],
  },
  {
    name: 'Lecture',
    category: 'culture',
    duration_minutes: 30,
    objective: 'Lire régulièrement, sans objectif de performance.',
    materials: 'Un livre',
    steps: [
      step('Installer', 'Téléphone hors de portée, un endroit stable.', 2),
      step('Lire', '20 minutes sans t’arrêter, même si tu lis lentement.', 20),
      step('Noter une phrase', 'Recopie une phrase qui t’a marqué et pourquoi.', 5),
    ],
  },
  {
    name: 'Préparation des repas',
    category: 'alimentation',
    duration_minutes: 45,
    objective: 'Préparer ce qui te fera gagner du temps dans la semaine.',
    materials: 'Boîtes hermétiques, planche, couteau',
    steps: [
      step('Sortir les ingrédients', 'Sors tout ce que tu vas utiliser et vérifie les quantités.', 5),
      step('Laver et couper', 'Lave les légumes et coupe-les en morceaux qui cuisent en même temps.', 15),
      step('Cuire et répartir', 'Cuisson simple (four ou poêle), puis répartis dans des boîtes étiquetées avec la date.', 20),
    ],
  },
  {
    name: 'Bloc de concentration',
    category: 'organisation',
    duration_minutes: 25,
    objective: 'Une seule tâche, un seul bloc, aucune distraction.',
    materials: 'Minuteur',
    steps: [
      step('Écrire la tâche', 'Une phrase précise sur papier : ce que tu commences, et à quoi tu sauras que c’est fini.', 2),
      step('Minuteur 20 min', 'Coupe tout ce qui sonne ou clignote, lance le minuteur, commence par l’étape la plus simple.', 20),
      step('Noter l’avancement', 'Écris où tu en es et la première action de la prochaine fois.', 3),
    ],
  },
  {
    name: 'Marche',
    category: 'sport',
    duration_minutes: 30,
    objective: 'Bouger en douceur, sans matériel.',
    materials: 'Chaussures confortables',
    steps: [
      step('5 premières minutes', 'Marche tranquille, épaules relâchées, respirations profondes.', 5),
      step('Rythme un peu plus soutenu', 'Marche d’un bon pas, sans être essoufflé au point de ne plus pouvoir parler.', 20),
      step('Retour au calme', 'Ralentis les 5 dernières minutes et étire les mollets.', 5),
    ],
  },
  {
    name: 'Routine du soir',
    category: 'repos',
    duration_minutes: 20,
    objective: 'Fermer la journée et préparer le sommeil.',
    materials: 'Aucun',
    steps: [
      step('Couper les écrans', 'Écrans éteints, téléphone en charge hors de la chambre.', 2),
      step('Soin du soir', 'Routine peau du soir, gestes lents, lumière douce.', 8),
      step('Préparer demain', 'Note les 3 priorités de demain, puis une respiration lente 10 fois.', 10),
    ],
  },
];

/** Crée la bibliothèque de post-it de base une seule fois par utilisateur. */
export async function ensureDefaultTemplates() {
  const existing = await base44.entities.ActivityTemplate.filter({ origin: 'defaut' }, { limit: 1 });
  if ((existing.items || []).length) return;
  await base44.entities.ActivityTemplate.bulkCreate(
    DEFAULT_POSTITS.map((item) => ({
      ...item,
      origin: 'defaut',
      active: true,
    }))
  );
}

export function occurrencePayload(template, date, startTime) {
  return {
    title: template.name,
    description: template.objective || '',
    category: template.category,
    date,
    start_time: startTime,
    duration_minutes: Number(template.duration_minutes) || 30,
    priority: 'moyenne',
    status: 'a_faire',
    recurrence: 'aucune',
    generated: template.origin === 'ia',
    template_id: template.id,
    program_id: template.program_id || '',
    domain: template.domain || '',
    objective: template.objective || '',
    instructions: template.instructions || '',
    materials: template.materials || '',
    errors: template.errors || '',
    adaptations: template.adaptations || '',
    caution: template.caution || '',
    steps: template.steps || [],
  };
}

export async function createOccurrence(template, date, startTime) {
  return base44.entities.Task.create(occurrencePayload(template, date, startTime));
}