import { useState } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { previewAction, saveAction } from '@/lib/assistantActions';

export default function ActionCard({ action, status, onSaved, onIgnore }) {
  const preview = previewAction(action);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (status === 'saved') {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[#7C9A81]/30 bg-[#7C9A81]/10 px-4 py-2.5 text-xs text-[#5C7A61]">
        <Check className="h-3.5 w-3.5" /> {preview.kind} enregistré{preview.kind === 'Routine' ? 'e' : ''} · {preview.heading}
      </div>
    );
  }

  if (status === 'ignored') {
    return <div className="rounded-2xl border border-border/60 px-4 py-2.5 text-xs text-muted-foreground">Proposition ignorée · {preview.heading}</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await saveAction(action);
      onSaved();
    } catch (e) {
      setError(e?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-primary">
        <Sparkles className="h-3 w-3" /> {preview.kind} proposé{preview.kind === 'Routine' ? 'e' : ''}
      </p>
      <p className="mt-1.5 text-sm font-medium">{preview.heading}</p>

      {preview.lines.length > 0 && (
        <ul className="mt-2 space-y-1">
          {preview.lines.map((line, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
              <span className="min-w-0">{line}</span>
            </li>
          ))}
        </ul>
      )}

      {preview.meta && <p className="mt-2 text-[11px] text-muted-foreground/80">{preview.meta}</p>}
      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground transition-opacity disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Enregistrer
        </button>
        <button
          onClick={onIgnore}
          disabled={saving}
          className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          Pas maintenant
        </button>
      </div>
    </div>
  );
}