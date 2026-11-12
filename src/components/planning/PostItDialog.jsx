import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/constants';

const empty = { name: '', category: 'organisation', duration_minutes: 30, objective: '', instructions: '', materials: '' };

export default function PostItDialog({ open, onOpenChange, template, onSave, onDelete }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    setForm(template ? { ...empty, ...template } : empty);
    setError('');
  }, [open, template]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) { setError('Donne un nom à ton post-it.'); return; }
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        duration_minutes: Number(form.duration_minutes) || 30,
        objective: form.objective || '',
        instructions: form.instructions || '',
        materials: form.materials || '',
      });
      onOpenChange(false);
    } catch (e) {
      setError('Impossible d’enregistrer ce post-it. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">{template ? 'Modifier le post-it' : 'Nouveau post-it'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5">
          <div>
            <Label className="text-xs text-muted-foreground">Nom</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex. Étirements du soir" className="mt-1" />
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
              <Label className="text-xs text-muted-foreground">Durée (min)</Label>
              <Input type="number" min="5" step="5" value={form.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">But de l’activité</Label>
            <Input value={form.objective} onChange={(e) => set('objective', e.target.value)} placeholder="Ex. relâcher le dos après la journée" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tes consignes (facultatif)</Label>
            <Textarea value={form.instructions} onChange={(e) => set('instructions', e.target.value)} rows={4} placeholder="Ce que tu dois faire, étape par étape." className="mt-1 resize-none" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Matériel (facultatif)</Label>
            <Input value={form.materials} onChange={(e) => set('materials', e.target.value)} className="mt-1" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            {template?.id && onDelete && (
              <Button variant="ghost" className="rounded-full px-3 text-destructive" onClick={() => onDelete(template)}>Supprimer</Button>
            )}
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button className="flex-1 rounded-full" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}