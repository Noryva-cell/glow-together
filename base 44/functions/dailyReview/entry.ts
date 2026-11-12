import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    message: { type: 'string', description: '2 à 4 phrases de retour sur la journée, tutoiement, concret et honnête.' },
    tips: { type: 'array', description: '2 à 3 conseils très concrets pour demain.', items: { type: 'string' } },
    focus: { type: 'string', description: 'Une seule priorité pour demain, 12 mots maximum.' },
    week_message: {
      type: 'string',
      description: 'Si au moins 4 bilans précédents existent : 4 à 6 phrases de bilan de la semaine et 2 ajustements concrets. Sinon : chaîne vide.',
    },
  },
  required: ['message', 'tips', 'focus', 'week_message'],
};

function weekStartKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date.toISOString().slice(0, 10);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const date = String(body.date || '').slice(0, 10);
    if (!date) return Response.json({ error: 'date is required' }, { status: 400 });

    const clean = (list) =>
      (Array.isArray(list) ? list : []).slice(0, 20).map((t) => String(t || '').slice(0, 160)).filter(Boolean);
    const done = clean(body.done);
    const missed = clean(body.missed);
    const note = String(body.note || '').slice(0, 600);
    const energy = Math.min(5, Math.max(1, Math.round(Number(body.energy) || 3)));

    const [profiles, reviewPage, feedbackPage] = await Promise.all([
      base44.entities.UserProfile.filter({ created_by_id: user.id }),
      base44.entities.DailyReview.filter({}, { sort: '-date', limit: 7 }),
      base44.entities.ActivityFeedback.filter({}, { sort: '-created_date', limit: 8 }),
    ]);

    const profile = profiles[0] || {};
    const previous = (reviewPage.items || []).filter((r) => r.date !== date);

    const history = previous.map((r) => ({
      date: r.date,
      energie: r.energy,
      fait: r.done_titles,
      non_fait: r.missed_titles,
      mot: r.note || null,
    }));

    const feedbacks = (feedbackPage.items || []).map((f) => ({
      activite: f.title,
      domaine: f.domain || null,
      resultat: f.status,
      difficulte: f.difficulty || null,
      ressenti: f.feeling || null,
      douleur: !!f.pain,
      note: f.note || null,
    }));

    const prompt = `Tu es Mimo, le compagnon de l'application GlowUp. Tu fais le bilan du soir avec la personne.

PROFIL :
${JSON.stringify({
  prenom: profile.nickname || null,
  objectif_sport: profile.domain_goals?.sport || null,
  objectif_beaute: profile.domain_goals?.beaute || null,
  objectif_alimentation: profile.domain_goals?.alimentation || null,
  objectif_organisation: profile.domain_goals?.organisation || null,
  minutes_libres_par_jour: profile.free_minutes_per_day || null,
  style_coaching: profile.coaching_style || null,
})}

AUJOURD'HUI (${date}) :
- Énergie déclarée : ${energy}/5
- Ce qu'elle a coché comme fait : ${done.length ? JSON.stringify(done) : 'rien'}
- Ce qui n'a pas été fait : ${missed.length ? JSON.stringify(missed) : 'rien'}
- Son mot du soir : ${note || 'aucun'}

BILANS PRÉCÉDENTS :
${history.length ? JSON.stringify(history) : 'aucun bilan précédent'}

RETOURS D'ACTIVITÉS RÉCENTS :
${feedbacks.length ? JSON.stringify(feedbacks) : 'aucun retour'}

CONSIGNES :
- « message » : 2 à 4 phrases. Reconnais ce qui a été fait sans félicitation creuse. Si rien n'a été fait, ne culpabilise pas : cherche la cause concrète (charge, horaire, énergie) et propose plus petit.
- « tips » : 2 à 3 conseils applicables demain, liés à ce qui a coincé (heure précise, durée réduite, matériel prêt à l'avance). Pas de généralités.
- « focus » : une seule priorité pour demain, 12 mots maximum.
- « week_message » : uniquement si les bilans précédents sont au moins 4. Alors 4 à 6 phrases : ce qui revient souvent, ce qui bloque, puis 2 ajustements concrets pour la semaine prochaine (charge, horaires, type de séance, difficulté). Sinon renvoie une chaîne vide.
- Aucun diagnostic médical, aucun médicament, aucune calorie imposée. N'invente aucune donnée absente ci-dessus.
- Français simple, phrases courtes, TUTOIEMENT obligatoire.

Réponds uniquement via le format JSON demandé.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: REVIEW_SCHEMA,
    });

    const message = String(result?.message || '').slice(0, 1200);
    const tips = (Array.isArray(result?.tips) ? result.tips : []).slice(0, 3).map((t) => String(t).slice(0, 300));
    const focus = String(result?.focus || '').slice(0, 200);
    const weekMessage = String(result?.week_message || '').slice(0, 2000);

    const existing = await base44.entities.DailyReview.filter({ date }, { limit: 1 });
    const current = (existing.items || [])[0];

    const payload = {
      date,
      energy,
      done_titles: done,
      missed_titles: missed,
      note,
      ai_message: message,
      ai_tips: tips,
      focus,
      week_message: weekMessage,
      week_start: weekStartKey(date),
    };

    const review = current
      ? await base44.entities.DailyReview.update(current.id, payload)
      : await base44.entities.DailyReview.create(payload);

    return Response.json({ review });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}