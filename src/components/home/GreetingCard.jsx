import { ArrowRight, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GreetingCard({ dateLabel, name, tasks, onToggle, onEdit, onOpenPlanning, onAdd }) {
  return (
    <section className="surface p-5 rise">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{dateLabel}</p>
      <h2 className="mt-1.5 font-display text-lg leading-tight">
        {name ? `Bonne journée, ${name}` : 'Bonne journée'}
      </h2>

      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Tes priorités du jour
      </p>

      <div className="mt-2.5 space-y-1.5">
        {tasks.length ? (
          tasks.map((task) => {
            const done = task.status === 'terminee';
            return (
              <div key={task.id} className="flex items-start gap-2.5">
                <button
                  onClick={() => onToggle(task)}
                  aria-label={done ? 'Rouvrir la tâche' : 'Terminer la tâche'}
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                    done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-transparent hover:border-primary'
                  )}
                >
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={() => onEdit(task)} className="min-w-0 flex-1 text-left">
                  <span className={cn('block truncate text-sm', done && 'text-muted-foreground line-through')}>
                    {task.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {task.start_time ? `${task.start_time} · ` : ''}{task.duration_minutes} min
                  </span>
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">Rien de prévu pour l’instant.</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={onOpenPlanning} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
          Voir mon planning <ArrowRight className="h-3 w-3" />
        </button>
        <button
          onClick={onAdd}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="Ajouter une tâche"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}