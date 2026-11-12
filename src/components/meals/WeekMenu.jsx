import MealSlot from '@/components/meals/MealSlot';
import { dayLabel } from '@/lib/meals';

const SLOTS = [
  { value: 'petit_dejeuner', label: 'Matin' },
  { value: 'dejeuner', label: 'Midi' },
  { value: 'diner', label: 'Soir' },
];

export default function WeekMenu({ days, plans, recipes, onPick, onRemove, onToggle }) {
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return (
    <div className="space-y-2.5">
      {days.map((day) => (
        <div key={day} className="surface px-4 py-2.5">
          <p className="font-display text-[13px] capitalize">{dayLabel(day)}</p>
          <div className="mt-1 divide-y divide-border/40">
            {SLOTS.map((slot) => {
              const plan = plans.find((entry) => entry.date === day && entry.meal_type === slot.value);
              return (
                <MealSlot
                  key={slot.value}
                  label={slot.label}
                  plan={plan}
                  recipe={plan ? byId.get(plan.recipe_id) : null}
                  onPick={() => onPick(day, slot.value)}
                  onRemove={() => onRemove(plan)}
                  onToggle={() => onToggle(plan)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}