import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const DURATIONS = [5, 10, 15, 25, 50];

export default function FocusTimer({ open, onOpenChange, task, onComplete, initialMinutes }) {
  const [minutes, setMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!open) return;
    const start = Number(initialMinutes) > 0 ? Number(initialMinutes) : 10;
    setMinutes(start);
    setSecondsLeft(start * 60);
    setRunning(false);
    setFinished(false);
  }, [open, initialMinutes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const pick = (m) => {
    setMinutes(m);
    setSecondsLeft(m * 60);
    setRunning(false);
    setFinished(false);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">Minuteur de concentration</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{task ? task.title : 'Choisis une durée et lance-toi.'}</p>

        <div className="flex flex-wrap gap-2 py-2">
          {DURATIONS.map((m) => (
            <button
              key={m}
              onClick={() => pick(m)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs transition-colors',
                minutes === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
              )}
            >
              {m} min
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center py-4">
          <span className="font-display text-5xl tabular-nums tracking-tight">{mm}:{ss}</span>
          {finished && <p className="mt-2 text-sm text-primary">C’est fait. Même 5 minutes comptent.</p>}
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 rounded-full" onClick={() => setRunning((r) => !r)} disabled={finished}>
            {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {running ? 'Pause' : 'Démarrer'}
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => pick(minutes)} aria-label="Réinitialiser">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {task && (
          <Button variant="secondary" className="mt-1 rounded-full" onClick={() => { onComplete?.(task); onOpenChange(false); }}>
            Marquer la tâche comme terminée
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}