import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SkinQuiz from '@/components/beauty/SkinQuiz';
import BeautyRoutine from '@/components/beauty/BeautyRoutine';
import PhotoAnalysis from '@/components/beauty/PhotoAnalysis';

export default function Soins() {
  const { profile, refreshProfile } = useOutletContext();
  const [program, setProgram] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    const [list, analysisPage] = await Promise.all([
      base44.entities.Program.filter({ domain: 'beaute', active: true }),
      base44.entities.BeautyAnalysis.list({ sort: '-created_date', limit: 1 }),
    ]);
    const latest = [...list].sort((a, b) => String(b.created_date || '').localeCompare(String(a.created_date || '')))[0];
    setProgram(latest || null);
    setAnalyses(analysisPage.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveQuiz = async (form) => {
    setSaving(true);
    setNotice('');
    await base44.entities.UserProfile.update(profile.id, {
      skin_type: form.skin_type,
      skin_sensitivity: form.skin_sensitivity,
      skin_concerns: form.skin_concerns,
      hair_type: form.hair_type,
      hair_concerns: form.hair_concerns,
      beauty_products: form.beauty_products,
      domain_goals: { ...(profile.domain_goals || {}), beaute: form.objective },
    });
    await refreshProfile();
    setSaving(false);
    setNotice('Réponses enregistrées. Tu peux générer ta routine.');
  };

  const generate = async () => {
    setBusy(true);
    setNotice('');
    try {
      const response = await base44.functions.invoke('buildProgram', { domains: ['beaute'] });
      const data = response.data || {};
      if (data.needsObjectives) {
        setNotice('Écris d’abord ton objectif beauté, puis enregistre : Mimo en a besoin pour préparer la routine.');
      } else if (!data.programs?.length) {
        setNotice('Mimo n’a pas réussi à préparer la routine. Réessaie dans un instant.');
      } else {
        await load();
      }
    } catch (e) {
      setNotice('Mimo n’a pas réussi à préparer la routine. Réessaie dans un instant.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <header className="px-1">
        <h1 className="font-display text-xl leading-tight">Soins</h1>
        <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-muted-foreground">
          Peau et cheveux : une routine courte, douce, avec les produits que tu as déjà.
        </p>
      </header>

      {notice && (
        <p className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
          {notice}
        </p>
      )}

      <BeautyRoutine program={program} busy={busy} onGenerate={generate} />

      <PhotoAnalysis latest={analyses[0]} onSaved={load} />

      <SkinQuiz key={profile?.updated_date || profile?.id} profile={profile} onSave={saveQuiz} busy={saving} />

      <p className="px-1 pb-2 text-[11px] leading-relaxed text-muted-foreground">
        GlowUp ne remplace pas un dermatologue. En cas de douleur, de réaction forte ou de lésion qui persiste, consulte un
        professionnel de santé.
      </p>
    </div>
  );
}