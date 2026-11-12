import { Droppable, Draggable } from '@hello-pangea/dnd';
import { addDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isDone } from '@/lib/tasks';
import { cn } from '@/lib/utils';
import PostItCard from './PostItCard';

const HOURS = [...Array(18)].map((_, i) => i + 6);
const pad = (n) => String(n).padStart(2, '0');
const hourOf = (time) => {
  const h = parseInt(String(time || '').slice(0, 2), 10);
  return Number.isFinite(h) ? h : -1;
};

export default function WeekGrid({ weekStart, tasks, blocks = [], selection, onPlace, onOpenTask, onNewTask }) {
  const days = [...Array(7)].map((_, i) => addDays(weekStart, i));
  const untimed = tasks.filter((t) => !t.start_time);

  return (
    <>
      {untimed.length > 0 && (
        <div className="mb-3 rounded-2xl border border-border/60 bg-card/50 p-2">
          <p className="px-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Sans heure</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {untimed.map((task) => (
              <button key={task.id} onClick={() => onOpenTask(task)} className="w-[130px]">
                <PostItCard title={task.title} category={task.category} minutes={task.duration_minutes} done={isDone(task)} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="no-scrollbar overflow-x-auto pb-2">
        <div className="min-w-[780px]">
          <div className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] gap-1">
            <div />
            {days.map((day) => {
              const today = isSameDay(day, new Date());
              return (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  className={cn('rounded-lg px-1 py-1 text-center', today && 'bg-primary/10')}
                >
                  <p className={cn('text-[9.5px] uppercase tracking-[0.08em]', today ? 'text-primary' : 'text-muted-foreground')}>
                    {format(day, 'EEE', { locale: fr })}
                  </p>
                  <p className={cn('text-[12px] font-medium', today ? 'text-primary' : 'text-foreground')}>
                    {format(day, 'd')}
                  </p>
                </div>
              );
            })}
          </div>

          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[40px_repeat(7,minmax(0,1fr))] gap-1">
              <div className="pr-1 pt-1 text-right text-[9.5px] tabular-nums text-muted-foreground">{pad(hour)}:00</div>
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const jsDay = day.getDay();
                const cellTasks = tasks.filter((t) => t.date === dateKey && hourOf(t.start_time) === hour);
                const cellBlocks = blocks.filter(
                  (b) => Number(b.day_of_week) === jsDay && hourOf(b.start_time) <= hour && hourOf(b.end_time) > hour
                );
                return (
                  <Droppable key={`${dateKey}-${hour}`} droppableId={`slot|${dateKey}|${hour}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        onClick={() => {
                          if (selection) onPlace(selection.id, dateKey, `${pad(hour)}:00`);
                          else onNewTask(dateKey, hour);
                        }}
                        className={cn(
                          'min-h-[54px] rounded-lg border border-border/50 bg-card/40 p-0.5 transition-colors',
                          snapshot.isDraggingOver && 'border-primary/50 bg-primary/10',
                          cellBlocks.length > 0 && 'bg-muted/60'
                        )}
                      >
                        {cellBlocks.map((block) => (
                          <p key={block.id} className="mb-0.5 truncate rounded-md bg-muted px-1 py-0.5 text-[8.5px] text-muted-foreground">
                            {block.label}
                          </p>
                        ))}
                        {cellTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                            {(drag, state) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenTask(task);
                                }}
                                className={cn('mb-0.5 cursor-grab active:cursor-grabbing', state.isDragging && 'rotate-1 shadow-lg')}
                              >
                                <PostItCard
                                  title={task.title}
                                  category={task.category}
                                  minutes={task.duration_minutes}
                                  done={isDone(task)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}