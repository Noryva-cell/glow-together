import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { CATEGORIES, PRIORITIES } from '@/lib/constants';

const empty = { title: '', description: '', instructions: '', category: 'organisation', date: '', start_time: '', duration_minutes: 30, priority: 'moyenne', recurrence: 'aucune', goal_id: '' };

export default function TaskDialog({ open, onOpenChange, task, defaultDate, defaultTime, goals = [], onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      task
        ? { ...empty, ...task }
        : { ...empty, date: defaultDate || new Date().toISOString().slice(0, 10), start_time: defaultTime || '' }
    );
  }, [open, task, defaultDate, defaultTime]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const remove = async () => {
    await base44.entities.Task.delete(task.id);
    onSaved?.();
    onOpenChange(false);
  };

  const save = async () => {
    if (!form.title.trim()) { setError('Donne un titre à ta tâche.'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description || '',
      instructions: form.instructions || '',
      category: form.category,
      date: form.date,
      start_time: form.start_time || '',
      duration_minutes: Number(form.duration_minutes) || 30,
      priority: form.priority,
      recurrence: form.recurrence,
      goal_id: form.goal_id || '',
      status: form.status || 'a_faire',
    };
    try {
      if (task?.id) await base44.entities.Task.update(task.id, payload);
      else await base44.entities.Task.create(payload);
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      setError('Impossible d’enregistrer la tâche. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5">
          <div>
            <Label className="text-xs text-muted-foreground">Titre</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex. Séance de renforcement" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description (facultatif)</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} className="mt-1 resize-none" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Consignes détaillées (facultatif)</Label>
            <Textarea
              value={form.instructions || ''}
              onChange={(e) => set('instructions', e.target.value)}
              rows={3}
              placeholder="Ce que tu dois faire, étape par étape."
              className="mt-1 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Priorité</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Heure</Label>
              <Input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Durée (min)</Label>
              <Input type="number" min="5" step="5" value={form.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Répétition</Label>
              <Select value={form.recurrence} onValueChange={(v) => set('recurrence', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucune">Aucune</SelectItem>
                  <SelectItem value="quotidien">Chaque jour</SelectItem>
                  <SelectItem value="jours_ouvres">Jours ouvrés</SelectItem>
                  <SelectItem value="hebdomadaire">Chaque semaine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {goals.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Objectif lié</Label>
              <Select value={form.goal_id || 'none'} onValueChange={(v) => set('goal_id', v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Aucun" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {goals.map((g) => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            {task?.id && (
              <Button variant="ghost" className="rounded-full px-3 text-destructive" onClick={remove} aria-label="Supprimer la tâche">
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