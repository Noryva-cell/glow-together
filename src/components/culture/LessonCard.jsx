import { BookOpen, Clock } from 'lucide-react';

export default function LessonCard({ lesson, onOpen }) {
  return (
    <button onClick={onOpen} className="surface w-full p-4 text-left transition-colors hover:border-primary/40">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{lesson.topic}</p>
      <p className="mt-1 font-display text-sm leading-snug">{lesson.title}</p>
      <p className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.minutes} min</span>
        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{lesson.level}</span>
      </p>
    </button>
  );
}