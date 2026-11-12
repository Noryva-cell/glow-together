const QUICK_ACTIONS = [
  { label: 'Organiser ma journée', prompt: 'Aide-moi à organiser ma journée avec le temps que j’ai vraiment.' },
  { label: 'Créer une routine', prompt: 'Prépare-moi une routine du soir simple, adaptée à mon profil.' },
  { label: 'Je manque de motivation', prompt: 'Je n’ai pas envie de commencer. Aide-moi à faire une toute petite première étape.' },
  { label: 'Préparer ma semaine', prompt: 'Propose-moi un programme pour la semaine prochaine selon mes disponibilités.' },
  { label: 'Faire le bilan', prompt: 'Aide-moi à faire le bilan de ma journée et à décider de la suite.' },
  { label: 'Réorganiser demain', prompt: 'Réorganise mon planning de demain en respectant mes obligations.' },
];

export default function QuickActions({ onPick, disabled }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onPick(action.prompt)}
          disabled={disabled}
          className="shrink-0 rounded-full border border-border/80 bg-card px-3.5 py-2 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}