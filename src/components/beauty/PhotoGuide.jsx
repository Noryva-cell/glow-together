import { Sun } from 'lucide-react';
import { PHOTO_GUIDE } from '@/lib/photoShots';

export default function PhotoGuide({ kind }) {
  const guide = PHOTO_GUIDE[kind === 'hair' ? 'hair' : 'skin'];

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Comment prendre la photo</p>
      <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-foreground/90">
        <Sun className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <span><span className="font-medium">Quand : </span>{guide.when}</span>
      </p>
      <ul className="mt-1.5 space-y-1">
        {guide.tips.map((tip) => (
          <li key={tip} className="text-[11px] leading-relaxed text-muted-foreground">· {tip}</li>
        ))}
      </ul>
    </div>
  );
}