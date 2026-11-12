import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { GraduationCap, Plus } from 'lucide-react';
import LessonCard from '@/components/culture/LessonCard';
import LessonDialog from '@/components/culture/LessonDialog';
import LessonView from '@/components/culture/LessonView';
import EmptyState from '@/components/EmptyState';

export default function Culture() {
  const { profile } = useOutletContext();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [notice, setNotice] = useState('');

  const load = async () => {
    const page = await base44.entities.CultureLesson.list({ sort: '-created_date', limit: 100 });
    setLessons(page.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generate = async ({ topic, minutes, level }) => {
    setBusy(true);
    setNotice('');
    try {
      const response = await base44.functions.invoke('buildLesson', { topic, minutes, level });
      const lesson = response.data?.lesson;
      if (!lesson) {
        setNotice('La leçon n’a pas pu être créée. Réessaie dans un instant.');
        return;
      }
      setOpen(false);
      await load();
      setViewing(lesson);
    } catch (e) {
      setNotice('La leçon n’a pas pu être créée. Réessaie dans un instant.');
    } finally {
      setBusy(false);
    }
  };

  const plan = async (lesson) => {
    await base44.entities.Task.create({
      title: `Leçon : ${lesson.title}`,
      description: (lesson.takeaways || []).slice(0, 3).join(' · ') || lesson.topic,
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      duration_minutes: lesson.minutes || 20,
      category: 'culture',
      priority: 'moyenne',
      status: 'a_faire',
    });
    setViewing(null);
    setNotice('Leçon ajoutée au planning de demain.');
  };

  const remove = async (lesson) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    await base44.entities.CultureLesson.delete(lesson.id);
    setViewing(null);
    await load();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-xl leading-tight">Culture</h1>
          <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-muted-foreground">
            Une leçon à la fois : tu choisis le sujet, Mimo rédige, tu planifies.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Nouvelle leçon"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      {notice && (
        <p className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
          {notice}
        </p>
      )}

      {lessons.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} onOpen={() => setViewing(lesson)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="Ta première leçon t’attend"
          description="Choisis un sujet qui t’intéresse : histoire, sciences, langues, économie, arts… et laisse Mimo écrire une leçon de 15 minutes."
          action={
            <button onClick={() => setOpen(true)} className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
              Créer une leçon
            </button>
          }
        />
      )}

      <LessonDialog
        open={open}
        onOpenChange={setOpen}
        topics={profile?.culture_topics || []}
        busy={busy}
        onGenerate={generate}
      />

      <LessonView
        lesson={viewing}
        onOpenChange={(value) => { if (!value) setViewing(null); }}
        onPlan={plan}
        onDelete={remove}
      />
    </div>
  );
}