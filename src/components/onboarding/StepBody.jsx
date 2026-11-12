import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Actions from '@/components/onboarding/Actions';
import { cn } from '@/lib/utils';

const LEVELS = [
  { value: 'sedentaire', label: 'Plutôt sédentaire' },
  { value: 'leger', label: 'Un peu active' },
  { value: 'modere', label: 'Modérément active' },
  { value: 'actif', label: 'Active' },
  { value: 'tres_actif', label: 'Très active' },
];

export default function StepBody({ data, update, saveProfile, next, back }) {
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    await saveProfile({
      height_cm: data.height_cm ? Number(data.height_cm) : undefined,
      weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
      target_weight_kg: data.target_weight_kg ? Number(data.target_weight_kg) : undefined,
      track_weight: !!data.track_weight,
      activity_level: data.activity_level || '',
      free_minutes_per_day: data.free_minutes_per_day ? Number(data.free_minutes_per_day) : undefined,
      monthly_budget: data.monthly_budget ? Number(data.monthly_budget) : undefined,
    });
    setBusy(false);
    next();
  };

  return (
    <div>
      <h2 className="font-display text-2xl leading-tight">Ton rythme actuel</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Ces informations servent uniquement à adapter l’intensité des séances et des repas. Rien n’est obligatoire.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Âge</Label>
          <Input
            type="number" inputMode="numeric"
            value={data.age || ''}
            onChange={(e) => update({ age: e.target.value })}
            placeholder="Ex. 24"
            className="mt-2 h-12 rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Taille (cm)</Label>
            <Input
              type="number" inputMode="numeric"
              value={data.height_cm || ''}
              onChange={(e) => update({ height_cm: e.target.value })}
              placeholder="—"
              className="mt-2 h-12 rounded-2xl"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Poids (kg)</Label>
            <Input
              type="number" inputMode="decimal"
              value={data.weight_kg || ''}
              onChange={(e) => update({ weight_kg: e.target.value })}
              placeholder="Facultatif"
              className="mt-2 h-12 rounded-2xl"
            />
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 p-4">
          <div>
            <p className="text-sm font-medium">Je souhaite suivre mon poids</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Un objectif de poids reste facultatif. Aucun jugement, aucune note.
            </p>
          </div>
          <Switch checked={!!data.track_weight} onCheckedChange={(v) => update({ track_weight: v })} />
        </div>

        {data.track_weight && (
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Poids cible (kg)</Label>
            <Input
              type="number" inputMode="decimal"
              value={data.target_weight_kg || ''}
              onChange={(e) => update({ target_weight_kg: e.target.value })}
              placeholder="Ex. 62"
              className="mt-2 h-12 rounded-2xl"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Temps libre / jour (min)</Label>
            <Input
              type="number" inputMode="numeric"
              value={data.free_minutes_per_day || ''}
              onChange={(e) => update({ free_minutes_per_day: e.target.value })}
              placeholder="Ex. 120"
              className="mt-2 h-12 rounded-2xl"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Budget mensuel (€)</Label>
            <Input
              type="number" inputMode="numeric"
              value={data.monthly_budget || ''}
              onChange={(e) => update({ monthly_budget: e.target.value })}
              placeholder="Ex. 80"
              className="mt-2 h-12 rounded-2xl"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Niveau d’activité quotidien</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => update({ activity_level: l.value })}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-xs transition-all',
                  data.activity_level === l.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Actions onBack={back} onNext={submit} busy={busy} />
    </div>
  );
}