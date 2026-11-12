import { useMemo, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RAYONS } from '@/lib/meals';
import { cn } from '@/lib/utils';

const rank = (rayon) => {
  const index = RAYONS.indexOf(rayon);
  return index === -1 ? RAYONS.length : index;
};

export default function ShoppingList({ items, onToggle, onDelete, onAdd, onClearChecked }) {
  const [label, setLabel] = useState('');
  const [rayon, setRayon] = useState('Autre');

  const groups = useMemo(() => {
    const map = new Map();
    [...items]
      .sort((a, b) => rank(a.rayon || 'Autre') - rank(b.rayon || 'Autre'))
      .forEach((item) => {
        const key = item.rayon || 'Autre';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
      });
    return [...map.entries()];
  }, [items]);

  const checked = items.filter((item) => item.checked).length;

  const add = () => {
    if (!label.trim()) return;
    onAdd({ label: label.trim(), rayon });
    setLabel('');
  };

  return (
    <div className="space-y-3">
      <div className="surface p-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">{checked} / {items.length} articles cochés</p>
          {checked > 0 && (
            <button onClick={onClearChecked} className="text-[11px] text-primary hover:underline">
              Retirer les cochés
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') add(); }}
            placeholder="Ajouter un article…"
            className="flex-1"
          />
          <select
            value={rayon}
            onChange={(event) => setRayon(event.target.value)}
            className="w-24 shrink-0 rounded-md border border-border/70 bg-card px-2 text-[12px]"
          >
            {RAYONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <button
            onClick={add}
            aria-label="Ajouter à la liste"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!items.length && (
        <p className="surface px-4 py-8 text-center text-[12px] leading-relaxed text-muted-foreground">
          Ta liste est vide. Remplis ton menu de la semaine puis lance « Générer la liste de courses ».
        </p>
      )}

      {groups.map(([rayonName, list]) => (
        <div key={rayonName} className="surface px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{rayonName}</p>
          <ul className="mt-2 space-y-1">
            {list.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5 py-0.5">
                <button
                  onClick={() => onToggle(item)}
                  aria-label="Cocher l’article"
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                    item.checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  )}
                >
                  {item.checked && <Check className="h-2.5 w-2.5" />}
                </button>
                <span className={cn('flex-1 text-[13px]', item.checked && 'text-muted-foreground line-through')}>{item.label}</span>
                {item.quantity && <span className="shrink-0 text-[11px] text-muted-foreground">{item.quantity}</span>}
                <button onClick={() => onDelete(item)} aria-label="Supprimer" className="shrink-0 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}