import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import PostItCard from './PostItCard';
import { cn } from '@/lib/utils';

export default function PostItLibrary({ templates, selectedId, onSelect, onNew, onEdit }) {
  const [query, setQuery] = useState('');
  const filtered = templates.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="surface flex h-full flex-col p-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm">Mes post-it</p>
        <button
          onClick={onNew}
          aria-label="Nouveau post-it"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
        Glisse un post-it sur un créneau, ou touche-le puis touche le créneau.
      </p>
      <div className="relative mt-2.5">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher"
          className="w-full rounded-full border border-border/60 bg-card/60 py-1.5 pl-8 pr-3 text-[11.5px] outline-none focus:border-primary/40"
        />
      </div>

      <Droppable droppableId="library">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="no-scrollbar mt-2.5 flex-1 space-y-1.5 overflow-y-auto">
            {filtered.map((template, index) => (
              <Draggable key={template.id} draggableId={`tpl-${template.id}`} index={index}>
                {(drag, state) => (
                  <div
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    {...drag.dragHandleProps}
                    onClick={() => onSelect(template)}
                    onDoubleClick={() => onEdit(template)}
                    className={cn(
                      'cursor-grab rounded-xl transition-shadow active:cursor-grabbing',
                      state.isDragging && 'rotate-1 shadow-lg',
                      selectedId === template.id && 'ring-2 ring-primary/60'
                    )}
                  >
                    <PostItCard title={template.name} category={template.category} minutes={template.duration_minutes} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {!filtered.length && (
              <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">Aucun post-it trouvé.</p>
            )}
          </div>
        )}
      </Droppable>

      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">
        Appui long sur un post-it pour le modifier.
      </p>
    </div>
  );
}