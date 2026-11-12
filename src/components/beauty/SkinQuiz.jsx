import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const SKIN_TYPES = ['normale', 'sèche', 'grasse', 'mixte', 'sensible'];
const SENSITIVITY = ['faible', 'modérée', 'forte'];
const SKIN_CONCERNS = ['acné', 'points noirs', 'taches', 'rides', 'déshydratation', 'rougeurs', 'pores dilatés', 'éclat'];
const HAIR_TYPES = ['fin', 'épais', 'lisse', 'bouclé', 'frisé', 'coloré'];
const HAIR_CONCERNS = ['chute', 'pellicules', 'sécheresse', 'frisottis', 'volume', 'brillance'];

const chip = (active) =>
  cn(
    'rounded-full border px-3 py-1.5 text-[11px] transition-colors',
    active ? 'border-primary bg-primary/15 text-foreground' : 'border-border/70 text-muted-foreground'
  );

export default function SkinQuiz({ profile, onSave, busy }) {
  const [form, setForm] = useState(() => ({
    objective: profile?.domain_goals?.beaute || '',
    skin_type: profile?.skin_type || '',
    skin_sensitivity: profile?.skin_sensitivity || '',
    skin_concerns: profile?.skin_concerns || [],
    hair_type: profile?.hair_type || '',
    hair_concerns: profile?.hair_concerns || [],
    beauty_products: profile?.beauty_products || '',
  }));

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggle = (key, value) => {
    const list = form[key] || [];
    set(key, list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]);
  };

  return (
    <section className="surface space-y-4 p-5">
      <div>
        <p className="font-display text-base">Mon profil peau & cheveux</p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Plus tes réponses sont précises, plus la routine proposée par Mimo est douce et réaliste.
        </p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Ton objectif beauté</p>
        <Textarea
          value={form.objective}
          onChange={(event) => set('objective', event.target.value)}
          placeholder="Ex. : une peau plus nette sur le front, une routine du soir en 5 minutes"
          className="mt-1.5 min-h-[64px] rounded-xl"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Type de peau</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SKIN_TYPES.map((type) => (
              <button key={type} onClick={() => set('skin_type', type)} className={chip(form.skin_type === type)}>{type}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Sensibilité</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SENSITIVITY.map((level) => (
              <button key={level} onClick={() => set('skin_sensitivity', level)} className={chip(form.skin_sensitivity === level)}>{level}</button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Ce qui te gêne côté peau</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {SKIN_CONCERNS.map((concern) => (
            <button key={concern} onClick={() => toggle('skin_concerns', concern)} className={chip(form.skin_concerns.includes(concern))}>
              {concern}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Type de cheveux</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HAIR_TYPES.map((type) => (
              <button key={type} onClick={() => set('hair_type', type)} className={chip(form.hair_type === type)}>{type}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Ce qui te gêne côté cheveux</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HAIR_CONCERNS.map((concern) => (
              <button key={concern} onClick={() => toggle('hair_concerns', concern)} className={chip(form.hair_concerns.includes(concern))}>
                {concern}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Produits que tu as déjà</p>
        <Textarea
          value={form.beauty_products}
          onChange={(event) => set('beauty_products', event.target.value)}
          placeholder="Ex. : nettoyant doux, crème hydratante, sérum vitamine C"
          className="mt-1.5 min-h-[64px] rounded-xl"
        />
      </div>

      <Button className="w-full rounded-full py-5" onClick={() => onSave(form)} disabled={busy}>
        {busy ? 'Enregistrement…' : 'Enregistrer mes réponses'}
      </Button>
    </section>
  );
}