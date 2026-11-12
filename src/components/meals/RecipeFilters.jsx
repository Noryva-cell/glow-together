import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MEAL_TYPES } from '@/lib/meals';
import { cn } from '@/lib/utils';

const TIME_FILTERS = [
  { value: 0, label: 'Tout temps' },
  { value: 15, label: '≤ 15 min' },
  { value: 30, label: '≤ 30 min' },
];

const chip = (active) =>
  cn(
    'shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] transition-colors',
    active ? 'border-transparent bg-primary text-primary-foreground' : 'border-border/70 text-muted-foreground'
  );

export default function RecipeFilters({
  search, onSearch, mealType, onMealType, maxMinutes, onMaxMinutes, count,
}) {
  const moments = [{ value: '', label: 'Tous' }, ...MEAL_TYPES];

  return (
    <div className="surface space-y-2.5 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Chercher un plat ou un ingrédient…"
          className="pl-8 text-[12px]"
        />
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {moments.map((moment) => (
          <button
            key={moment.value || 'tous'}
            onClick={() => onMealType(moment.value)}
            className={chip(mealType === moment.value)}
          >
            {moment.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {TIME_FILTERS.map((option) => (
            <button
              key={option.value}
              onClick={() => onMaxMinutes(option.value)}
              className={chip(maxMinutes === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {count} recette{count > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}