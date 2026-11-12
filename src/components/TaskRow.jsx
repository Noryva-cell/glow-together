import { Check, Clock, Repeat, ArrowRight } from 'lucide-react';
import CategoryChip from '@/components/CategoryChip';
import { isDone } from '@/lib/tasks';
import { cn } from '@/lib/utils';

export default function TaskRow({ task, onToggle, onEdit, onPostpone, showDate = false, postponeLabel = 'Demain' }) {
  const done = isDone(task);
  return (
    <div className="group flex items-start gap-3 px-4 py-3">
      <button
        onClick={() => onToggle?.(task)}
        aria-label={done ? 'Marquer comme à faire' : 'Marquer comme terminée'}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90',
          done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent hover:border-primary/60'
        )}
      >
        <Check className="h-3 w-3" />
      </button>

      <button onClick={() => onEdit?.(task)} className="min-w-0 flex-1 text-left">
        <p className={cn('truncate text-sm font-medium transition-colors', done && 'text-muted-foreground line-through')}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          {showDate && <span>{new Date(task.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>}
          {task.start_time && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{task.start_time}</span>
          )}
          <span>{task.duration_minutes || 30} min</span>
          {task.recurrence && task.recurrence !== 'aucune' && <Repeat className="h-3 w-3" />}
        </div>
        <div className="mt-2"><CategoryChip category={task.category} /></div>
      </button>

      {!done && onPostpone && (
        <button
          onClick={() => onPostpone(task)}
          className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full border border-border/70 px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="h-3 w-3" />{postponeLabel}
        </button>
      )}
    </div>
  );
}