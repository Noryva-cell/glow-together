import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DAYS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function RoutineDialog({ open, onOpenChange, routine, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [moment, setMoment] = useState('matin');
  const [steps, setSteps] = useState('');
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setName(routine?.name || '');
    setMoment(routine?.moment || 'matin');
    setSteps((routine?.steps || []).join('\n'));
    setDays(routine?.days?.length ? routine.days : [1, 2, 3, 4, 5, 6, 0]);
  }, [open, routine]);

  const save = async () => {
    if (!name.trim()) { setError('Donne un nom à ta routine.'); return; }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        moment,
        steps: steps.split('\n').map((s) => s.trim()).filter(Boolean),
        days,
        active: true,
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
          <DialogTitle className="font-display text-xl font-normal">{routine ? 'Modifier la routine' : 'Nouvelle routine'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5">
          <div>
            <Label className="text-xs text-muted-foreground">Nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Routine peau du soir" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Moment</Label>
            <Select value={moment} onValueChange={setMoment}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="matin">Matin</SelectItem>
                <SelectItem value="soir">Soir</SelectItem>
                <SelectItem value="autre">À tout moment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Étapes (une par ligne)</Label>
            <Textarea rows={5} value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={'Nettoyer\nSérum\nHydrater'} className="mt-1 resize-none" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Jours</Label>
            <div className="mt-1.5 flex gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.js}
                  onClick={() => setDays((prev) => (prev.includes(d.js) ? prev.filter((x) => x !== d.js) : [...prev, d.js]))}
                  className={cn(
                    'h-9 flex-1 rounded-lg border text-[10px] transition-all',
                    days.includes(d.js) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-2 pt-1">
            {routine && onDelete && (
              <Button variant="ghost" className="rounded-full text-destructive" onClick={() => onDelete(routine)}>Supprimer</Button>
            )}
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button className="flex-1 rounded-full" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}