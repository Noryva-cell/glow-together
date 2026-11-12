import { Button } from '@/components/ui/button';
import { DOMAIN_LABEL } from '@/lib/constants';

export default function ProgramProposal({ program, onAccept, onRefuse, busy }) {
  return (
    <section className="surface border-primary/40 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground">
          Proposition · {DOMAIN_LABEL[program.domain] || program.domain}
        </span>
        <span className="text-[10px] text-muted-foreground">version {program.version}</span>
      </div>

      <p className="mt-2.5 font-display text-base leading-snug">
        Mimo propose d’ajuster ton programme
      </p>
      {program.rationale && (
        <p className="mt-1.5 rounded-2xl bg-muted/60 px-3.5 py-2.5 text-[12px] leading-relaxed text-foreground/90">
          {program.rationale}
        </p>
      )}

      <ul className="mt-3 space-y-1">
        {(program.items || []).map((item, index) => (
          <li key={index} className="text-[11.5px] leading-relaxed text-muted-foreground">
            · <span className="text-foreground/90">{item.title}</span> — {item.minutes || 30} min
          </li>
        ))}
      </ul>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Rien ne change tant que tu n’as pas accepté. Ta version actuelle reste active.
      </p>

      <div className="mt-3 flex gap-2">
        <Button variant="outline" className="flex-1 rounded-full" onClick={() => onRefuse(program)} disabled={busy}>
          Refuser
        </Button>
        <Button className="flex-1 rounded-full" onClick={() => onAccept(program)} disabled={busy}>
          {busy ? 'Application…' : 'Accepter'}
        </Button>
      </div>
    </section>
  );
}