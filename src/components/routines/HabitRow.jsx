import { Check, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HabitRow({ habit, weekDates, todayKey, logs, onToggle, onEdit }) {
  const doneToday = logs.some((l) => l.habit_id === habit.id && l.date === todayKey && l.completed);
  const weekCount = logs.filter((l) => l.habit_id === habit.id && l.completed).length;

  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <button
        onClick={() => onToggle(habit)}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90',
          doneToday ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent'
        )}
        aria-label="Cocher l’habitude"
      >
        <Check className="h-3 w-3" />
      </button>

      <button onClick={() => onEdit(habit)} className="min-w-0 flex-1 text-left">
        <p className={cn('truncate text-sm', doneToday && 'text-muted-foreground')}>{habit.name}</p>
        <div className="mt-1.5 flex items-center gap-1">
          {weekDates.map((date) => {
            const done = logs.some((l) => l.habit_id === habit.id && l.date === date && l.completed);
            return <span key={date} className={cn('h-1.5 w-1.5 rounded-full', done ? 'bg-primary' : 'bg-border')} />;
          })}
          <span className="ml-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Flame className="h-3 w-3" /> {weekCount}/{habit.target_per_week || 7}
          </span>
        </div>
      </button>
    </div>
  );
}