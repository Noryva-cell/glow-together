import { useState } from 'react';
import Actions from '@/components/onboarding/Actions';
import DomainGoalsFields from '@/components/onboarding/DomainGoalsFields';
import { cn } from '@/lib/utils';

export default function StepDomainGoals({ data, saveProfile, next, back }) {
  const [goals, setGoals] = useState(data.domain_goals || {});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    await saveProfile({ domain_goals: goals });
    setBusy(false);
    next();
  };

  const filled = Object.values(goals).filter((text) => String(text || '').trim()).length;

  return (
    <div>
      <h2 className="font-display text-2xl leading-tight">Ton objectif précis</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Plus tu es précise, plus Mimo adapte les exercices et évite ce qui ne te convient pas.
      </p>

      <div className="mt-6">
        <DomainGoalsFields value={goals} onChange={setGoals} goalsSelected={data.goals_selected} />
      </div>

      <p className={cn('mt-5 rounded-2xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground')}>
        Mimo prépare des étapes progressives et sans danger, à titre d’organisation : ce n’est pas un avis médical.
        En cas de douleur, de blessure ou de trouble alimentaire, parles-en à un professionnel.
      </p>

      <Actions
        onBack={back}
        onNext={submit}
        busy={busy}
        nextLabel={filled ? 'Continuer' : 'Passer cette étape'}
      />
    </div>
  );
}