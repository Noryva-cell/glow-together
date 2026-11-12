import { MessageCircle, Sparkles } from 'lucide-react';
import MimoAvatar from '@/components/mimo/MimoAvatar';

export default function MimoHero({ mood, message, onTalk, eyebrow = 'Mimo · ton compagnon' }) {

  return (
    <section className="surface relative overflow-hidden px-4 pb-5 pt-5 text-center rise sm:px-6">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-52 w-52 rounded-full bg-chart-3/20 blur-3xl" />

      <p className="relative text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>

      <div className="relative mx-auto mt-3 max-w-[19rem] rounded-[1.35rem] border border-white/80 bg-card/85 px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm backdrop-blur">
        {message}
        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/80 bg-card/85" />
      </div>

      <MimoAvatar
        mood={mood}
        onClick={onTalk}
        className="relative mx-auto mt-4 h-56 w-full max-w-[15rem] border border-white/70 shadow-lg sm:h-64 sm:max-w-[17rem] xl:h-80 xl:max-w-[19rem]"
      />

      <button
        onClick={onTalk}
        className="glow-cta relative mx-auto mt-5 flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-primary-foreground transition-transform duration-200 active:scale-[0.98]"
      >
        <MessageCircle className="h-4 w-4" />
        Parler à Mimo
        <Sparkles className="h-3.5 w-3.5 opacity-90" />
      </button>
    </section>
  );
}