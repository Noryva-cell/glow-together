import { base44 } from '@/api/base44Client';
import { addDays, format, parseISO } from 'date-fns';

export const isDone = (task) => task.status === 'terminee';

export function nextDateFor(task) {
  const base = task.date ? parseISO(task.date) : new Date();
  if (task.recurrence === 'quotidien') return format(addDays(base, 1), 'yyyy-MM-dd');
  if (task.recurrence === 'hebdomadaire') return format(addDays(base, 7), 'yyyy-MM-dd');
  if (task.recurrence === 'jours_ouvres') {
    let d = addDays(base, 1);
    while ([0, 6].includes(d.getDay())) d = addDays(d, 1);
    return format(d, 'yyyy-MM-dd');
  }
  return null;
}

export async function setTaskStatus(task, done) {
  const updated = await base44.entities.Task.update(task.id, {
    status: done ? 'terminee' : 'a_faire',
    completed_at: done ? new Date().toISOString() : '',
  });

  if (done && task.recurrence && task.recurrence !== 'aucune') {
    const nextDate = nextDateFor(task);
    if (nextDate) {
      const existing = await base44.entities.Task.filter({
        title: task.title,
        date: nextDate,
        category: task.category,
      });
      if (!existing.length) {
        await base44.entities.Task.create({
          title: task.title,
          description: task.description || '',
          category: task.category,
          date: nextDate,
          start_time: task.start_time || '',
          duration_minutes: task.duration_minutes || 30,
          priority: task.priority || 'moyenne',
          status: 'a_faire',
          recurrence: task.recurrence,
          goal_id: task.goal_id || '',
          goal_type: task.goal_type || '',
          generated: false,
        });
      }
    }
  }
  return updated;
}

export const totalMinutes = (tasks = []) =>
  tasks.filter((t) => !isDone(t)).reduce((sum, t) => sum + (Number(t.duration_minutes) || 0), 0);