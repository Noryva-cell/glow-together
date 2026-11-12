import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { CATEGORIES, GOAL_OPTIONS } from '@/lib/constants';

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);
const GOAL_VALUES = GOAL_OPTIONS.map((g) => g.value);
const PRIORITY_VALUES = ['haute', 'moyenne', 'basse'];

const todayKey = () => format(new Date(), 'yyyy-MM-dd');
const safeDate = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? value : todayKey());
const safeTime = (value) => (/^\d{2}:\d{2}$/.test(String(value || '')) ? value : '');
const clampDuration = (value) => Math.min(180, Math.max(5, Number(value) || 20));

const asArray = (value) => (Array.isArray(value) ? value : []);

export function previewAction(action) {
  if (action?.type === 'create_routine') {
    const routine = action.routine || {};
    return {
      kind: 'Routine',
      heading: routine.name || action.title,
      lines: asArray(routine.steps).filter(Boolean).slice(0, 10),
      meta: `${routine.moment === 'soir' ? 'Le soir' : 'Le matin'}${asArray(routine.days).length ? ` · ${asArray(routine.days).length} jour(s) par semaine` : ' · tous les jours'}`,
    };
  }
  if (action?.type === 'add_tasks') {
    const tasks = asArray(action.tasks).filter((t) => t?.title).slice(0, 8);
    return {
      kind: 'Planning',
      heading: action.title || `${tasks.length} tâche(s) à ajouter`,
      lines: tasks.map((t) => `${t.title} · ${safeDate(t.date)}${t.start_time ? ` à ${t.start_time}` : ''} · ${clampDuration(t.duration_minutes)} min`),
      meta: tasks.length > 1 ? 'Ajoutées au planning du jour correspondant' : 'Ajoutée au planning',
    };
  }
  if (action?.type === 'create_goal') {
    const goal = action.goal || {};
    return {
      kind: 'Objectif',
      heading: goal.title || action.title,
      lines: [goal.desired_outcome, goal.target_date ? `Échéance : ${goal.target_date}` : ''].filter(Boolean),
      meta: 'Visible dans mes objectifs',
    };
  }
  if (action?.type === 'create_habit') {
    const habit = action.habit || {};
    return {
      kind: 'Habitude',
      heading: habit.name || action.title,
      lines: [habit.frequency === 'hebdomadaire' ? `${habit.target_per_week || 3} fois par semaine` : 'Chaque jour'],
      meta: 'Suivie dans mes routines',
    };
  }
  return { kind: 'Proposition', heading: action?.title || 'Proposition', lines: [], meta: '' };
}

export async function saveAction(action) {
  if (action?.type === 'create_routine') {
    const routine = action.routine || {};
    const steps = asArray(routine.steps).map((s) => String(s).trim()).filter(Boolean).slice(0, 12);
    if (!routine.name || !steps.length) throw new Error('Cette routine est incomplète.');
    await base44.entities.Routine.create({
      name: String(routine.name).slice(0, 90),
      moment: routine.moment === 'soir' ? 'soir' : 'matin',
      category: CATEGORY_VALUES.includes(routine.category) ? routine.category : 'beaute',
      steps,
      days: asArray(routine.days).map(Number).filter((d) => d >= 0 && d <= 6),
      active: true,
    });
    return `Routine « ${routine.name} » enregistrée`;
  }

  if (action?.type === 'add_tasks') {
    const tasks = asArray(action.tasks).filter((t) => t?.title).slice(0, 8);
    if (!tasks.length) throw new Error('Aucune tâche à enregistrer.');
    await base44.entities.Task.bulkCreate(
      tasks.map((task) => ({
        title: String(task.title).slice(0, 140),
        description: '',
        date: safeDate(task.date),
        start_time: safeTime(task.start_time),
        duration_minutes: clampDuration(task.duration_minutes),
        category: CATEGORY_VALUES.includes(task.category) ? task.category : 'personnel',
        priority: PRIORITY_VALUES.includes(task.priority) ? task.priority : 'moyenne',
        status: 'a_faire',
        recurrence: 'aucune',
        generated: false,
      }))
    );
    return tasks.length > 1 ? `${tasks.length} tâches ajoutées au planning` : 'Tâche ajoutée au planning';
  }

  if (action?.type === 'create_goal') {
    const goal = action.goal || {};
    if (!goal.title) throw new Error('Cet objectif est incomplet.');
    await base44.entities.Goal.create({
      title: String(goal.title).slice(0, 120),
      goal_type: GOAL_VALUES.includes(goal.goal_type) ? goal.goal_type : 'personnel',
      desired_outcome: String(goal.desired_outcome || '').slice(0, 400),
      target_date: goal.target_date ? safeDate(goal.target_date) : '',
      status: 'en_cours',
      progress: 0,
      is_primary: false,
      milestones: [],
    });
    return `Objectif « ${goal.title} » créé`;
  }

  if (action?.type === 'create_habit') {
    const habit = action.habit || {};
    if (!habit.name) throw new Error('Cette habitude est incomplète.');
    const weekly = habit.frequency === 'hebdomadaire';
    await base44.entities.Habit.create({
      name: String(habit.name).slice(0, 90),
      description: '',
      frequency: weekly ? 'hebdomadaire' : 'quotidien',
      days: asArray(habit.days).map(Number).filter((d) => d >= 0 && d <= 6),
      target_per_week: weekly ? Math.min(7, Math.max(1, Number(habit.target_per_week) || 3)) : 7,
      active: true,
    });
    return `Habitude « ${habit.name} » créée`;
  }

  throw new Error('Cette proposition ne peut pas être enregistrée.');
}
