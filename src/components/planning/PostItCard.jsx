import { cn } from '@/lib/utils';
import { CATEGORY_MAP } from '@/lib/constants';
import { durationLabel } from '@/lib/activity';

export default function PostItCard({ title, category, minutes, done, className }) {
  const cat = CATEGORY_MAP[category] || {};
  return (
    <div
      className={cn(
        'rounded-xl px-2 py-1.5 text-left shadow-sm',
        cat.chip || 'bg-muted text-foreground',
        done && 'opacity-60',
        className
      )}
    >
      <p className="flex items-start gap-1 text-[10.5px] font-medium leading-tight">
        <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', cat.dot || 'bg-muted-foreground')} />
        <span className="line-clamp-2">{title}</span>
      </p>
      <p className="mt-0.5 pl-2.5 text-[9.5px] leading-tight opacity-80">{durationLabel(minutes)}</p>
    </div>
  );
}