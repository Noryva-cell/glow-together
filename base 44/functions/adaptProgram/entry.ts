import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  DOMAINS,
  DOMAIN_LABEL,
  PROGRAM_SCHEMA,
  cleanProgram,
  archiveDomainPrograms,
  syncProgramTemplates,
} from '../../shared/program.ts';

const FEEDBACK_LABEL = {
  reussi: "a tout réussi",
  partiel: "a réussi une partie seulement",
  trop_difficile: "a trouvé la séance trop difficile",
  trop_facile: "a trouvé la séance trop facile",
  interrompu: "n'a pas pu terminer (manque de temps ou d'énergie)",
  non_fait: "n'a pas réalisé l'activité",
};

const safetyMessage =
  "Tu as signalé une douleur ou une réaction inhabituelle. Je ne propose aucune progression aujourd'hui : arrête l'activité concernée et, si cela persiste, demande l'avis d'un professionnel de santé.";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'adapt');

    // ---- Accepter ou refuser une proposition de version ----
    if (action === 'accept' || action === 'reject') {
      if (!body.program_id) return Response.json({ error: 'program_id requis' }, { status: 400 });

      const proposal = await base44.entities.Program.get(body.program_id).catch((e) =>
        e.status === 404 ? null : Promise.reject(e)
      );
      if (!proposal) return Response.json({ error: 'Proposition introuvable' }, { status: 404 });
      if (proposal.status !== 'propose') {
        return Response.json({ error: 'Cette proposition n’est plus disponible' }, { status: 400 });
      }

      if (action === 'reject') {
        const refused = await base44.entities.Program.update(proposal.id, { status: 'refuse', active: false });
        return Response.json({ program: refused, refused: true });
      }

      await archiveDomainPrograms(base44, proposal.domain, proposal.id);
      const accepted = await base44.entities.Program.update(proposal.id, { status: 'actif', active: true });
      await syncProgramTemplates(base44, accepted);
      return Response.json({ program: accepted });
    }

    // ---- Adapter la prochaine séance à partir du bilan ----
    const domain = String(body.domain || '');
    if (!DOMAINS.includes(domain)) return Response.json({ error: 'Domaine invalide' }, { status: 400 });

    const [programs, feedbackPage] = await Promise.all([
      base44.entities.Program.filter({ domain, status: 'actif' }),
      base44.entities.ActivityFeedback.filter({ domain }, { sort: '-created_date', limit: 6 }),
    ]);

    const current = [...programs].sort((a, b) => (Number(b.version) || 0) - (Number(a.version) || 0))[0];
    if (!current) return Response.json({ error: 'Aucun programme actif pour ce domaine' }, { status: 400 });

    const feedbacks = feedbackPage.items || [];
    if (feedbacks[0]?.pain) {
      return Response.json({ safe: false, message: safetyMessage, proposal: null });
    }

    const feedbackText = feedbacks
      .map(
        (f) =>
          `- ${f.title} (${f.date}) : ${FEEDBACK_LABEL[f.status] || f.status}${
            f.difficulty ? ` · difficulté ressentie : ${f.difficulty}` : ''
          }${f.feeling ? ` · ressenti ${f.feeling}/5` : ''}${f.note ? ` · « ${f.note} »` : ''}`
      )
      .join('\n');

    const currentText = (current.items || [])
      .map((item) => `- ${item.title} (${item.minutes || 30} min) : ${(item.steps || []).map((s) => s.title).join(' → ')}`)
      .join('\n');

    const prompt = `Tu es Mimo, le compagnon de GlowUp. Tu ajustes UN programme de ${DOMAIN_LABEL[domain]} à partir des retours réels de la personne.

OBJECTIF : ${current.objective}
NIVEAU DE DÉPART : ${current.start_level || current.level || 'non précisé'}
CIBLE : ${current.target || 'non précisée'}
VERSION ACTUELLE : ${current.version || 1}

CONTENU ACTUEL :
${currentText}

BILANS RÉCENTS (du plus récent au plus ancien) :
${feedbackText || '- aucun bilan'}

RÈGLES D'ADAPTATION (obligatoires) :
- « trop difficile » ou « n'a pas pu terminer » : réduis le volume ou la durée, simplifie les exercices, augmente les repos. Ne progresse pas.
- « tout réussi » + « trop facile » : augmente légèrement (une seule variable à la fois, +10 à 20 %).
- « tout réussi » et difficulté adaptée : conserve le niveau et propose la séance suivante du parcours.
- « une partie » : garde le niveau, renforce l'étape qui a posé problème, et réexplique-la plus simplement.
- « pas réalisé » (manque de temps) : propose une version courte (10-15 min) qui garde l'essentiel.
- Pour les soins : ne change pas tous les produits d'un coup ; tiens compte de la tolérance et de la régularité.
- Ne progresse JAMAIS simplement parce qu'une semaine est passée : uniquement sur la base des résultats.
- Dans « rationale », explique en 2 phrases maximum POURQUOI tu changes (ou non) par rapport à la version ${current.version || 1}.
- Chaque séance doit rester entièrement détaillée (étapes ordonnées, quantités, repos ou temps de pose, erreurs à éviter, adaptations).
- Aucun diagnostic, aucun médicament, aucun complément, aucune calorie imposée. Tutoiement obligatoire.

Réponds uniquement via le format JSON demandé.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: PROGRAM_SCHEMA,
    });

    const program = cleanProgram(result);
    if (!program.items.length) {
      return Response.json({ error: 'Adaptation vide' }, { status: 502 });
    }

    await base44.entities.Program.updateMany(
      { domain, status: 'propose' },
      { $set: { status: 'archive', active: false } }
    );

    const version = (Number(current.version) || 1) + 1;
    const rationale = program.rationale || 'Ajustement proposé à partir de ton dernier bilan.';

    const [proposal] = await base44.entities.Program.bulkCreate([
      {
        domain,
        objective: program.objective || current.objective,
        level: program.start_level || current.level,
        start_level: program.start_level || current.start_level,
        target: program.target || current.target,
        summary: program.summary,
        rationale,
        safety: program.safety || current.safety,
        review_weeks: program.review_weeks,
        version,
        status: 'propose',
        active: false,
        milestones: program.milestones,
        history: [
          ...((current.history) || []),
          { version, date: new Date().toISOString(), reason: rationale },
        ],
        items: program.items,
      },
    ]);

    return Response.json({ proposal, safe: true, previous_version: current.version || 1 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}