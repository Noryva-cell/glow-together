import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskRow from '@/components/TaskRow';

export default function ListView({ tasks, onToggle, onEdit, onPostpone }) {
  const groups = tasks.reduce((acc, task) => {
    acc[task.date] = acc[task.date] || [];
    acc[task.date].push(task);
    return acc;
  }, {});
  const dates = Object.keys(groups).sort();

  if (!dates.length) {
    return (
      <div className="surface px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">Aucune tâche à venir. Ton planning est libre.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {dates.map((date) => (
        <div key={date}>
          <p className="mb-2 px-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {format(new Date(`${date}T00:00:00`), 'EEEE d MMMM', { locale: fr })}
          </p>
          <div className="surface divide-y divide-border/60">
            {groups[date].map((t) => (
              <TaskRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onPostpone={onPostpone} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}