import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Trash2 } from 'lucide-react';
import { GOAL_OPTIONS } from '@/lib/constants';

const empty = { title: '', goal_type: '', desired_outcome: '', current_level: '', importance: 'moyenne', target_date: '', notes: '', progress: 0, milestones: [] };

export default function GoalDialog({ open, onOpenChange, goal, onSave, onDelete }) {
  const [form, setForm] = useState(empty);
  const [milestone, setMilestone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setMilestone('');
    setForm(goal ? { ...empty, ...goal, milestones: goal.milestones || [] } : empty);
  }, [open, goal]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const addMilestone = () => {
    if (!milestone.trim()) return;
    set('milestones', [...form.milestones, { title: milestone.trim(), done: false }]);
    setMilestone('');
  };

  const save = async () => {
    if (!form.title.trim()) { setError('Donne un titre à ton objectif.'); return; }
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        goal_type: form.goal_type || '',
        desired_outcome: form.desired_outcome || '',
        current_level: form.current_level || '',
        importance: form.importance,
        target_date: form.target_date || '',
        notes: form.notes || '',
        progress: Number(form.progress) || 0,
        milestones: form.milestones,
      });
      onOpenChange(false);
    } catch (e) {
      setError('Impossible d’enregistrer. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{goal ? 'Modifier l’objectif' : 'Nouvel objectif'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5">
          <div>
            <Label className="text-xs text-muted-foreground">Titre</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex. Courir 5 km sans m’arrêter" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Catégorie</Label>
            <Select value={form.goal_type || 'aucun'} onValueChange={(v) => set('goal_type', v === 'aucun' ? '' : v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aucun">Objectif personnel</SelectItem>
                {GOAL_OPTIONS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Résultat souhaité</Label>
            <Textarea rows={2} value={form.desired_outcome} onChange={(e) => set('desired_outcome', e.target.value)} className="mt-1 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Importance</Label>
              <Select value={form.importance} onValueChange={(v) => set('importance', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="haute">Essentiel</SelectItem>
                  <SelectItem value="moyenne">Important</SelectItem>
                  <SelectItem value="basse">Secondaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Échéance</Label>
              <Input type="date" value={form.target_date} onChange={(e) => set('target_date', e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Étapes</Label>
            <div className="mt-1 space-y-1.5">
              {form.milestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs">
                  <span className="min-w-0 flex-1 truncate">{m.title}</span>
                  <button onClick={() => set('milestones', form.milestones.filter((_, idx) => idx !== i))} aria-label="Supprimer">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }}
                placeholder="Ajouter une étape"
                className="h-9 text-xs"
              />
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={addMilestone} aria-label="Ajouter">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!form.milestones.length && (
            <div>
              <Label className="text-xs text-muted-foreground">Progression manuelle : {form.progress}%</Label>
              <Slider value={[Number(form.progress) || 0]} max={100} step={5} onValueChange={([v]) => set('progress', v)} className="mt-2" />
              <p className="mt-1 text-[10px] text-muted-foreground">Ajoute des étapes pour un suivi automatique.</p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            {goal && onDelete && (
              <Button variant="ghost" size="icon" className="rounded-full text-destructive" onClick={() => onDelete(goal)} aria-label="Supprimer">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button className="flex-1 rounded-full" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}