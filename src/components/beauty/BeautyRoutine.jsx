import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import MimoAvatar from '@/components/mimo/MimoAvatar';
import { Button } from '@/components/ui/button';

export default function BeautyRoutine({ program, busy, onGenerate }) {
  if (!program) {
    return (
      <section className="surface flex flex-col items-center px-6 py-9 text-center">
        <MimoAvatar mood="explication" rounded="rounded-[1.4rem]" className="h-20 w-20" />
        <p className="mt-4 font-display text-base">Pas encore de routine soins</p>
        <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
          Renseigne ton profil puis laisse Mimo proposer quelques gestes simples, adaptés à ta peau et à tes cheveux.
        </p>
        <Button className="mt-4 rounded-full px-6" onClick={onGenerate} disabled={busy}>
          <Sparkles className="h-4 w-4" />
          {busy ? 'Mimo prépare…' : 'Préparer ma routine'}
        </Button>
      </section>
    );
  }

  return (
    <section className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ma routine soins</p>
          <p className="mt-1 font-display text-sm leading-snug">{program.objective}</p>
          {program.level && <p className="text-[11px] text-muted-foreground">Niveau : {program.level}</p>}
        </div>
        <Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={onGenerate} disabled={busy}>
          <RefreshCw className={busy ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
        </Button>
      </div>

      {program.summary && (
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{program.summary}</p>
      )}

      <ol className="mt-4 space-y-3">
        {(program.items || []).map((item, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] text-primary">
              {index + 1}
            </span>
            <div>
              <p className="text-[13px] font-medium leading-snug">{item.title}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{item.detail}</p>
              {item.caution && (
                <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-primary/90">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  {item.caution}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {program.safety && (
        <p className="mt-4 rounded-xl bg-muted/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">{program.safety}</p>
      )}
    </section>
  );
}