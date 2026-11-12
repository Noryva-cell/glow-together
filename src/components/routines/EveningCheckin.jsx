import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { CheckCircle2, Loader2, Moon, Pencil, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const ENERGY = [
  { value: 1, label: 'À plat' },
  { value: 2, label: 'Fatiguée' },
  { value: 3, label: 'Ça va' },
  { value: 4, label: 'Bien' },
  { value: 5, label: 'En forme' },
];

export default function EveningCheckin() {
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const [tasks, setTasks] = useState([]);
  const [review, setReview] = useState(null);
  const [checked, setChecked] = useState([]);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Task.filter({ date: todayKey }, { sort: 'start_time', limit: 40 }),
      base44.entities.DailyReview.filter({ date: todayKey }, { limit: 1 }),
    ])
      .then(([taskPage, reviewPage]) => {
        if (!alive) return;
        const list = taskPage.items || [];
        const found = (reviewPage.items || [])[0] || null;
        setTasks(list);
        setReview(found);
        if (found) {
          const titles = found.done_titles || [];
          setChecked(list.filter((task) => titles.includes(task.title)).map((task) => task.id));
          setEnergy(found.energy || 3);
          setNote(found.note || '');
        } else {
          setChecked(list.filter((task) => task.status === 'terminee').map((task) => task.id));
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [todayKey]);

  const toggle = (id) => {
    setChecked((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const done = tasks.filter((task) => checked.includes(task.id));
      const missed = tasks.filter((task) => !checked.includes(task.id));
      const response = await base44.functions.invoke('dailyReview', {
        date: todayKey,
        energy,
        done: done.map((task) => task.title),
        missed: missed.map((task) => task.title),
        note,
      });
      const saved = response.data?.review;
      if (!saved) throw new Error('missing review');
      setReview(saved);
      setEditing(false);
    } catch (e) {
      setError('Mimo n’a pas pu enregistrer le bilan. Réessaie dans un instant.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  const showForm = !review || editing;

  return (
    <div className="surface px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <Moon className="h-3 w-3" /> Bilan du soir
          </p>
          <p className="mt-1 font-display text-[15px] leading-snug">
            {showForm ? 'Qu’as-tu vraiment fait aujourd’hui ?' : 'Ce que Mimo retient de ta journée'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setEditing(true)}
            className="flex shrink-0 items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[10px] text-muted-foreground"
          >
            <Pencil className="h-3 w-3" /> Modifier
          </button>
        )}
      </div>

      {showForm ? (
        <div className="mt-3.5 space-y-3.5">
          <div>
            <p className="text-[11px] text-muted-foreground">Ton énergie ce soir</p>
            <div className="mt-1.5 flex gap-1.5">
              {ENERGY.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setEnergy(option.value)}
                  className={cn(
                    'flex-1 rounded-xl border py-2 text-[10px] transition-colors',
                    energy === option.value
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border/60 text-muted-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground">Ce que tu as coché</p>
            {tasks.length ? (
              <div className="mt-1.5 space-y-1.5">
                {tasks.map((task) => {
                  const on = checked.includes(task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggle(task.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-[12px] transition-colors',
                        on ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-card/50 text-muted-foreground'
                      )}
                    >
                      <CheckCircle2 className={cn('h-4 w-4 shrink-0', on ? 'text-primary' : 'text-muted-foreground/50')} />
                      <span className="flex-1 leading-snug">{task.title}</span>
                      {task.start_time ? <span className="shrink-0 text-[10px] text-muted-foreground">{task.start_time}</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                Aucune activité planifiée aujourd’hui. Écris simplement ce que tu as fait.
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground">Un mot sur ta journée</p>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="Ce qui a bloqué, ce qui t’a plu, ce que tu veux changer."
              className="mt-1.5 w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-[12px] leading-relaxed outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {error && <p className="text-[11.5px] text-destructive">{error}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? 'Mimo analyse…' : review ? 'Mettre à jour mon bilan' : 'Envoyer à Mimo'}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-[12.5px] leading-relaxed text-foreground/90">{review.ai_message}</p>

          {review.ai_tips?.length > 0 && (
            <ul className="space-y-1.5">
              {review.ai_tips.map((tip) => (
                <li key={tip} className="flex gap-2 rounded-xl bg-muted/50 px-3 py-2 text-[11.5px] leading-relaxed">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}

          {review.focus && (
            <p className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-[11.5px] leading-relaxed">
              <span className="text-muted-foreground">Priorité de demain · </span>
              {review.focus}
            </p>
          )}

          {review.week_message && (
            <div className="rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Bilan de la semaine</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-foreground/90">{review.week_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}