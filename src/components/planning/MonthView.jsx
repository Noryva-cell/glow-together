import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function MonthView({ month, tasks, onSelectDay }) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="surface p-3">
      <div className="grid grid-cols-7 gap-1 pb-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const list = tasks.filter((t) => t.date === key);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = day.getMonth() === month.getMonth();
          return (
            <button
              key={key}
              onClick={() => onSelectDay(day)}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors hover:bg-muted/70',
                !isCurrentMonth && 'text-muted-foreground/40',
                isToday && 'bg-primary/10 text-primary'
              )}
            >
              <span className={cn(isToday && 'font-medium')}>{format(day, 'd')}</span>
              <span className="flex gap-0.5">
                {list.slice(0, 3).map((t) => (
                  <span key={t.id} className={cn('h-1 w-1 rounded-full', t.status === 'terminee' ? 'bg-muted-foreground/40' : 'bg-primary')} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}