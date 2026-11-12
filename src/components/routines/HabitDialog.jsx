import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DAYS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function HabitDialog({ open, onOpenChange, habit, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState(7);
  const [reminder, setReminder] = useState('');
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setName(habit?.name || '');
    setTarget(habit?.target_per_week || 7);
    setReminder(habit?.reminder_time || '');
    setDays(habit?.days?.length ? habit.days : [1, 2, 3, 4, 5, 6, 0]);
  }, [open, habit]);

  const save = async () => {
    if (!name.trim()) { setError('Donne un nom à ton habitude.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), target_per_week: Number(target) || 7, reminder_time: reminder, days, frequency: 'quotidien', active: true });
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
          <DialogTitle className="font-display text-xl font-normal">{habit ? 'Modifier l’habitude' : 'Nouvelle habitude'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5">
          <div>
            <Label className="text-xs text-muted-foreground">Habitude</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. 10 minutes de rangement" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Objectif / semaine</Label>
              <Input type="number" min="1" max="7" value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Rappel</Label>
              <Input type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} className="mt-1" />
            </div>
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
            {habit && onDelete && (
              <Button variant="ghost" className="rounded-full text-destructive" onClick={() => onDelete(habit)}>Supprimer</Button>
            )}
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button className="flex-1 rounded-full" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}