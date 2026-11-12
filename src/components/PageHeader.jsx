export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <header className="rise mb-6 flex items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>}
        <h1 className="mt-1.5 font-display text-[1.7rem] leading-tight tracking-tight lg:text-[2rem]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}