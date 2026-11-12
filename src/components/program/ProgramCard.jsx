import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, Package, Repeat, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { DOMAIN_LABEL } from '@/lib/constants';
import { durationLabel } from '@/lib/activity';
import { cn } from '@/lib/utils';

function DetailLine({ icon: Icon, label, children }) {
  if (!children) return null;
  return (
    <div className="mt-2 rounded-xl bg-muted/50 px-3 py-2">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

export default function ProgramCard({ program }) {
  const items = program.items || [];
  const [open, setOpen] = useState(null);

  return (
    <section className="surface overflow-hidden">
      <header className="border-b border-border/60 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-primary">
            {DOMAIN_LABEL[program.domain] || program.domain}
          </span>
          <span className="text-[10px] text-muted-foreground">version {program.version || 1}</span>
          {program.review_weeks ? (
            <span className="text-[10px] text-muted-foreground">· réévaluation dans {program.review_weeks} sem.</span>
          ) : null}
        </div>
        <p className="mt-2.5 font-display text-base leading-snug">{program.objective}</p>
        {program.summary && (
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{program.summary}</p>
        )}
        {(program.start_level || program.target) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
            {program.start_level && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{program.start_level}</span>
            )}
            {program.start_level && program.target && <span className="text-muted-foreground">→</span>}
            {program.target && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                <Target className="h-3 w-3" /> {program.target}
              </span>
            )}
          </div>
        )}
      </header>

      {program.milestones?.length > 0 && (
        <div className="border-b border-border/60 px-5 py-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Paliers</p>
          <ol className="mt-1.5 space-y-1">
            {program.milestones.map((milestone, index) => (
              <li key={index} className="flex gap-2 text-[11.5px] leading-relaxed">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] text-primary">
                  {index + 1}
                </span>
                <span>
                  <span className="font-medium">{milestone.title}</span>
                  {milestone.criteria ? <span className="text-muted-foreground"> — {milestone.criteria}</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="divide-y divide-border/60">
        {items.map((item, index) => {
          const expanded = open === index;
          return (
            <div key={`${program.id}-${index}`}>
              <button
                onClick={() => setOpen(expanded ? null : index)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug">{item.title}</span>
                  <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
                    {durationLabel(item.minutes || 30)}
                    {item.steps?.length ? ` · ${item.steps.length} étapes` : ''}
                  </span>
                </span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
              </button>

              {expanded && (
                <div className="px-5 pb-4">
                  {item.objective && <p className="text-[12px] leading-relaxed text-muted-foreground">{item.objective}</p>}
                  {!item.steps?.length && item.detail && (
                    <p className="mt-1 text-[12px] leading-relaxed text-foreground/90">{item.detail}</p>
                  )}
                  <ol className="mt-2 space-y-2">
                    {(item.steps || []).map((step, stepIndex) => (
                      <li key={stepIndex} className="rounded-xl border border-border/60 px-3 py-2">
                        <p className="flex items-baseline gap-2 text-[12px] font-medium">
                          <span className="text-[10px] text-primary">{stepIndex + 1}.</span>
                          <span className="flex-1">{step.title}</span>
                          {step.minutes ? <span className="shrink-0 text-[10px] text-muted-foreground">{step.minutes} min</span> : null}
                        </p>
                        <p className="mt-1 pl-4 text-[11.5px] leading-relaxed text-muted-foreground">{step.detail}</p>
                      </li>
                    ))}
                  </ol>
                  <DetailLine icon={Sparkles} label="Consignes">{item.instructions}</DetailLine>
                  <DetailLine icon={Package} label="Matériel / produits">{item.materials}</DetailLine>
                  <DetailLine icon={AlertTriangle} label="Erreurs à éviter">{item.errors}</DetailLine>
                  <DetailLine icon={Repeat} label="Plus simple / plus exigeant">{item.adaptations}</DetailLine>
                  {item.caution && (
                    <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-primary/80">
                      <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" /> {item.caution}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {program.history?.length > 1 && (
        <div className="border-t border-border/60 px-5 py-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Historique</p>
          <ul className="mt-1.5 space-y-1">
            {program.history.slice(-4).map((entry, index) => (
              <li key={index} className="text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-foreground/80">v{entry.version}</span> — {entry.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/40 px-5 py-3">
        <p className="flex min-w-0 flex-1 items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="min-w-0">{program.safety || 'GlowUp ne remplace pas un avis médical.'}</span>
        </p>
        <Link to="/planning" className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] text-primary">
          Placer dans mon planning
        </Link>
      </footer>
    </section>
  );
}