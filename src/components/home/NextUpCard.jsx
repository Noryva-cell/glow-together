import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, Dumbbell, Play, Timer } from 'lucide-react';

export default function NextUpCard({ nextSport, nextTask, onStartTask, onOpenPlanning }) {
  const empty = !nextSport && !nextTask;

  return (
    <section className="surface p-5 rise">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Et ensuite</p>

      {empty ? (
        <p className="mt-2 text-sm text-muted-foreground">Rien de planifié pour les prochains jours.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {nextSport && (
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
                <Dumbbell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Prochaine séance</p>
                <p className="truncate text-sm">{nextSport.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {format(parseISO(nextSport.date), 'EEEE d MMMM', { locale: fr })}
                  {nextSport.start_time ? ` · ${nextSport.start_time}` : ''}
                </p>
              </div>
            </div>
          )}

          {nextTask && (
            <button
              onClick={() => onStartTask(nextTask)}
              className="flex w-full items-start gap-3 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Timer className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Prochaine tâche</p>
                <p className="truncate text-sm">{nextTask.title}</p>
                <p className="flex items-center gap-1 text-[11px] text-primary">
                  Lancer le minuteur <Play className="h-2.5 w-2.5" />
                </p>
              </div>
            </button>
          )}
        </div>
      )}

      <button onClick={onOpenPlanning} className="mt-4 flex items-center gap-1 text-[11px] text-primary hover:underline">
        Voir mon planning <ArrowRight className="h-3 w-3" />
      </button>
    </section>
  );
}