import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const DURATIONS = [10, 15, 20, 30];
const LEVELS = ['débutant', 'intermédiaire', 'avancé'];

export default function LessonDialog({ open, onOpenChange, topics, busy, onGenerate }) {
  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState(15);
  const [level, setLevel] = useState('débutant');

  const suggestions = (topics || []).slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-base">Nouvelle leçon</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {suggestions.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Tes thèmes</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setTopic(item)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[11px] transition-colors',
                      topic === item ? 'border-primary bg-primary/15' : 'border-border/70 text-muted-foreground'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Sujet</Label>
            <Input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Ex. : la Révolution française, les trous noirs, l’inflation"
              className="mt-1 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Durée</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {DURATIONS.map((value) => (
                  <button
                    key={value}
                    onClick={() => setMinutes(value)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px]',
                      minutes === value ? 'border-primary bg-primary/15' : 'border-border/70 text-muted-foreground'
                    )}
                  >
                    {value} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Niveau</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {LEVELS.map((value) => (
                  <button
                    key={value}
                    onClick={() => setLevel(value)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px]',
                      level === value ? 'border-primary bg-primary/15' : 'border-border/70 text-muted-foreground'
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            className="w-full rounded-full py-5"
            disabled={busy || topic.trim().length < 3}
            onClick={() => onGenerate({ topic: topic.trim(), minutes, level })}
          >
            <Sparkles className="h-4 w-4" />
            {busy ? 'Mimo rédige la leçon…' : 'Créer la leçon'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}