import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Target, Check, CalendarDays, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import GoalDialog from '@/components/GoalDialog';
import { goalProgress, IMPORTANCE_LABEL } from '@/lib/goals';
import { cn } from '@/lib/utils';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const [g, t] = await Promise.all([
      base44.entities.Goal.filter({}),
      base44.entities.Task.filter({}),
    ]);
    setGoals(g.sort((a, b) => Number(b.is_primary) - Number(a.is_primary)));
    setTasks(t);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (payload) => {
    if (editing?.id) await base44.entities.Goal.update(editing.id, payload);
    else await base44.entities.Goal.create({ ...payload, status: 'en_cours' });
    await load();
  };

  const remove = async (goal) => {
    await base44.entities.Goal.delete(goal.id);
    setDialogOpen(false);
    load();
  };

  const toggleMilestone = async (goal, index) => {
    const milestones = goal.milestones.map((m, i) => (i === index ? { ...m, done: !m.done } : m));
    await base44.entities.Goal.update(goal.id, { milestones });
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Direction"
        title="Mes objectifs"
        subtitle="Des objectifs réalistes, découpés en étapes concrètes."
        action={
          <button onClick={() => { setEditing(null); setDialogOpen(true); }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95" aria-label="Nouvel objectif">
            <Plus className="h-4 w-4" />
          </button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Aucun objectif pour l’instant"
          description="Un objectif clair change tout : il donne une direction à ton planning."
          action={<button onClick={() => setDialogOpen(true)} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Créer mon premier objectif</button>}
        />
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const value = goalProgress(goal, tasks);
            const linked = tasks.filter((t) => t.goal_id === goal.id);
            return (
              <div key={goal.id} className="surface rise p-5">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => { setEditing(goal); setDialogOpen(true); }} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      {goal.is_primary && <Star className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      <p className="truncate font-display text-base">{goal.title}</p>
                    </div>
                    {goal.desired_outcome && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{goal.desired_outcome}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>{IMPORTANCE_LABEL[goal.importance] || 'Important'}</span>
                      {goal.target_date && (
                        <span className="flex items-center gap-1 normal-case tracking-normal">
                          <CalendarDays className="h-3 w-3" /> {format(new Date(`${goal.target_date}T00:00:00`), 'd MMM yyyy', { locale: fr })}
                        </span>
                      )}
                      {linked.length > 0 && <span className="normal-case tracking-normal">{linked.filter((t) => t.status === 'terminee').length}/{linked.length} tâches</span>}
                    </div>
                  </button>
                  <span className="font-display text-xl text-primary">{value}%</span>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${value}%` }} />
                </div>

                {goal.milestones?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {goal.milestones.map((m, i) => (
                      <button key={i} onClick={() => toggleMilestone(goal, i)} className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left">
                        <span className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                          m.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent'
                        )}>
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        <span className={cn('text-xs', m.done && 'text-muted-foreground line-through')}>{m.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={editing}
        onSave={save}
        onDelete={remove}
      />
    </div>
  );
}