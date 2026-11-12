import { useState } from 'react';
import { Pencil, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GOAL_LABEL, DAYS, COACHING_STYLES, DOMAIN_LABEL } from '@/lib/constants';

const ACTIVITY_LABEL = {
  sedentaire: 'Plutôt sédentaire',
  leger: 'Un peu active',
  modere: 'Modérément active',
  actif: 'Active',
  tres_actif: 'Très active',
};

const REMINDER_LABEL = {
  jamais: 'Jamais',
  quotidien: 'Une fois par jour',
  deux_fois: 'Deux fois par jour',
};

const Row = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2 last:border-0">
    <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
    <span className="text-right text-sm">{value || '—'}</span>
  </div>
);

const Card = ({ title, step, onEdit, children }) => (
  <div className="surface p-4">
    <div className="flex items-center justify-between">
      <p className="font-display text-base">{title}</p>
      <button onClick={() => onEdit(step)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
        <Pencil className="h-3 w-3" /> Modifier
      </button>
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

export default function StepSummary({ data, back, onEdit, finish }) {
  const [busy, setBusy] = useState(false);
  const days = (data.available_days || []).map((d) => DAYS.find((x) => x.js === d)?.short).join(' · ');
  const precise = Object.entries(data.domain_goals || {}).filter(([, text]) => String(text || '').trim());

  const handleFinish = async () => {
    setBusy(true);
    await finish();
  };

  return (
    <div>
      <h2 className="font-display text-2xl leading-tight">Ton profil est prêt</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Vérifie une dernière fois, puis Mimo prépare tes exercices adaptés et ton planning.
      </p>

      <div className="mt-6 space-y-3">
        <Card title="Toi" step={1} onEdit={onEdit}>
          <Row label="Prénom" value={data.nickname} />
          <Row label="Âge" value={data.age_range} />
          <Row label="Pays" value={data.country} />
        </Card>

        <Card title="Rythme" step={2} onEdit={onEdit}>
          <Row label="Âge" value={data.age ? `${data.age} ans` : ''} />
          <Row label="Taille" value={data.height_cm ? `${data.height_cm} cm` : ''} />
          <Row label="Poids" value={data.weight_kg ? `${data.weight_kg} kg` : 'Non renseigné'} />
          <Row label="Activité" value={ACTIVITY_LABEL[data.activity_level] || data.activity_level} />
          <Row label="Temps libre / jour" value={data.free_minutes_per_day ? `${data.free_minutes_per_day} min` : ''} />
        </Card>

        <Card title="Objectifs" step={3} onEdit={onEdit}>
          <div className="flex flex-wrap gap-1.5">
            {(data.goals_selected || []).map((g) => (
              <span key={g} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">{GOAL_LABEL[g] || g}</span>
            ))}
          </div>
        </Card>

        <Card title="Objectifs précis" step={5} onEdit={onEdit}>
          {precise.length ? (
            precise.map(([domain, text]) => <Row key={domain} label={DOMAIN_LABEL[domain] || domain} value={text} />)
          ) : (
            <p className="py-1 text-[12px] text-muted-foreground">
              Aucun objectif précis : Mimo s’appuiera sur tes objectifs généraux.
            </p>
          )}
        </Card>

        <Card title="Emploi du temps" step={6} onEdit={onEdit}>
          <Row label="Réveil" value={data.wake_time} />
          <Row label="Coucher" value={data.sleep_time} />
          <Row label="Jours" value={days} />
          <Row label="Planning auto" value={data.auto_planning === false ? 'Désactivé' : 'Activé'} />
        </Card>

        <Card title="Préférences" step={7} onEdit={onEdit}>
          <Row label="Coaching" value={COACHING_STYLES.find((c) => c.value === data.coaching_style)?.label || data.coaching_style} />
          <Row label="Rappels" value={REMINDER_LABEL[data.reminder_frequency] || data.reminder_frequency} />
        </Card>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          GlowUp est un outil d’organisation et de progression, pas un avis médical. En cas de douleur ou de trouble
          alimentaire, parles-en à un professionnel qualifié.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 pb-4">
        <Button variant="ghost" className="rounded-full text-muted-foreground" onClick={back}>Retour</Button>
        <Button className="flex-1 rounded-full py-6" onClick={handleFinish} disabled={busy}>
          {busy ? 'Création de ton programme…' : 'Créer mon programme'}
        </Button>
      </div>
    </div>
  );
}