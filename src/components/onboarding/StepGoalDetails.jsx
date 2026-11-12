import { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Actions from '@/components/onboarding/Actions';
import { cn } from '@/lib/utils';

const IMPORTANCE = [
  { value: 'haute', label: 'Essentiel' },
  { value: 'moyenne', label: 'Important' },
  { value: 'basse', label: 'Plus tard' },
];

export default function StepGoalDetails({ data, saveProfile, next, back, goals, setGoals }) {
  const selected = useMemo(
    () => goals.filter((g) => (data.goals_selected || []).includes(g.goal_type)),
    [goals, data.goals_selected]
  );
  const [details, setDetails] = useState(() =>
    Object.fromEntries(selected.map((g) => [g.id, {
      desired_outcome: g.desired_outcome || '',
      importance: g.importance || 'moyenne',
      target_date: g.target_date || '',
      current_level: g.current_level || '',
    }]))
  );
  const [busy, setBusy] = useState(false);

  const set = (id, key, value) => setDetails((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));

  const submit = async () => {
    setBusy(true);
    await saveProfile({});
    const updates = selected.map((g) => ({ id: g.id, ...details[g.id] }));
    if (updates.length) await base44.entities.Goal.bulkUpdate(updates);
    setGoals(goals.map((g) => (details[g.id] ? { ...g, ...details[g.id] } : g)));
    setBusy(false);
    next();
  };

  return (
    <div>
      <h2 className="font-display text-2xl leading-tight">Précisons tes objectifs</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Un résultat concret et un délai réaliste valent mieux qu’une promesse vague. Tu pourras ajuster à tout moment.
      </p>

      <div className="mt-6 space-y-4">
        {selected.map((g) => (
          <div key={g.id} className="surface p-4">
            <p className="text-sm font-medium">{g.title}</p>
            <div className="mt-3 space-y-3">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Résultat souhaité</Label>
                <Textarea
                  rows={2}
                  value={details[g.id]?.desired_outcome || ''}
                  onChange={(e) => set(g.id, 'desired_outcome', e.target.value)}
                  placeholder="Ex. Tenir 3 séances par semaine pendant 8 semaines"
                  className="mt-1 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Importance</Label>
                  <Select value={details[g.id]?.importance || 'moyenne'} onValueChange={(v) => set(g.id, 'importance', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {IMPORTANCE.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Échéance</Label>
                  <Input type="date" value={details[g.id]?.target_date || ''} onChange={(e) => set(g.id, 'target_date', e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Où j’en suis aujourd’hui</Label>
                <Input
                  value={details[g.id]?.current_level || ''}
                  onChange={(e) => set(g.id, 'current_level', e.target.value)}
                  placeholder="Ex. Je débute, 1 séance de temps en temps"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className={cn('mt-4 rounded-2xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground')}>
        GlowUp ne promet aucun résultat physique garanti : l’objectif est de progresser régulièrement, à ton rythme.
      </p>

      <Actions onBack={back} onNext={submit} busy={busy} nextLabel="Valider mes objectifs" />
    </div>
  );
}