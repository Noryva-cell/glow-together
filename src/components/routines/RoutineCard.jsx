import { Check, Moon, Sun, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoutineCard({ routine, log, onToggleStep, onEdit }) {
  const doneSteps = log?.done_steps || [];
  const total = routine.steps?.length || 0;
  const percent = total ? Math.round((doneSteps.length / total) * 100) : 0;

  return (
    <div className="surface rise p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            {routine.moment === 'soir' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </span>
          <div>
            <p className="font-display text-base leading-tight">{routine.name}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {routine.moment === 'matin' ? 'Matin' : routine.moment === 'soir' ? 'Soir' : 'Libre'} · {doneSteps.length}/{total}
            </p>
          </div>
        </div>
        <button onClick={() => onEdit(routine)} className="text-muted-foreground hover:text-foreground" aria-label="Modifier">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-3 space-y-0.5">
        {(routine.steps || []).map((step, i) => {
          const done = doneSteps.includes(i);
          return (
            <button key={i} onClick={() => onToggleStep(routine, i)} className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left">
              <span className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent'
              )}>
                <Check className="h-2.5 w-2.5" />
              </span>
              <span className={cn('text-xs', done && 'text-muted-foreground line-through')}>{step}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}