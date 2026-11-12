import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';
import { CalendarClock, ChevronLeft, ChevronRight, Layers, Pencil, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import PageHeader from '@/components/PageHeader';
import TaskDialog from '@/components/TaskDialog';
import BlockDialog from '@/components/BlockDialog';
import ActivitySheet from '@/components/activity/ActivitySheet';
import WeekGrid from '@/components/planning/WeekGrid';
import PostItLibrary from '@/components/planning/PostItLibrary';
import PostItDialog from '@/components/planning/PostItDialog';
import DayView from '@/components/planning/DayView';
import MonthView from '@/components/planning/MonthView';
import ListView from '@/components/planning/ListView';
import { createOccurrence, ensureDefaultTemplates } from '@/lib/activity';
import { sortTasks } from '@/lib/planner';
import { setTaskStatus } from '@/lib/tasks';
import { cn } from '@/lib/utils';

const VIEWS = [
  { value: 'semaine', label: 'Semaine' },
  { value: 'jour', label: 'Jour' },
  { value: 'mois', label: 'Mois' },
  { value: 'liste', label: 'Liste' },
];

export default function Planning() {
  const { profile } = useOutletContext();
  const [view, setView] = useState('semaine');
  const [cursor, setCursor] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selection, setSelection] = useState(null);
  const [activity, setActivity] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [postItOpen, setPostItOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [defaultDate, setDefaultDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [defaultTime, setDefaultTime] = useState('');
  const [blockOpen, setBlockOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);

  const range = useMemo(() => {
    if (view === 'semaine') return [startOfWeek(cursor, { weekStartsOn: 1 }), endOfWeek(cursor, { weekStartsOn: 1 })];
    if (view === 'jour') return [cursor, cursor];
    if (view === 'mois') {
      return [startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }), endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })];
    }
    return [new Date(), addDays(new Date(), 60)];
  }, [view, cursor]);

  const rangeKey = `${format(range[0], 'yyyy-MM-dd')}-${format(range[1], 'yyyy-MM-dd')}`;

  const load = async () => {
    const [taskList, blockList, templatePage, goalList] = await Promise.all([
      base44.entities.Task.filter({ date: { $gte: format(range[0], 'yyyy-MM-dd'), $lte: format(range[1], 'yyyy-MM-dd') } }),
      base44.entities.TimeBlock.filter({}),
      base44.entities.ActivityTemplate.filter({ active: true }, { sort: 'created_date', limit: 200 }),
      base44.entities.Goal.filter({ status: 'en_cours' }),
    ]);
    setTasks(taskList);
    setBlocks(blockList);
    setTemplates(templatePage.items || []);
    setGoals(goalList);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await ensureDefaultTemplates();
      await load();
    })();
  }, []);

  useEffect(() => { load(); }, [rangeKey]);

  const placeTemplate = async (templateId, date, startTime) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setSelection(null);
    await createOccurrence(template, date, startTime);
    await load();
  };

  const moveTask = async (taskId, date, startTime) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, date, start_time: startTime } : t)));
    await base44.entities.Task.update(taskId, { date, start_time: startTime });
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || !destination.droppableId.startsWith('slot|')) return;
    const [, dateKey, hour] = destination.droppableId.split('|');
    if (!dateKey) return;
    const time = `${String(Number(hour)).padStart(2, '0')}:00`;

    if (draggableId.startsWith('tpl-')) { placeTemplate(draggableId.slice(4), dateKey, time); return; }
    if (source.droppableId === destination.droppableId) return;
    moveTask(draggableId.slice(5), dateKey, time);
  };

  const openNew = (dateKey, hour) => {
    setEditing(null);
    setDefaultDate(dateKey || format(cursor, 'yyyy-MM-dd'));
    setDefaultTime(Number.isFinite(hour) ? `${String(hour).padStart(2, '0')}:00` : '');
    setDialogOpen(true);
  };

  const saveTemplate = async (payload) => {
    if (editingTemplate?.id) {
      await base44.entities.ActivityTemplate.update(editingTemplate.id, payload);
    } else {
      await base44.entities.ActivityTemplate.create({ ...payload, origin: 'manuel', active: true });
    }
    await load();
  };

  const deleteTemplate = async (template) => {
    if (!window.confirm(`Supprimer « ${template.name} » de ta bibliothèque ?`)) return;
    await base44.entities.ActivityTemplate.delete(template.id);
    setPostItOpen(false);
    setSelection(null);
    await load();
  };

  const saveBlock = async (payload) => {
    if (editingBlock?.id) await base44.entities.TimeBlock.update(editingBlock.id, payload);
    else await base44.entities.TimeBlock.create(payload);
    setEditingBlock(null);
    await load();
  };

  const deleteBlock = async (block) => {
    await base44.entities.TimeBlock.delete(block.id);
    setEditingBlock(null);
    await load();
  };

  const toggle = async (task) => { await setTaskStatus(task, task.status !== 'terminee'); load(); };
  const postpone = async (task) => {
    await base44.entities.Task.update(task.id, { date: format(addDays(new Date(`${task.date}T00:00:00`), 1), 'yyyy-MM-dd') });
    load();
  };

  const shift = (dir) => {
    if (view === 'jour') setCursor((c) => addDays(c, dir));
    else if (view === 'semaine') setCursor((c) => addWeeks(c, dir));
    else if (view === 'mois') setCursor((c) => addMonths(c, dir));
  };

  const label = view === 'semaine'
    ? `${format(range[0], 'd MMM', { locale: fr })} – ${format(range[1], 'd MMM', { locale: fr })}`
    : view === 'jour'
      ? format(cursor, 'EEEE d MMMM', { locale: fr })
      : view === 'mois'
        ? format(cursor, 'MMMM yyyy', { locale: fr })
        : 'À venir';

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <PageHeader
          eyebrow="Organisation"
          title="Mon planning"
          subtitle="Une semaine vide à remplir avec tes post-it : rien n’est imposé."
          action={
            <button
              onClick={() => openNew()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95"
              aria-label="Nouvelle activité"
            >
              <Plus className="h-4 w-4" />
            </button>
          }
        />

        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex gap-1 rounded-full bg-muted/70 p-1">
              {VIEWS.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setView(v.value)}
                  className={cn(
                    'flex-1 rounded-full py-2 text-xs transition-all',
                    view === v.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="mb-3 flex items-center justify-between">
              <button onClick={() => shift(-1)} disabled={view === 'liste'} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCursor(new Date())} className="text-sm font-medium capitalize">{label}</button>
              <button onClick={() => shift(1)} disabled={view === 'liste'} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {selection && (
              <div className="mb-3 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-3 py-2 text-[11.5px]">
                <span className="flex-1 text-foreground/80">
                  « {selection.name} » sélectionné — touche un créneau pour le placer.
                </span>
                <button onClick={() => { setEditingTemplate(selection); setPostItOpen(true); }} aria-label="Modifier" className="text-primary">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setSelection(null)} aria-label="Annuler" className="text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>
            ) : (
              <>
                {view === 'semaine' && (
                  <WeekGrid
                    weekStart={range[0]}
                    tasks={tasks}
                    blocks={blocks}
                    selection={selection}
                    onPlace={placeTemplate}
                    onOpenTask={setActivity}
                    onNewTask={openNew}
                  />
                )}
                {view === 'jour' && (
                  <DayView
                    date={cursor}
                    tasks={sortTasks(tasks)}
                    blocks={blocks}
                    profile={profile}
                    onToggle={toggle}
                    onEdit={setActivity}
                    onPostpone={postpone}
                    onNew={() => openNew(format(cursor, 'yyyy-MM-dd'))}
                  />
                )}
                {view === 'mois' && (
                  <MonthView
                    month={cursor}
                    tasks={tasks}
                    onSelectDay={(d) => { setCursor(d); setView('semaine'); }}
                  />
                )}
                {view === 'liste' && (
                  <ListView tasks={sortTasks(tasks)} onToggle={toggle} onEdit={setActivity} onPostpone={postpone} />
                )}
              </>
            )}

            <div className="mt-3 flex gap-2 lg:hidden">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setSheetOpen(true)}>
                <Layers className="h-4 w-4" /> Bibliothèque de post-it
              </Button>
              <Button variant="ghost" className="rounded-full" onClick={() => { setEditingBlock(null); setBlockOpen(true); }} aria-label="Engagement fixe">
                <CalendarClock className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <aside className="hidden w-[250px] shrink-0 lg:block">
            <div className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col gap-2">
              <PostItLibrary
                templates={templates}
                selectedId={selection?.id}
                onSelect={(template) => setSelection(selection?.id === template.id ? null : template)}
                onNew={() => { setEditingTemplate(null); setPostItOpen(true); }}
                onEdit={(template) => { setEditingTemplate(template); setPostItOpen(true); }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-[11px]"
                onClick={() => { setEditingBlock(null); setBlockOpen(true); }}
              >
                <CalendarClock className="h-3.5 w-3.5" /> Ajouter un engagement fixe
              </Button>
            </div>
          </aside>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="h-[78vh] rounded-t-3xl p-3">
            <PostItLibrary
              templates={templates}
              selectedId={selection?.id}
              onSelect={(template) => { setSelection(template); setSheetOpen(false); }}
              onNew={() => { setEditingTemplate(null); setPostItOpen(true); }}
              onEdit={(template) => { setEditingTemplate(template); setPostItOpen(true); }}
            />
          </SheetContent>
        </Sheet>

        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editing}
          defaultDate={defaultDate}
          defaultTime={defaultTime}
          goals={goals}
          onSaved={load}
        />

        <PostItDialog
          open={postItOpen}
          onOpenChange={setPostItOpen}
          template={editingTemplate}
          onSave={saveTemplate}
          onDelete={deleteTemplate}
        />

        <BlockDialog
          open={blockOpen}
          onOpenChange={setBlockOpen}
          block={editingBlock}
          onSave={saveBlock}
          onDelete={deleteBlock}
        />

        <ActivitySheet
          task={activity}
          open={!!activity}
          onOpenChange={(value) => { if (!value) setActivity(null); }}
          onChanged={async () => {
            await load();
            if (activity) {
              const fresh = (await base44.entities.Task.filter({ id: activity.id }))[0];
              if (fresh) setActivity(fresh);
            }
          }}
        />
      </div>
    </DragDropContext>
  );
}