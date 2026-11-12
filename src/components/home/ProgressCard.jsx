import ProgressRing from '@/components/ProgressRing';

export default function ProgressCard({ percent, doneCount, total, rows = [] }) {
  return (
    <section className="surface p-5 rise">
      <div className="flex items-center gap-4">
        <ProgressRing value={percent} size={64} stroke={3.4} />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ta progression</p>
          <p className="mt-1 font-display text-lg leading-tight">{doneCount} / {total || 0}</p>
          <p className="text-[11px] text-muted-foreground">tâches terminées aujourd’hui</p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {rows.map((row) => {
          const value = row.total ? Math.round((row.done / row.total) * 100) : 0;
          return (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="tabular-nums text-foreground/80">{row.done}/{row.total}</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-chart-5 transition-all duration-700"
                  style={{ width: `${Math.min(100, value)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}