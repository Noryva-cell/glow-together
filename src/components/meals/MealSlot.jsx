import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MealSlot({ label, plan, recipe, onPick, onRemove, onToggle }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-12 shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>

      {plan ? (
        <>
          <button
            onClick={onToggle}
            aria-label="Marquer ce repas comme fait"
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
              plan.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
            )}
          >
            {plan.done && <Check className="h-2.5 w-2.5" />}
          </button>
          <span className={cn('flex-1 truncate text-[13px]', plan.done && 'text-muted-foreground line-through')}>
            {recipe?.name || 'Recette supprimée'}
          </span>
          <button onClick={onRemove} aria-label="Retirer du menu" className="shrink-0 text-muted-foreground hover:text-destructive">
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <button
          onClick={onPick}
          className="flex-1 rounded-xl border border-dashed border-border/70 px-2 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          + Ajouter
        </button>
      )}
    </div>
  );
}