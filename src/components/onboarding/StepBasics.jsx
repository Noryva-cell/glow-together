import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Actions from '@/components/onboarding/Actions';
import { cn } from '@/lib/utils';

const AGES = ['Moins de 18 ans', '18 – 24 ans', '25 – 34 ans', '35 – 44 ans', '45 – 54 ans', '55 ans et plus'];

export default function StepBasics({ data, update, saveProfile, next }) {
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    await saveProfile({ nickname: data.nickname || '', age_range: data.age_range || '', country: data.country || '' });
    setBusy(false);
    next();
  };

  return (
    <div>
      <h2 className="font-display text-2xl leading-tight">Faisons connaissance</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Juste l’essentiel. Tout est modifiable plus tard depuis ton profil.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Prénom ou pseudo</Label>
          <Input
            value={data.nickname || ''}
            onChange={(e) => update({ nickname: e.target.value })}
            placeholder="Comment veux-tu être appelée ?"
            className="mt-2 h-12 rounded-2xl"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">Facultatif — tu peux rester anonyme.</p>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Âge</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {AGES.map((a) => (
              <button
                key={a}
                onClick={() => update({ age_range: a })}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-xs transition-all',
                  data.age_range === a
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Pays</Label>
          <Input
            value={data.country || ''}
            onChange={(e) => update({ country: e.target.value })}
            placeholder="France, Belgique…"
            className="mt-2 h-12 rounded-2xl"
          />
        </div>

        <p className="rounded-2xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          Tes réponses restent privées et rattachées à ton compte. Personne d’autre n’y a accès.
        </p>
      </div>

      <Actions onNext={submit} busy={busy} disabled={!data.age_range} />
    </div>
  );
}