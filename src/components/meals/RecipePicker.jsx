import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { filterRecipes, mealLabel } from '@/lib/meals';

export default function RecipePicker({ open, onOpenChange, recipes, onSelect }) {
  const [search, setSearch] = useState('');
  const list = filterRecipes(recipes, { search }).slice(0, 40);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-base">Choisir une recette</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Plat ou ingrédient…"
            className="pl-8"
          />
        </div>

        <div className="space-y-1.5">
          {list.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onSelect(recipe)}
              className="w-full rounded-xl border border-border/60 px-3 py-2 text-left transition-colors hover:bg-muted/50"
            >
              <span className="block text-[13px]">{recipe.name}</span>
              <span className="block text-[10px] text-muted-foreground">
                {mealLabel(recipe.meal_type)} · {recipe.prep_minutes || 0} min
              </span>
            </button>
          ))}
          {!list.length && (
            <p className="py-6 text-center text-[12px] text-muted-foreground">
              Aucune recette ne correspond. Crée-la depuis l’onglet Recettes.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}