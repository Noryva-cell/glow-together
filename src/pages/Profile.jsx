import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Download, Trash2, Plus, Pencil, Clock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BlockDialog from '@/components/BlockDialog';
import { COACHING_STYLES, DAYS, BLOCK_TYPES } from '@/lib/constants';
import { cleanProfile } from '@/lib/profile';
import { cn } from '@/lib/utils';

const Section = ({ title, description, children, action }) => (
  <section className="surface rise p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-lg leading-tight">{title}</h2>
        {description && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
    <div className="mt-4 space-y-3">{children}</div>
  </section>
);

export default function Profile() {
  const { profile, refreshProfile } = useOutletContext();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const loadBlocks = async () => setBlocks(await base44.entities.TimeBlock.filter({}));

  useEffect(() => { loadBlocks(); }, []);

  if (!form) {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await base44.entities.UserProfile.update(profile.id, cleanProfile(form));
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveBlock = async (payload) => {
    if (editingBlock?.id) await base44.entities.TimeBlock.update(editingBlock.id, payload);
    else await base44.entities.TimeBlock.create(payload);
    loadBlocks();
  };

  const deleteBlock = async (block) => {
    await base44.entities.TimeBlock.delete(block.id);
    setBlockOpen(false);
    loadBlocks();
  };

  const exportData = async () => {
    const [tasks, goals, habits, habitLogs, routines, routineLogs, blocks, profiles] = await Promise.all([
      base44.entities.Task.filter({}),
      base44.entities.Goal.filter({}),
      base44.entities.Habit.filter({}),
      base44.entities.HabitLog.filter({}),
      base44.entities.Routine.filter({}),
      base44.entities.RoutineLog.filter({}),
      base44.entities.TimeBlock.filter({}),
      base44.entities.UserProfile.filter({}),
    ]);
    const payload = { exported_at: new Date().toISOString(), tasks, goals, habits, habitLogs, routines, routineLogs, timeBlocks: blocks, profiles };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'glowup-donnees.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteAllData = async () => {
    const owner = { created_by_id: profile.created_by_id };
    await Promise.all([
      base44.entities.Task.deleteMany(owner),
      base44.entities.HabitLog.deleteMany(owner),
      base44.entities.RoutineLog.deleteMany(owner),
      base44.entities.Habit.deleteMany(owner),
      base44.entities.Routine.deleteMany(owner),
      base44.entities.Goal.deleteMany(owner),
      base44.entities.TimeBlock.deleteMany(owner),
    ]);
    await base44.entities.UserProfile.delete(profile.id);
    base44.auth.logout();
  };

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Mon espace" title="Mon profil" subtitle="Tout ce que GlowUp sait de toi, et rien de plus." />

      <Section title="Informations personnelles" description="Modifiables à tout moment.">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Prénom / pseudo</Label>
            <Input value={form.nickname || ''} onChange={(e) => set('nickname', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Âge</Label>
            <Input value={form.age_range || ''} onChange={(e) => set('age_range', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Taille (cm)</Label>
            <Input type="number" value={form.height_cm || ''} onChange={(e) => set('height_cm', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Poids (kg)</Label>
            <Input type="number" value={form.weight_kg || ''} onChange={(e) => set('weight_kg', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Temps libre / jour (min)</Label>
            <Input type="number" value={form.free_minutes_per_day || ''} onChange={(e) => set('free_minutes_per_day', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Budget mensuel (€)</Label>
            <Input type="number" value={form.monthly_budget || ''} onChange={(e) => set('monthly_budget', e.target.value)} className="mt-1" />
          </div>
        </div>
      </Section>

      <Section title="Mes disponibilités" description="GlowUp ne programme jamais de tâche sur ces créneaux." action={
        <button onClick={() => { setEditingBlock(null); setBlockOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Ajouter un créneau">
          <Plus className="h-3.5 w-3.5" />
        </button>
      }>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Réveil</Label>
            <Input type="time" value={form.wake_time || '07:00'} onChange={(e) => set('wake_time', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Coucher</Label>
            <Input type="time" value={form.sleep_time || '23:00'} onChange={(e) => set('sleep_time', e.target.value)} className="mt-1" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Jours disponibles</Label>
          <div className="mt-1.5 flex gap-1.5">
            {DAYS.map((d) => {
              const list = form.available_days || [];
              const active = list.includes(d.js);
              return (
                <button
                  key={d.js}
                  onClick={() => set('available_days', active ? list.filter((x) => x !== d.js) : [...list, d.js])}
                  className={cn('h-9 flex-1 rounded-lg border text-[10px] transition-all', active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          {blocks.length ? blocks
            .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
            .map((b) => (
              <button key={b.id} onClick={() => { setEditingBlock(b); setBlockOpen(true); }} className="flex w-full items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-left">
                <span className="w-9 text-[10px] uppercase text-muted-foreground">{DAYS.find((d) => d.js === Number(b.day_of_week))?.short}</span>
                <span className="min-w-0 flex-1 truncate text-xs">{b.label}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" />{b.start_time}–{b.end_time}</span>
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </button>
            )) : (
            <p className="text-[11px] text-muted-foreground">Aucun créneau fixe. Ton planning restera flexible.</p>
          )}
        </div>
      </Section>

      <Section title="Mon style d’accompagnement" description="Le ton des messages, jamais les faits.">
        <div className="grid grid-cols-2 gap-2">
          {COACHING_STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => set('coaching_style', s.value)}
              className={cn('rounded-2xl border p-3 text-left transition-all', form.coaching_style === s.value ? 'border-primary bg-primary/5' : 'border-border')}
            >
              <p className="text-sm font-medium">{s.label}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Rappels dans l’application</Label>
          <Select value={form.reminder_frequency || 'quotidien'} onValueChange={(v) => set('reminder_frequency', v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="jamais">Jamais</SelectItem>
              <SelectItem value="quotidien">Une fois par jour</SelectItem>
              <SelectItem value="deux_fois">Deux fois par jour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <div className="flex items-center gap-2">
        <Button className="flex-1 rounded-full py-5" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer mes informations'}</Button>
        {saved && <span className="text-xs text-primary">Enregistré</span>}
      </div>

      <Section title="Mon compte" description={profile?.created_by || 'Compte GlowUp'}>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={exportData}><Download className="mr-2 h-4 w-4" />Exporter mes données</Button>
          <Link to="/onboarding" className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Revoir mon questionnaire
          </Link>
          <Button variant="outline" className="rounded-full" onClick={() => base44.auth.logout()}><LogOut className="mr-2 h-4 w-4" />Déconnexion</Button>
        </div>
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4">
          <p className="text-sm font-medium">Supprimer toutes mes données</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Tes tâches, objectifs, routines et habitudes sont définitivement effacés. Cette action est irréversible.
          </p>
          {confirmDelete ? (
            <div className="mt-3 flex gap-2">
              <Button variant="destructive" className="rounded-full" onClick={deleteAllData}>Confirmer la suppression</Button>
              <Button variant="ghost" className="rounded-full" onClick={() => setConfirmDelete(false)}>Annuler</Button>
            </div>
          ) : (
            <Button variant="ghost" className="mt-2 rounded-full text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" />Supprimer mes données
            </Button>
          )}
        </div>
      </Section>

      <BlockDialog open={blockOpen} onOpenChange={setBlockOpen} block={editingBlock} onSave={saveBlock} onDelete={deleteBlock} />
    </div>
  );
}