import ReactMarkdown from 'react-markdown';
import { CalendarPlus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const components = {
  h1: (props) => <h2 className="mt-1 font-display text-base leading-snug" {...props} />,
  h2: (props) => <h3 className="mt-4 font-display text-[14px] leading-snug" {...props} />,
  h3: (props) => <h4 className="mt-3 text-[13px] font-medium" {...props} />,
  p: (props) => <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground" {...props} />,
  ul: (props) => <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-muted-foreground" {...props} />,
  ol: (props) => <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-muted-foreground" {...props} />,
  strong: (props) => <strong className="font-medium text-foreground" {...props} />,
};

export default function LessonView({ lesson, onOpenChange, onPlan, onDelete }) {
  return (
    <Dialog open={Boolean(lesson)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-base leading-snug">{lesson?.title}</DialogTitle>
        </DialogHeader>

        <p className="text-[11px] text-muted-foreground">
          {lesson?.topic} · {lesson?.minutes} min · {lesson?.level}
        </p>

        <div className="mt-2">
          <ReactMarkdown components={components}>{lesson?.content || ''}</ReactMarkdown>
        </div>

        {lesson?.takeaways?.length > 0 && (
          <div className="rounded-xl bg-primary/5 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">À retenir</p>
            <ul className="mt-1.5 space-y-1">
              {lesson.takeaways.map((item, index) => (
                <li key={index} className="text-[12px] leading-relaxed text-foreground">• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {lesson?.sources?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Pour aller plus loin</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{lesson.sources.join(' · ')}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button className="flex-1 rounded-full" onClick={() => onPlan(lesson)}>
            <CalendarPlus className="h-4 w-4" />
            Planifier demain
          </Button>
          <Button variant="outline" size="icon" className="shrink-0 rounded-full" onClick={() => onDelete(lesson)} aria-label="Supprimer la leçon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}