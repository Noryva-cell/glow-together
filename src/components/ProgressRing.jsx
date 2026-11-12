import { cn } from '@/lib/utils';

export default function ProgressRing({ value = 0, size = 80, stroke = 3, label, className }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const r = 18 - stroke / 2;
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke="hsl(var(--primary))" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${percent * 0.98} 100`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-base leading-none">{percent}%</span>
        {label && <span className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>}
      </span>
    </div>
  );
}