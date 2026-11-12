import { Sparkles } from 'lucide-react';

const OPTIONS = [5, 10, 25];

export default function FocusCard({ onStart }) {
  return (
    <section className="surface p-5 rise">
      <p className="flex items-center gap-1.5 font-display text-sm">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> Mode anti-procrastination
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">On se concentre ensemble ?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((minutes) => (
          <button
            key={minutes}
            onClick={() => onStart(minutes)}
            className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {minutes} min
          </button>
        ))}
      </div>
    </section>
  );
}