import { Check, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskRow from '@/components/TaskRow';
import { isDone } from '@/lib/tasks';
import { DAYS, BLOCK_TYPES } from '@/lib/constants';
import { freeWindows, toTime, toMinutes } from '@/lib/planner';

export default function DayView({ date, tasks, blocks, profile, onToggle, onEdit, onPostpone, onNew }) {
  const jsDay = date.getDay();
  const dayBlocks = blocks.filter((b) => Number(b.day_of_week) === jsDay);
  const windows = freeWindows(jsDay, blocks, profile?.wake_time || '07:00', profile?.sleep_time || '23:00');
  const freeTotal = windows.reduce((sum, w) => sum + (w.end - w.start), 0);
  const busyTotal = dayBlocks.reduce((sum, b) => sum + Math.max(0, toMinutes(b.end_time) - toMinutes(b.start_time)), 0);

  return (
    <div className="space-y-4">
      <div className="surface p-4">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-lg capitalize">{format(date, 'EEEE d MMMM', { locale: fr })}</p>
          <button onClick={onNew} className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
            <Plus className="h-3 w-3" /> Tâche
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
            Réveil {profile?.wake_time || '07:00'} · coucher {profile?.sleep_time || '23:00'}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
            {(freeTotal / 60).toFixed(1)} h libres
          </span>
          {busyTotal > 0 && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
              {(busyTotal / 60).toFixed(1)} h occupées
            </span>
          )}
        </div>
        {dayBlocks.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
            {dayBlocks.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{b.label} · {BLOCK_TYPES.find((t) => t.value === b.type)?.label || b.type}</span>
                <span>{b.start_time} – {b.end_time}</span>
              </div>
            ))}
          </div>
        )}
        {windows.length > 0 && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Créneaux libres : {windows.map((w) => `${toTime(w.start)}–${toTime(w.end)}`).join(' · ')}
          </p>
        )}
      </div>

      {tasks.length ? (
        <div className="surface divide-y divide-border/60">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onPostpone={onPostpone} />
          ))}
        </div>
      ) : (
        <div className="surface px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">Aucune tâche ce jour-là.</p>
          <button onClick={onNew} className="mt-3 rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground">Ajouter une tâche</button>
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> {tasks.filter(isDone).length} terminées</span>
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {tasks.filter((t) => !isDone(t)).reduce((s, t) => s + (t.duration_minutes || 0), 0)} min restantes</span>
      </div>
    </div>
  );
}