import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { CATEGORY_MAP } from '@/lib/constants';
import { durationLabel, FEEDBACK_LABEL } from '@/lib/activity';
import { AlertTriangle, CheckCircle2, Flag, Package, Play, Repeat, ShieldCheck, Trash2 } from 'lucide-react';
import FeedbackDialog from './FeedbackDialog';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl bg-muted/40 px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      <div className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

export default function ActivitySheet({ task, open, onOpenChange, onChanged }) {
  const [doneSteps, setDoneSteps] = useState([]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setDoneSteps(task?.done_steps || []);
    setNotes(task?.user_notes || '');
    setNotice('');
  }, [task]);

  if (!task) return null;

  const steps = task.steps || [];
  const stepMinutes = steps.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
  const cat = CATEGORY_MAP[task.category] || {};
  const finished = task.status === 'terminee';

  const update = async (payload) => {
    await base44.entities.Task.update(task.id, payload);
    onChanged?.();
  };

  const toggleStep = async (index) => {
    const next = doneSteps.includes(index) ? doneSteps.filter((i) => i !== index) : [...doneSteps, index];
    setDoneSteps(next);
    await update({ done_steps: next });
  };

  const start = async () => {
    setBusy(true);
    await update({ started_at: new Date().toISOString(), status: 'en_cours' });
    setBusy(false);
    setNotice('Activité démarrée. Prends ton temps.');
  };

  const saveNotes = async () => {
    await update({ user_notes: notes });
    setNotice('Tes notes sont enregistrées.');
  };

  const remove = async () => {
    if (!window.confirm('Supprimer cette activité du planning ?')) return;
    await base44.entities.Task.delete(task.id);
    onOpenChange(false);
    onChanged?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-3xl">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('rounded-full px-2.5 py-1 text-[10px]', cat.chip || 'bg-muted text-foreground')}>
                {cat.label || 'Activité'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {durationLabel(task.duration_minutes)}
                {task.start_time ? ` · ${task.start_time}` : ''}
                {task.date ? ` · ${format(parseISO(task.date), 'EEEE d MMMM', { locale: fr })}` : ''}
              </span>
              {finished && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Terminée</span>
              )}
            </div>
            <DialogTitle className="mt-2 font-display text-xl font-normal leading-snug">{task.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2.5">
            {task.feedback_status && (
              <p className="rounded-2xl border border-primary/25 bg-primary/5 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
                Ton bilan : {FEEDBACK_LABEL[task.feedback_status] || task.feedback_status}
                {task.feedback_note ? ` — « ${task.feedback_note} »` : ''}
              </p>
            )}

            {task.objective && (
              <p className="px-1 text-[12.5px] leading-relaxed text-muted-foreground">{task.objective}</p>
            )}

            {steps.length > 0 ? (
              <div>
                <p className="px-1 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Étapes{stepMinutes ? ` · ≈ ${stepMinutes} min` : ''}
                </p>
                <ol className="mt-1.5 space-y-1.5">
                  {steps.map((step, index) => {
                    const checked = doneSteps.includes(index);
                    return (
                      <li key={`${index}-${step.title}`}>
                        <button
                          onClick={() => toggleStep(index)}
                          className={cn(
                            'w-full rounded-2xl border px-3.5 py-2.5 text-left transition-colors',
                            checked ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-card/60'
                          )}
                        >
                          <p className="flex items-center gap-2 text-[12.5px] font-medium">
                            {checked ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border text-[9px] text-muted-foreground">
                                {index + 1}
                              </span>
                            )}
                            <span className="flex-1">{step.title}</span>
                            {step.minutes ? <span className="shrink-0 text-[10px] text-muted-foreground">{step.minutes} min</span> : null}
                          </p>
                          <p className="mt-1 pl-6 text-[11.5px] leading-relaxed text-muted-foreground">{step.detail}</p>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : (
              <Section icon={Flag} title="Consignes">
                <p>{task.instructions || 'Aucune consigne détaillée pour cette activité. Tu peux écrire les tiennes ci-dessous.'}</p>
              </Section>
            )}

            {steps.length > 0 && task.instructions && (
              <Section icon={Flag} title="Consignes générales">{task.instructions}</Section>
            )}
            {task.materials && <Section icon={Package} title="Matériel / produits">{task.materials}</Section>}
            {task.errors && <Section icon={AlertTriangle} title="Erreurs à éviter">{task.errors}</Section>}
            {task.adaptations && <Section icon={Repeat} title="Si c’est trop dur / trop facile">{task.adaptations}</Section>}
            {task.caution && <Section icon={ShieldCheck} title="Quand s’arrêter">{task.caution}</Section>}
            {task.description && !steps.length && <Section icon={Flag} title="But">{task.description}</Section>}

            <div>
              <p className="px-1 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Tes notes</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ce que tu veux ajouter ou modifier dans cette activité."
                className="mt-1.5 resize-none"
              />
              <button onClick={saveNotes} className="mt-1.5 text-[11px] text-primary">Enregistrer mes notes</button>
            </div>

            {notice && <p className="px-1 text-[11.5px] text-primary">{notice}</p>}
            {task.feedback_pain && (
              <p className="flex items-start gap-1.5 rounded-2xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-destructive">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Douleur signalée : pas de progression proposée. Arrête l’activité et demande un avis professionnel si cela persiste.
              </p>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Button variant="ghost" className="rounded-full px-3 text-destructive" onClick={remove} aria-label="Supprimer">
              <Trash2 className="h-4 w-4" />
            </Button>
            {!task.started_at ? (
              <Button variant="outline" className="flex-1 rounded-full" onClick={start} disabled={busy}>
                <Play className="h-4 w-4" /> Commencer
              </Button>
            ) : (
              <Button
                className="flex-1 rounded-full"
                onClick={() => setFeedbackOpen(true)}
              >
                <CheckCircle2 className="h-4 w-4" /> {finished ? 'Refaire le bilan' : 'Terminer'}
              </Button>
            )}
            {task.started_at && !finished && (
              <Button variant="outline" className="rounded-full" onClick={() => setFeedbackOpen(true)}>Bilan</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        task={task}
        doneSteps={doneSteps}
        onSaved={() => { onChanged?.(); }}
      />
    </>
  );
}