import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import Actions from '@/components/onboarding/Actions';
import { GOAL_OPTIONS, GOAL_LABEL } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function StepGoals({ data, update, saveProfile, next, back, goals, setGoals }) {
  const [busy, setBusy] = useState(false);
  const selected = data.goals_selected || [];
  const primary = data.primary_goal || selected[0] || '';

  const toggle = (value) => {
    const nextSel = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
    update({ goals_selected: nextSel, primary_goal: nextSel.includes(primary) ? primary : nextSel[0] || '' });
  };

  const submit = async () => {
    if (!selected.length) return;
    setBusy(true);
    await saveProfile({ goals_selected: selected, primary_goal: primary || selected[0] });

    const missing = selected.filter((v) => !goals.some((g) => g.goal_type === v));
    if (missing.length) {
      await base44.entities.Goal.bulkCreate(missing.map((v) => ({
        title: GOAL_LABEL[v],
        goal_type: v,
        is_primary: v === (primary || selected[0]),
        importance: 'moyenne',
        status: 'en_cours',
        progress: 0,
        milestones: [],
      })));
    }
    const all = await base44.entities.Goal.filter({});
    const updates = all
      .filter((g) => selected.includes(g.goal_type))
      .map((g) => ({ id: g.id, is_primary: g.goal_type === (primary || selected[0]) }));
    if (updates.length) await base44.entities.Goal.bulkUpdate(updates);
    setGoals(all.map((g) => ({ ...g, is_primary: g.goal_type === (primary || selected[0]) })));
    setBusy(false);
    next();
  };

  return (
    <div>
      <h2 className="font-display text-2xl leading-tight">Tes objectifs</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Choisis tout ce qui compte en ce moment. Tu pourras en ajouter ou en retirer à tout moment.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {GOAL_OPTIONS.map((g) => {
          const active = selected.includes(g.value);
          return (
            <button
              key={g.value}
              onClick={() => toggle(g.value)}
              className={cn(
                'rounded-2xl border px-3.5 py-2.5 text-left text-xs leading-snug transition-all',
                active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
              )}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {selected.length > 1 && (
        <div className="mt-8">
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Objectif principal</Label>
          <div className="mt-2 space-y-2">
            {selected.map((v) => (
              <button
                key={v}
                onClick={() => update({ primary_goal: v })}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all',
                  (primary || selected[0]) === v ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground'
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', (primary || selected[0]) === v ? 'bg-primary' : 'bg-border')} />
                {GOAL_LABEL[v]}
              </button>
            ))}
          </div>
        </div>
      )}

      <Actions onBack={back} onNext={submit} busy={busy} disabled={!selected.length} />
    </div>
  );
}