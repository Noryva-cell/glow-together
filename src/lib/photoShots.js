// Guide de prise de vue : une photo ne suffit pas pour juger une peau ou des cheveux.
export const PHOTO_SHOTS = {
  skin: [
    { key: 'face', label: 'Visage de face', hint: 'Regard dans l’objectif, visage détendu, cheveux relevés.' },
    { key: 'left', label: 'Côté gauche', hint: 'Tourne la tête d’un quart : on voit ta joue et ta tempe gauches.' },
    { key: 'right', label: 'Côté droit', hint: 'Même chose de l’autre côté, sans changer de place.' },
  ],
  hair: [
    { key: 'roots', label: 'Racines et cuir chevelu', hint: 'Écarte les cheveux en plusieurs raies, près de la fenêtre.' },
    { key: 'lengths', label: 'Longueurs et pointes', hint: 'Cheveux détachés et brossés, une prise de face et une de dos.' },
  ],
};

export const PHOTO_GUIDE = {
  skin: {
    when: 'Le matin, à jeun, sur peau propre et nue : ni maquillage, ni crème. C’est là qu’elle est la plus fidèle.',
    tips: [
      'Lumière du jour, face à une fenêtre : jamais de plafonnier, de contre-jour ni de flash direct.',
      'Appareil à 30 cm, à hauteur des yeux, visage détendu, sans lunettes.',
      'Trois prises : de face, puis chaque profil, pour voir les zones que la face cache.',
      'Aucun filtre, aucune retouche : l’analyse doit voir la vraie peau.',
    ],
  },
  hair: {
    when: 'Juste après le lavage, cheveux essorés à l’air libre, sans produit coiffant : c’est là qu’on voit le vrai état des racines et des longueurs.',
    tips: [
      'Lumière du jour près d’une fenêtre, sans flash direct.',
      'Racines : sépare les cheveux en plusieurs raies pour montrer le cuir chevelu.',
      'Longueurs : cheveux détachés et brossés, de face puis de dos.',
      'Prends les photos au même moment du cycle de lavage à chaque fois, pour comparer ce qui est comparable.',
    ],
  },
};

export function shotsFor(kind) {
  return PHOTO_SHOTS[kind === 'hair' ? 'hair' : 'skin'];
}