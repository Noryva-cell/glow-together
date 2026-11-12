import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BLOCK_TYPES, DAYS } from '@/lib/constants';

const empty = { label: '', type: 'travail', day_of_week: 1, start_time: '09:00', end_time: '17:00' };

export default function BlockDialog({ open, onOpenChange, block, onSave, onDelete }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(block ? { ...empty, ...block } : empty);
      setError('');
    }
  }, [open, block]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.label.trim() || !form.start_time || !form.end_time) { setError('Renseigne un libellé et des horaires.'); return; }
    if (form.end_time <= form.start_time) { setError('L’heure de fin doit être après le début.'); return; }
    setSaving(true);
    try {
      await onSave({ ...form, day_of_week: Number(form.day_of_week), recurring: true });
      onOpenChange(false);
    } catch (e) {
      setError('Impossible d’enregistrer. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{block ? 'Modifier le créneau' : 'Nouveau créneau'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5">
          <div>
            <Label className="text-xs text-muted-foreground">Libellé</Label>
            <Input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="Ex. Cours du soir" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Jour</Label>
              <Select value={String(form.day_of_week)} onValueChange={(v) => set('day_of_week', Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => <SelectItem key={d.js} value={String(d.js)}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Début</Label>
              <Input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fin</Label>
              <Input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} className="mt-1" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            {block && onDelete && (
              <Button variant="ghost" className="rounded-full text-destructive" onClick={() => onDelete(block)}>Supprimer</Button>
            )}
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button className="flex-1 rounded-full" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}