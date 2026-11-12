import { CATEGORY_MAP } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function CategoryChip({ category, className }) {
  const cat = CATEGORY_MAP[category] || { label: category || 'Général', chip: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium', cat.chip, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cat.dot)} />
      {cat.label}
    </span>
  );
}