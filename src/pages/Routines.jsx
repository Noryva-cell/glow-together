import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, addDays } from 'date-fns';
import { Plus, Sparkles, ListChecks } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import RoutineCard from '@/components/routines/RoutineCard';
import HabitRow from '@/components/routines/HabitRow';
import RoutineDialog from '@/components/routines/RoutineDialog';
import HabitDialog from '@/components/routines/HabitDialog';
import ProgramEntry from '@/components/home/ProgramEntry';
import EveningCheckin from '@/components/routines/EveningCheckin';
import { cn } from '@/lib/utils';

export default function Routines() {
  const [tab, setTab] = useState('routines');
  const [routines, setRoutines] = useState([]);
  const [routineLogs, setRoutineLogs] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routineOpen, setRoutineOpen] = useState(false);
  const [habitOpen, setHabitOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const weekDates = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return [...Array(7)].map((_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
  }, []);

  const load = async () => {
    const [r, rl, h, hl] = await Promise.all([
      base44.entities.Routine.filter({ active: true }),
      base44.entities.RoutineLog.filter({ date: todayKey }),
      base44.entities.Habit.filter({ active: true }),
      base44.entities.HabitLog.filter({ date: { $gte: weekDates[0], $lte: weekDates[6] } }),
    ]);
    setRoutines(r);
    setRoutineLogs(rl);
    setHabits(h);
    setHabitLogs(hl);
    setLoading(false);
  };

  useEffect(() => { load(); }, [todayKey]);

  const todayJs = new Date().getDay();
  const routinesToday = routines.filter((r) => !r.days?.length || r.days.includes(todayJs));

  const toggleStep = async (routine, index) => {
    const log = routineLogs.find((l) => l.routine_id === routine.id);
    const current = log?.done_steps || [];
    const next = current.includes(index) ? current.filter((i) => i !== index) : [...current, index];
    if (log) await base44.entities.RoutineLog.update(log.id, { done_steps: next, done: next.length === routine.steps.length });
    else await base44.entities.RoutineLog.create({ routine_id: routine.id, date: todayKey, done_steps: next, done: next.length === routine.steps.length });
    load();
  };

  const saveRoutine = async (payload) => {
    if (editingRoutine?.id) await base44.entities.Routine.update(editingRoutine.id, payload);
    else await base44.entities.Routine.create(payload);
    load();
  };

  const deleteRoutine = async (routine) => {
    await base44.entities.Routine.delete(routine.id);
    setRoutineOpen(false);
    load();
  };

  const toggleHabit = async (habit) => {
    const log = habitLogs.find((l) => l.habit_id === habit.id && l.date === todayKey);
    if (log) await base44.entities.HabitLog.update(log.id, { completed: !log.completed });
    else await base44.entities.HabitLog.create({ habit_id: habit.id, date: todayKey, completed: true });
    load();
  };

  const saveHabit = async (payload) => {
    if (editingHabit?.id) await base44.entities.Habit.update(editingHabit.id, payload);
    else await base44.entities.Habit.create(payload);
    load();
  };

  const deleteHabit = async (habit) => {
    await base44.entities.Habit.delete(habit.id);
    setHabitOpen(false);
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Répétition"
        title="Mes routines"
        subtitle="Les petites actions répétées font les grands changements."
        action={
          <button
            onClick={() => { if (tab === 'routines') { setEditingRoutine(null); setRoutineOpen(true); } else { setEditingHabit(null); setHabitOpen(true); } }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95"
            aria-label="Ajouter"
          >
            <Plus className="h-4 w-4" />
          </button>
        }
      />

      <div className="mb-4">
        <ProgramEntry />
      </div>

      <div className="mb-4">
        <EveningCheckin />
      </div>

      <div className="mb-4 flex gap-1 rounded-full bg-muted/70 p-1">
        {[{ v: 'routines', l: 'Routines' }, { v: 'habitudes', l: 'Habitudes' }].map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={cn('flex-1 rounded-full py-2 text-xs transition-all', tab === t.v ? 'bg-card shadow-sm' : 'text-muted-foreground')}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'routines' ? (
        routinesToday.length ? (
          <div className="space-y-3">
            {routinesToday.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                log={routineLogs.find((l) => l.routine_id === routine.id)}
                onToggleStep={toggleStep}
                onEdit={(r) => { setEditingRoutine(r); setRoutineOpen(true); }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Aucune routine aujourd’hui"
            description="Crée une routine matin ou soir : quelques étapes, toujours dans le même ordre."
            action={<button onClick={() => setRoutineOpen(true)} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Créer une routine</button>}
          />
        )
      ) : habits.length ? (
        <div className="surface divide-y divide-border/60">
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              weekDates={weekDates}
              todayKey={todayKey}
              logs={habitLogs}
              onToggle={toggleHabit}
              onEdit={(h) => { setEditingHabit(h); setHabitOpen(true); }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="Aucune habitude suivie"
          description="Une habitude = une action simple, répétée. Commence par une seule."
          action={<button onClick={() => setHabitOpen(true)} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Créer une habitude</button>}
        />
      )}

      <RoutineDialog open={routineOpen} onOpenChange={setRoutineOpen} routine={editingRoutine} onSave={saveRoutine} onDelete={deleteRoutine} />
      <HabitDialog open={habitOpen} onOpenChange={setHabitOpen} habit={editingHabit} onSave={saveHabit} onDelete={deleteHabit} />
    </div>
  );
}