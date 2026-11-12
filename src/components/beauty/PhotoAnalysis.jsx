import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2, Sparkles, TriangleAlert, Zap } from 'lucide-react';
import PhotoGuide from '@/components/beauty/PhotoGuide';
import CameraCapture from '@/components/beauty/CameraCapture';
import { shotsFor } from '@/lib/photoShots';
import { cn } from '@/lib/utils';

const KINDS = [
  { value: 'skin', label: 'Ma peau' },
  { value: 'hair', label: 'Mes cheveux' },
];

const ROUTINE_LABEL = {
  skin: 'Soin du visage',
  hair: 'Soin des cheveux',
};

export default function PhotoAnalysis({ latest, onSaved }) {
  const fallbackRef = useRef(null);
  const pendingShot = useRef(null);
  const [kind, setKind] = useState('skin');
  const [shots, setShots] = useState({});
  const [activeShot, setActiveShot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const shotList = shotsFor(kind);
  const complete = shotList.every((shot) => shots[shot.key]);

  const reset = () => {
    setAnalysis(null);
    setNotice('');
    setError('');
  };

  const takeShot = (shot, file) => {
    setShots((previous) => ({ ...previous, [shot.key]: { file, preview: URL.createObjectURL(file) } }));
    setActiveShot(null);
    reset();
  };

  const openFallback = () => {
    pendingShot.current = activeShot;
    setActiveShot(null);
    fallbackRef.current?.click();
  };

  const onFallbackFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file && pendingShot.current) takeShot(pendingShot.current, file);
    pendingShot.current = null;
  };

  const analyze = async () => {
    if (!complete) {
      setError('Il manque une photo : prends les prises demandées pour une analyse fiable.');
      return;
    }
    reset();
    setBusy(true);
    try {
      const photos = await Promise.all(
        shotList.map(async (shot) => {
          const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: shots[shot.key].file });
          return { label: shot.label, file_uri };
        })
      );
      const response = await base44.functions.invoke('analyzePhoto', { kind, photos });
      const data = response.data || {};
      if (data.analysis) {
        setAnalysis(data.analysis);
        if (!data.analysis.readable) {
          setNotice(data.analysis.summary || 'Les photos ne sont pas exploitables. Réessaie à la lumière du jour, sans maquillage.');
        }
      } else {
        setError('L’analyse n’a pas abouti. Essaie à nouveau avec une lumière plus franche.');
      }
    } catch (e) {
      setError('L’analyse n’a pas abouti. Essaie à nouveau avec une lumière plus franche.');
    } finally {
      setBusy(false);
    }
  };

  const toRoutines = (result) => {
    const base = ROUTINE_LABEL[kind];
    const toSteps = (steps = []) => steps.map((step) => `${step.title} : ${step.detail}`);
    const list = [];
    if (result.morning_steps?.length) {
      list.push({ name: `${base} — matin`, moment: 'matin', steps: toSteps(result.morning_steps) });
    }
    if (result.evening_steps?.length) {
      list.push({ name: `${base} — soir`, moment: 'soir', steps: toSteps(result.evening_steps) });
    }
    if (result.weekly_steps?.length) {
      list.push({ name: `${base} — 1 fois par semaine`, moment: 'soir', steps: toSteps(result.weekly_steps) });
    }
    return list;
  };

  const save = async () => {
    if (!analysis) return;
    setSaving(true);
    setError('');
    try {
      const routines = toRoutines(analysis);
      for (const routine of routines) {
        const existing = await base44.entities.Routine.filter({ name: routine.name }, { limit: 1 });
        const found = (existing.items || [])[0];
        const payload = { ...routine, category: 'beaute', active: true, days: [] };
        if (found) await base44.entities.Routine.update(found.id, payload);
        else await base44.entities.Routine.create(payload);
      }
      await base44.entities.BeautyAnalysis.create({
        kind,
        summary: analysis.summary,
        observations: analysis.observations || [],
        concerns: analysis.concerns || [],
        products: analysis.products || [],
        caution: analysis.caution || '',
        routines_created: routines.map((routine) => routine.name),
      });
      setNotice('Routines enregistrées : tu les retrouves dans l’onglet Routines, prêtes à cocher.');
      setAnalysis(null);
      setShots({});
      onSaved?.();
    } catch (e) {
      setError('Les routines n’ont pas pu être enregistrées. Réessaie dans un instant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface px-4 py-4">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        <Camera className="h-3 w-3" /> Analyse par photo
      </p>
      <p className="mt-1 font-display text-[15px] leading-snug">Quelques photos bien prises, et Mimo adapte ta routine</p>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
        Les photos servent uniquement à l’analyse et restent privées (stockage privé, jamais publiques).
      </p>

      <div className="mt-3 flex gap-1 rounded-full bg-muted/70 p-1">
        {KINDS.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setKind(option.value);
              setShots({});
              reset();
            }}
            className={cn(
              'flex-1 rounded-full py-2 text-[11.5px] transition-all',
              kind === option.value ? 'bg-card shadow-sm' : 'text-muted-foreground'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <PhotoGuide kind={kind} />
      </div>

      <div className="mt-2.5 space-y-2">
        {shotList.map((shot) => {
          const taken = shots[shot.key];
          return (
            <div key={shot.key} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-2.5 py-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/60 text-muted-foreground">
                {taken ? (
                  <img src={taken.preview} alt={shot.label} className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-medium leading-tight">{shot.label}</p>
                <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">{shot.hint}</p>
              </div>
              <button
                onClick={() => setActiveShot(shot)}
                disabled={busy}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-[10.5px] font-medium disabled:opacity-50',
                  taken ? 'border border-border text-muted-foreground' : 'bg-primary/10 text-primary'
                )}
              >
                {taken ? 'Reprendre' : 'Photo'}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={analyze}
        disabled={busy || !complete}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {busy ? 'Mimo observe…' : `Analyser mes ${shotList.length} photos`}
      </button>
      <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        <Zap className="h-3 w-3" /> Flash automatique au moment de la prise
      </p>

      {notice && (
        <p className="mt-3 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {notice}
        </p>
      )}
      {error && <p className="mt-3 text-[11.5px] text-destructive">{error}</p>}

      {latest && !analysis && !busy && (
        <div className="mt-3 rounded-xl border border-border/60 bg-card/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Dernière analyse · {latest.kind === 'hair' ? 'cheveux' : 'peau'}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-foreground/90">{latest.summary}</p>
        </div>
      )}

      {analysis && analysis.readable && (
        <div className="mt-3 space-y-2.5">
          <p className="text-[12.5px] leading-relaxed text-foreground/90">{analysis.summary}</p>

          {analysis.observations?.length > 0 && (
            <div className="rounded-xl bg-muted/50 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Ce que Mimo observe</p>
              <ul className="mt-1 space-y-1">
                {analysis.observations.map((item) => (
                  <li key={item} className="text-[11.5px] leading-relaxed">· {item}</li>
                ))}
              </ul>
            </div>
          )}

          {[
            { title: 'Routine du matin', steps: analysis.morning_steps },
            { title: 'Routine du soir', steps: analysis.evening_steps },
            { title: 'Une fois par semaine', steps: analysis.weekly_steps },
          ]
            .filter((block) => block.steps?.length)
            .map((block) => (
              <div key={block.title} className="rounded-xl border border-border/60 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{block.title}</p>
                <ol className="mt-1.5 space-y-1.5">
                  {block.steps.map((step, index) => (
                    <li key={`${block.title}-${index}`} className="text-[11.5px] leading-relaxed">
                      <span className="font-medium">{index + 1}. {step.title}</span>
                      <span className="block text-muted-foreground">{step.detail}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}

          {analysis.avoid?.length > 0 && (
            <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11.5px] leading-relaxed text-destructive">
              À éviter : {analysis.avoid.join(' · ')}
            </p>
          )}

          {analysis.caution && (
            <p className="flex items-start gap-1.5 px-1 text-[11px] leading-relaxed text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {analysis.caution}
            </p>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-3 text-[12.5px] font-medium text-primary disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {saving ? 'Enregistrement…' : 'Ajouter ces routines à mes soins'}
          </button>
        </div>
      )}

      <input ref={fallbackRef} type="file" accept="image/*" capture="user" onChange={onFallbackFile} className="hidden" />

      <CameraCapture
        open={Boolean(activeShot)}
        shot={activeShot}
        onClose={() => setActiveShot(null)}
        onCapture={(file) => activeShot && takeShot(activeShot, file)}
        onFallback={openFallback}
      />
    </div>
  );
}