import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mealLabel } from '@/lib/meals';

export default function RecipeView({ recipe, onOpenChange }) {
  return (
    <Dialog open={Boolean(recipe)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-base">{recipe?.name}</DialogTitle>
        </DialogHeader>

        <p className="text-[11px] text-muted-foreground">
          {mealLabel(recipe?.meal_type)} · {recipe?.prep_minutes || 0} min · {recipe?.servings || 1} portion(s)
          {recipe?.estimated_cost ? ` · ≈ ${Number(recipe.estimated_cost).toFixed(2)} €` : ''}
        </p>

        <div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Ingrédients</p>
          <ul className="mt-2 space-y-1.5">
            {(recipe?.ingredients || []).map((ing, index) => (
              <li key={`${ing.label}-${index}`} className="flex justify-between gap-3 text-[13px]">
                <span>{ing.label}</span>
                <span className="shrink-0 text-muted-foreground">{ing.quantity}</span>
              </li>
            ))}
            {!recipe?.ingredients?.length && <li className="text-[12px] text-muted-foreground">Aucun ingrédient renseigné.</li>}
          </ul>
        </div>

        <div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Préparation</p>
          <ol className="mt-2 space-y-2">
            {(recipe?.steps || []).map((step, index) => (
              <li key={index} className="flex gap-2.5 text-[13px] leading-relaxed">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
            {!recipe?.steps?.length && <li className="text-[12px] text-muted-foreground">Aucune étape renseignée.</li>}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}