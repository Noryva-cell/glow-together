export const goalProgress = (goal, tasks = []) => {
  const milestones = goal.milestones || [];
  if (milestones.length) {
    return Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100);
  }
  const linked = tasks.filter((t) => t.goal_id === goal.id);
  if (linked.length) {
    return Math.round((linked.filter((t) => t.status === 'terminee').length / linked.length) * 100);
  }
  return Math.min(100, Math.max(0, Math.round(goal.progress || 0)));
};

export const IMPORTANCE_LABEL = { haute: 'Essentiel', moyenne: 'Important', basse: 'Plus tard' };