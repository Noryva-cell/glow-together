import MimoAvatar from '@/components/mimo/MimoAvatar';

export default function MimoPrompt({ step, message, mood = 'accueil' }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <MimoAvatar mood={mood} rounded="rounded-2xl" className="h-11 w-11 shrink-0" breathing={false} />
      <div className="relative min-w-0 rounded-[1.2rem] rounded-tl-sm border border-primary/15 bg-card/80 px-3.5 py-2.5 backdrop-blur">
        <p className="text-[10px] uppercase tracking-[0.16em] text-primary/70">Mimo · question {step}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">{message}</p>
      </div>
    </div>
  );
}