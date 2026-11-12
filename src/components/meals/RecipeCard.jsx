import { Clock, Pencil, Trash2, Users } from 'lucide-react';
import { mealLabel } from '@/lib/meals';

export default function RecipeCard({ recipe, onOpen, onEdit, onDelete }) {
  return (
    <div className="surface p-4">
      <button onClick={onOpen} className="w-full text-left">
        <p className="font-display text-sm leading-snug">{recipe.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span>{mealLabel(recipe.meal_type)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{recipe.prep_minutes || 0} min</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{recipe.servings || 1}</span>
          {recipe.estimated_cost ? <span>≈ {Number(recipe.estimated_cost).toFixed(2)} €</span> : null}
        </p>
        {recipe.tags?.length ? (
          <p className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{tag}</span>
            ))}
          </p>
        ) : null}
      </button>

      <div className="mt-3 flex justify-end gap-1 border-t border-border/50 pt-2">
        <button onClick={onEdit} aria-label="Modifier" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted/60">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} aria-label="Supprimer" className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}