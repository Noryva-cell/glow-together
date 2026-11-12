import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles } from 'lucide-react';
import ProgramCard from '@/components/program/ProgramCard';
import ProgramProposal from '@/components/program/ProgramProposal';
import DomainGoalsFields from '@/components/onboarding/DomainGoalsFields';
import MimoAvatar from '@/components/mimo/MimoAvatar';
import { DOMAINS } from '@/lib/constants';

export default function Program() {
  const [programs, setPrograms] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [needsGoals, setNeedsGoals] = useState(false);
  const [goalsDraft, setGoalsDraft] = useState({});
  const [goalsSelected, setGoalsSelected] = useState([]);

  const load = async () => {
    const list = await base44.entities.Program.filter({});
    const activeByDomain = {};
    const pending = [];

    list.forEach((program) => {
      if (program.status === 'propose') { pending.push(program); return; }
      if (!program.active || program.status === 'archive' || program.status === 'refuse') return;
      const current = activeByDomain[program.domain];
      if (!current || (Number(program.version) || 1) > (Number(current.version) || 1)) {
        activeByDomain[program.domain] = program;
      }
    });

    setPrograms(DOMAINS.map((domain) => activeByDomain[domain.value]).filter(Boolean));
    setProposals(pending.sort((a, b) => String(b.created_date).localeCompare(String(a.created_date))));
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
        setGoalsDraft(profiles[0]?.domain_goals || {});
        setGoalsSelected(profiles[0]?.goals_selected || []);
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const generate = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('buildProgram', {});
      const data = response.data || {};
      if (data.needsObjectives) {
        setNeedsGoals(true);
        setError('Mimo a besoin d’un objectif précis par domaine pour préparer tes séances.');
      } else if (!Array.isArray(data.programs) || !data.programs.length) {
        setError('Mimo n’a pas réussi à préparer ton programme. Réessaie dans un instant.');
      } else {
        setNeedsGoals(false);
        await load();
      }
    } catch (e) {
      setError('Mimo n’a pas réussi à préparer ton programme. Réessaie dans un instant.');
    } finally {
      setBusy(false);
    }
  };

  const decide = async (program, action) => {
    setBusyId(program.id);
    setError('');
    try {
      await base44.functions.invoke('adaptProgram', { action, program_id: program.id });
      await load();
    } catch (e) {
      setError('Cette proposition n’a pas pu être appliquée. Réessaie dans un instant.');
    } finally {
      setBusyId('');
    }
  };

  const saveGoals = async () => {
    setBusy(true);
    const user = await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
    if (profiles[0]) await base44.entities.UserProfile.update(profiles[0].id, { domain_goals: goalsDraft });
    setBusy(false);
    await generate();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-4 px-1">
        <div>
          <h1 className="font-display text-xl leading-tight">Mon programme</h1>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Des séances détaillées étape par étape, qui évoluent selon tes bilans.
          </p>
        </div>
        {programs.length > 0 && (
          <Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={generate} disabled={busy}>
            <RefreshCw className={busy ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
            {busy ? 'Mimo réfléchit…' : 'Régénérer'}
          </Button>
        )}
      </header>

      {error && (
        <p className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
          {error}
        </p>
      )}

      {proposals.length > 0 && (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <ProgramProposal
              key={proposal.id}
              program={proposal}
              busy={busyId === proposal.id}
              onAccept={(p) => decide(p, 'accept')}
              onRefuse={(p) => decide(p, 'reject')}
            />
          ))}
        </div>
      )}

      {needsGoals && (
        <section className="surface p-5">
          <p className="font-display text-base">Dis-moi ce que tu veux obtenir</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
            Un objectif concret par domaine suffit : Mimo en déduit les séances détaillées.
          </p>
          <div className="mt-4">
            <DomainGoalsFields value={goalsDraft} onChange={setGoalsDraft} goalsSelected={goalsSelected} />
          </div>
          <Button className="mt-4 w-full rounded-full py-5" onClick={saveGoals} disabled={busy}>
            {busy ? 'Mimo prépare tes séances…' : 'Enregistrer et générer'}
          </Button>
        </section>
      )}

      {programs.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          {programs.map((program) => <ProgramCard key={program.id} program={program} />)}
        </div>
      )}

      {!programs.length && !needsGoals && (
        <section className="surface flex flex-col items-center px-6 py-10 text-center">
          <MimoAvatar mood="explication" rounded="rounded-[1.4rem]" className="h-24 w-24" />
          <p className="mt-4 font-display text-base">Mimo n’a pas encore ton programme</p>
          <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
            Mimo relit ton profil et tes objectifs, puis écrit des séances complètes : étapes, quantités, repos et erreurs à éviter.
          </p>
          <Button className="mt-5 rounded-full px-6" onClick={generate} disabled={busy}>
            <Sparkles className="h-4 w-4" />
            {busy ? 'Mimo prépare…' : 'Préparer mon programme'}
          </Button>
        </section>
      )}

      <p className="px-1 pb-2 text-[11px] leading-relaxed text-muted-foreground">
        GlowUp organise et accompagne : ce n’est pas un avis médical. Arrête un exercice en cas de douleur et parles-en
        à un professionnel de santé.
      </p>
    </div>
  );
}