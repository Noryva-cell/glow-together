import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { DIFFICULTY_OPTIONS, FEEDBACK_OPTIONS, PAIN_DOMAINS, PROGRAM_DOMAINS } from '@/lib/activity';
import { cn } from '@/lib/utils';

export default function FeedbackDialog({ open, onOpenChange, task, doneSteps = [], onSaved }) {
  const [status, setStatus] = useState('reussi');
  const [difficulty, setDifficulty] = useState('adaptee');
  const [feeling, setFeeling] = useState(3);
  const [note, setNote] = useState('');
  const [pain, setPain] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setStatus('reussi');
    setDifficulty('adaptee');
    setFeeling(3);
    setNote('');
    setPain(false);
    setResult(null);
    setError('');
  }, [open, task?.id]);

  const showPain = PAIN_DOMAINS.includes(task?.domain) || ['sport', 'beaute'].includes(task?.category);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await base44.entities.ActivityFeedback.create({
        task_id: task.id,
        template_id: task.template_id || '',
        program_id: task.program_id || '',
        domain: task.domain || task.category || '',
        title: task.title,
        date: task.date,
        status,
        difficulty,
        feeling,
        note,
        pain,
        done_steps: doneSteps,
      });

      await base44.entities.Task.update(task.id, {
        status: status === 'non_fait' ? 'a_faire' : 'terminee',
        completed_at: status === 'non_fait' ? '' : new Date().toISOString(),
        done_steps: doneSteps,
        feedback_status: status,
        feedback_difficulty: difficulty,
        feedback_feeling: feeling,
        feedback_note: note,
        feedback_pain: pain,
      });

      onSaved?.();

      const domain = task.domain || task.category;
      if (!PROGRAM_DOMAINS.includes(domain)) {
        setResult({ saved: true });
        return;
      }

      const response = await base44.functions.invoke('adaptProgram', { domain, task_id: task.id });
      setResult(response.data || { saved: true });
    } catch (e) {
      setError('Ton bilan a peut-être été enregistré, mais l’adaptation n’a pas pu être proposée.');
      setResult({ saved: true, failed: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">
            {result ? 'Bilan enregistré' : 'Ton bilan'}
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Ce que tu réponds ici sert à adapter la prochaine séance, pas seulement à te féliciter.
            </p>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Résultat</Label>
              <div className="grid gap-1.5">
                {FEEDBACK_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatus(option.value)}
                    className={cn(
                      'rounded-2xl border px-3.5 py-2.5 text-left text-[12.5px] transition-colors',
                      status === option.value
                        ? 'border-primary/50 bg-primary/5 text-foreground'
                        : 'border-border/60 text-muted-foreground'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Difficulté</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Ressenti</Label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setFeeling(value)}
                    className={cn(
                      'h-9 flex-1 rounded-xl border text-[12px] transition-colors',
                      feeling === value ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground'
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Ce qui a posé problème</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ex. le dernier exercice m’a essoufflé, je n’ai pas compris la position."
                className="mt-1.5 resize-none"
              />
            </div>

            {showPain && (
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 px-3.5 py-3">
                <div>
                  <p className="text-[12px] font-medium">Douleur ou réaction inhabituelle</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    Aucune progression ne sera proposée.
                  </p>
                </div>
                <Switch checked={pain} onCheckedChange={setPain} />
              </div>
            )}

            {error && <p className="text-[11.5px] text-destructive">{error}</p>}

            <Button className="w-full rounded-full" onClick={save} disabled={saving}>
              {saving ? 'Mimo analyse ton bilan…' : 'Enregistrer mon bilan'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {result.safe === false ? (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[12px] leading-relaxed text-destructive">
                {result.message}
              </p>
            ) : result.proposal ? (
              <>
                <p className="text-[12.5px] leading-relaxed">
                  Mimo propose une version {result.proposal.version} de ton programme, à partir de ton bilan.
                </p>
                <p className="rounded-2xl bg-muted/50 px-4 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
                  {result.proposal.rationale}
                </p>
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                  Rien n’est changé tant que tu n’as pas accepté la proposition.
                </p>
                <Button asChild className="w-full rounded-full">
                  <Link to="/programme" onClick={() => onOpenChange(false)}>Voir la proposition</Link>
                </Button>
              </>
            ) : (
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                Ton bilan est enregistré. Il sera utilisé dès que Mimo préparera ta prochaine séance.
              </p>
            )}
            <Button variant="outline" className="w-full rounded-full" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}