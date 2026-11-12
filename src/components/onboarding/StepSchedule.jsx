import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Actions from '@/components/onboarding/Actions';
import { DAYS } from '@/lib/constants';
import { toMinutes, toTime } from '@/lib/planner';
import { cn } from '@/lib/utils';

const SLOT_OPTIONS = [
  { value: 'matin', label: 'Le matin' },
  { value: 'apresmidi', label: 'L’après-midi' },
  { value: 'soir', label: 'Le soir' },
];

const SLOT_FIELDS = [
  { key: 'sport', label: 'Sport' },
  { key: 'culture', label: 'Apprentissage' },
  { key: 'alimentation', label: 'Cuisine' },
  { key: 'menage', label: 'Rangement' },
  { key: 'organisation', label: 'Focus / travail perso' },
];

export default function StepSchedule({ data, update, saveProfile, next, back }) {
  const [auto, setAuto] = useState(data.auto_planning !== false);
  const [days, setDays] = useState({});
  const [busy, setBusy] = useState(false);
  const available = data.available_days?.length ? data.available_days : [1, 2, 3, 4, 5];

  useEffect(() => {
    (async () => {
      const blocks = await base44.entities.TimeBlock.filter({ label: 'Journée occupée' });
      const map = {};
      blocks.forEach((b) => { map[b.day_of_week] = { start: b.start_time, end: b.end_time, commute: 0, id: b.id }; });
      setDays(map);
    })();
  }, []);

  const setDay = (js, key, value) => setDays((d) => ({ ...d, [js]: { start: '09:00', end: '17:00', commute: 0, ...d[js], [key]: value } }));

  const toggleDay = (js) => {
    const nextDays = available.includes(js) ? available.filter((d) => d !== js) : [...available, js];
    update({ available_days: nextDays });
  };

  const submit = async () => {
    setBusy(true);
    await saveProfile({
      auto_planning: auto,
      wake_time: data.wake_time || '07:00',
      sleep_time: data.sleep_time || '23:00',
      available_days: available,
      preferred_slots: data.preferred_slots || {},
    });

    const existing = await base44.entities.TimeBlock.filter({ label: 'Journée occupée' });
    const byDay = Object.fromEntries(existing.map((b) => [Number(b.day_of_week), b]));

    for (const day of DAYS) {
      const entry = days[day.js];
      const record = byDay[day.js];
      if (entry?.start && entry?.end) {
        const end = toTime(toMinutes(entry.end) + (Number(entry.commute) || 0));
        const payload = { label: 'Journée occupée', type: 'travail', day_of_week: day.js, start_time: entry.start, end_time: end, recurring: true };
        if (record) await base44.entities.TimeBlock.update(record.id, payload);
        else await base44.entities.TimeBlock.create(payload);
      } else if (record) {
        await base44.entities.TimeBlock.delete(record.id);
      }
    }
    setBusy(false);
    next();
  };

  return (
    <div>
      <h2 className="font-display text-2xl leading-tight">Ton emploi du temps</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        GlowUp ne programme jamais de tâche pendant tes cours, ton travail ou tes trajets.
      </p>

      <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-border/70 p-4">
        <div>
          <p className="text-sm font-medium">Créer mon planning automatiquement</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Sinon, tu auras un planning flexible sans heures fixes.
          </p>
        </div>
        <Switch checked={auto} onCheckedChange={setAuto} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Réveil</Label>
          <Input type="time" value={data.wake_time || '07:00'} onChange={(e) => update({ wake_time: e.target.value })} className="mt-2 h-12 rounded-2xl" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Coucher</Label>
          <Input type="time" value={data.sleep_time || '23:00'} onChange={(e) => update({ sleep_time: e.target.value })} className="mt-2 h-12 rounded-2xl" />
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Jours disponibles</Label>
        <div className="mt-2 flex gap-2">
          {DAYS.map((d) => (
            <button
              key={d.js}
              onClick={() => toggleDay(d.js)}
              className={cn(
                'h-10 flex-1 rounded-xl border text-xs transition-all',
                available.includes(d.js) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
              )}
            >
              {d.short}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Journées occupées</Label>
        <p className="mt-1 text-[11px] text-muted-foreground">Laisse vide les jours sans obligation fixe.</p>
        <div className="mt-3 space-y-2">
          {DAYS.filter((d) => available.includes(d.js)).map((d) => (
            <div key={d.js} className="surface flex flex-wrap items-center gap-2 p-3">
              <span className="w-10 text-xs font-medium">{d.short}</span>
              <Input type="time" value={days[d.js]?.start || ''} onChange={(e) => setDay(d.js, 'start', e.target.value)} className="h-9 w-[104px] rounded-xl" />
              <span className="text-xs text-muted-foreground">→</span>
              <Input type="time" value={days[d.js]?.end || ''} onChange={(e) => setDay(d.js, 'end', e.target.value)} className="h-9 w-[104px] rounded-xl" />
              <Input
                type="number" min="0" step="5"
                value={days[d.js]?.commute ?? ''}
                onChange={(e) => setDay(d.js, 'commute', e.target.value)}
                placeholder="Trajet"
                className="h-9 w-[84px] rounded-xl"
              />
              <span className="text-[10px] text-muted-foreground">min de trajet</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Tes créneaux préférés</Label>
        <div className="mt-3 space-y-2">
          {SLOT_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 px-4 py-2.5">
              <span className="text-sm">{f.label}</span>
              <Select
                value={data.preferred_slots?.[f.key] || 'soir'}
                onValueChange={(v) => update({ preferred_slots: { ...(data.preferred_slots || {}), [f.key]: v } })}
              >
                <SelectTrigger className="h-9 w-[132px] rounded-xl text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SLOT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <Actions onBack={back} onNext={submit} busy={busy} />
    </div>
  );
}