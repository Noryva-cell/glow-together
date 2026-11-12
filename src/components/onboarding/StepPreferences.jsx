import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Actions from '@/components/onboarding/Actions';
import { COACHING_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const SPORT_GOALS = ['force', 'sport_specifique', 'exercice', 'mobilite'];
const FOOD_GOALS = ['alimentation', 'cuisiner'];
const BEAUTY_GOALS = ['peau', 'cheveux', 'apparence'];
const CULTURE_GOALS = ['culture', 'langue'];

const Section = ({ title, hint, children }) => (
  <div className="surface p-4">
    <p className="text-sm font-medium">{title}</p>
    {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    <div className="mt-3 space-y-3">{children}</div>
  </div>
);

export default function StepPreferences({ data, update, saveProfile, next, back }) {
  const [busy, setBusy] = useState(false);
  const goals = data.goals_selected || [];
  const has = (list) => goals.some((g) => list.includes(g));

  const submit = async () => {
    setBusy(true);
    await saveProfile({
      diet: data.diet || '',
      allergies: data.allergies || '',
      food_likes: data.food_likes || '',
      food_dislikes: data.food_dislikes || '',
      cooking_level: data.cooking_level || '',
      sport_level: data.sport_level || '',
      equipment: data.equipment || [],
      skin_type: data.skin_type || '',
      hair_type: data.hair_type || '',
      tidy_minutes: data.tidy_minutes ? Number(data.tidy_minutes) : undefined,
      culture_topics: data.culture_topics || [],
      coaching_style: data.coaching_style || 'encourageant',
      reminder_frequency: data.reminder_frequency || 'quotidien',
    });
    setBusy(false);
    next();
  };

  const pill = (key, options, value) => (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => update({ [key]: o })}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[11px] transition-all',
            value === o ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <h2 className="font-display text-2xl leading-tight">Tes préférences</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Seulement ce qui correspond aux objectifs choisis. Tout est modifiable ensuite.
      </p>

      <div className="mt-6 space-y-3">
        {has(FOOD_GOALS) && (
          <Section title="Alimentation" hint="Allergies et intolérances : aucune recommandation ne les ignorera.">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Régime</Label>
              <Select value={data.diet || 'aucun'} onValueChange={(v) => update({ diet: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucun">Aucun régime particulier</SelectItem>
                  <SelectItem value="vegetarien">Végétarien</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="pescetarien">Pescétarien</SelectItem>
                  <SelectItem value="sans_gluten">Sans gluten</SelectItem>
                  <SelectItem value="sans_lactose">Sans lactose</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input value={data.allergies || ''} onChange={(e) => update({ allergies: e.target.value })} placeholder="Allergies / intolérances" />
            <Input value={data.food_likes || ''} onChange={(e) => update({ food_likes: e.target.value })} placeholder="Aliments que tu adores" />
            <Input value={data.food_dislikes || ''} onChange={(e) => update({ food_dislikes: e.target.value })} placeholder="Aliments que tu évites" />
            <div>
              <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Niveau en cuisine</Label>
              {pill('cooking_level', ['Débutant', 'Intermédiaire', 'À l’aise'], data.cooking_level)}
            </div>
          </Section>
        )}

        {has(SPORT_GOALS) && (
          <Section title="Sport" hint="Aucun programme dangereux : l’intensité s’adapte à ton niveau.">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Niveau actuel</Label>
              {pill('sport_level', ['Débutant', 'Intermédiaire', 'Avancé'], data.sport_level)}
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Matériel disponible</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {['Aucun', 'Tapis', 'Haltères', 'Élastiques', 'Salle de sport'].map((eq) => {
                  const list = data.equipment || [];
                  const active = list.includes(eq);
                  return (
                    <button
                      key={eq}
                      onClick={() => update({ equipment: active ? list.filter((x) => x !== eq) : [...list, eq] })}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[11px] transition-all',
                        active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                      )}
                    >
                      {eq}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        {has(BEAUTY_GOALS) && (
          <Section title="Peau et cheveux" hint="Conseils cosmétiques uniquement — aucun diagnostic médical.">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Type de peau</Label>
              {pill('skin_type', ['Sèche', 'Mixte', 'Grasse', 'Sensible', 'Je ne sais pas'], data.skin_type)}
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Type de cheveux</Label>
              {pill('hair_type', ['Fins', 'Épais', 'Bouclés', 'Frisés', 'Lisses', 'Je ne sais pas'], data.hair_type)}
            </div>
          </Section>
        )}

        {has(['rangement']) && (
          <Section title="Rangement" hint="On commencera petit, jamais tout le même jour.">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Temps par jour</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {[5, 10, 15, 20].map((m) => (
                  <button
                    key={m}
                    onClick={() => update({ tidy_minutes: m })}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[11px] transition-all',
                      Number(data.tidy_minutes) === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    )}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Le temps choisi sera appliqué aux tâches de rangement.</p>
          </Section>
        )}

        {has(CULTURE_GOALS) && (
          <Section title="Apprentissage">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Thèmes préférés</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {['Culture générale', 'Histoire', 'Sciences', 'Économie', 'Langues', 'Communication'].map((topic) => {
                  const list = data.culture_topics || [];
                  const active = list.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => update({ culture_topics: active ? list.filter((x) => x !== topic) : [...list, topic] })}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[11px] transition-all',
                        active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                      )}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>
        )}

        <Section title="Mon style de coaching" hint="Il changera le ton des messages, jamais les faits.">
          <div className="grid grid-cols-2 gap-2">
            {COACHING_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => update({ coaching_style: s.value })}
                className={cn(
                  'rounded-2xl border p-3 text-left transition-all',
                  (data.coaching_style || 'encourageant') === s.value ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <p className="text-sm font-medium">{s.label}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Rappels dans l’application" hint="Affichés à l’ouverture de l’app. Pas de notification push pour l’instant.">
          {pill('reminder_frequency', ['Jamais', 'Une fois par jour', 'Deux fois par jour'], data.reminder_frequency)}
        </Section>
      </div>

      <Actions onBack={back} onNext={submit} busy={busy} />
    </div>
  );
}