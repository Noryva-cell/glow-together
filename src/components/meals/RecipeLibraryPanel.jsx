import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Loader2 } from 'lucide-react';
import { MEAL_TYPES } from '@/lib/meals';

const GOAL = 100;
const BATCH = 20;
const ROUNDS = 6;

export default function RecipeLibraryPanel({ recipes, onReload }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const counts = MEAL_TYPES.map(({ value, label }) => ({
    value,
    label,
    count: recipes.filter((recipe) => recipe.meal_type === value).length,
  }));
  const total = counts.reduce((sum, entry) => sum + entry.count, 0);
  const complete = counts.every((entry) => entry.count >= GOAL);

  const generate = async () => {
    setBusy(true);
    const current = Object.fromEntries(counts.map((entry) => [entry.value, entry.count]));
    try {
      for (let round = 0; round < ROUNDS; round += 1) {
        const todo = MEAL_TYPES.filter((meal) => current[meal.value] < GOAL);
        if (!todo.length) break;
        setProgress(`Génération en cours… ${Object.values(current).reduce((a, b) => a + b, 0)} / ${GOAL * MEAL_TYPES.length} recettes`);
        const results = await Promise.all(
          todo.map(async (meal) => {
            try {
              const response = await base44.functions.invoke('seedRecipeLibrary', {
                meal_type: meal.value,
                count: Math.min(BATCH, GOAL - current[meal.value]),
              });
              const nextTotal = Number(response.data?.total);
              return { value: meal.value, total: Number.isFinite(nextTotal) ? nextTotal : current[meal.value] };
            } catch (e) {
              return { value: meal.value, total: current[meal.value] };
            }
          })
        );
        results.forEach((result) => {
          current[result.value] = result.total;
        });
        setProgress(`${Object.values(current).reduce((a, b) => a + b, 0)} recettes prêtes…`);
        await onReload();
      }
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  return (
    <div className="surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <BookOpen className="h-3 w-3" /> Bibliothèque
          </p>
          <p className="mt-1 font-display text-[14px] leading-snug">{total} recettes · objectif 100 par catégorie</p>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {counts.map((entry) => (
          <div key={entry.value} className="rounded-xl border border-border/60 px-2.5 py-1.5">
            <p className="text-[10px] text-muted-foreground">{entry.label}</p>
            <p className="text-[12px] font-medium">
              {entry.count} <span className="text-[10px] text-muted-foreground">/ {GOAL}</span>
            </p>
          </div>
        ))}
      </div>

      {!complete && (
        <button
          onClick={generate}
          disabled={busy}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5 text-[12px] font-medium text-primary disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookOpen className="h-3.5 w-3.5" />}
          {busy ? 'Mimo cuisine…' : 'Compléter ma bibliothèque'}
        </button>
      )}
      {progress && <p className="mt-1.5 text-center text-[10px] text-muted-foreground">{progress}</p>}
      {busy && (
        <p className="mt-1 text-center text-[10px] leading-relaxed text-muted-foreground">
          Ça prend quelques minutes : tu peux rester sur cet onglet.
        </p>
      )}
    </div>
  );
}