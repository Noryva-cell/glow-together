export function mimoState({ pendingCount = 0, doneCount = 0, remaining = 0, freeMinutes = 120, overloaded = false }) {
  const hour = new Date().getHours();
  const plural = pendingCount > 1;

  if (overloaded) {
    return {
      mood: 'encouragement',
      message: `Ta journée est chargée : ${remaining} min de tâches pour ${freeMinutes} min disponibles. On peut alléger, ce n’est pas grave.`,
    };
  }
  if (pendingCount === 0 && doneCount > 0) {
    return {
      mood: 'felicitation',
      message: `${doneCount} chose${doneCount > 1 ? 's' : ''} terminée${doneCount > 1 ? 's' : ''} aujourd’hui. Bien joué, tu peux souffler.`,
    };
  }
  if (pendingCount === 0) {
    return { mood: 'repos', message: 'Rien d’imposé aujourd’hui. On avance doucement sur un objectif, ou on se repose ?' };
  }
  if (hour < 12) {
    return {
      mood: 'accueil',
      message: `Bonjour ! ${pendingCount} chose${plural ? 's' : ''} t’attend${plural ? 'ent' : ''} aujourd’hui, ${remaining} min au total. On prépare ta journée ensemble ?`,
    };
  }
  return {
    mood: 'encouragement',
    message: `Il reste ${pendingCount} chose${plural ? 's' : ''} (${remaining} min). On commence par une toute petite étape ?`,
  };
}

// Visuels du personnage, générés à partir de la référence de design fournie
export const MIMO_IMAGES = {
  calme: 'https://media.base44.com/images/public/6ae7a99285cdfcc495358c78/6039bf894_generated_image.png',
  enthousiaste: 'https://media.base44.com/images/public/6ae7a99285cdfcc495358c78/fe245ef13_generated_image.png',
  reflexion: 'https://media.base44.com/images/public/6ae7a99285cdfcc495358c78/908b8c823_generated_image.png',
  ecoute: 'https://media.base44.com/images/public/6ae7a99285cdfcc495358c78/57151fa24_generated_image.png',
};

const ENERGETIC_MOODS = ['encouragement', 'felicitation', 'cuisine'];
const ATTENTIVE_MOODS = ['ecoute', 'concentration'];

export function mimoImage(mood) {
  if (mood === 'reflexion') return MIMO_IMAGES.reflexion;
  if (ATTENTIVE_MOODS.includes(mood)) return MIMO_IMAGES.ecoute;
  return ENERGETIC_MOODS.includes(mood) ? MIMO_IMAGES.enthousiaste : MIMO_IMAGES.calme;
}

export const MOOD_LABEL = {
  accueil: 'Bonjour',
  ecoute: 'À l’écoute',
  reflexion: 'Je réfléchis',
  explication: 'J’explique',
  encouragement: 'Je t’encourage',
  felicitation: 'Bravo',
  concentration: 'Concentration',
  cuisine: 'En cuisine',
  beaute: 'Routine beauté',
  repos: 'Repos',
};