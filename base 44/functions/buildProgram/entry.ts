import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  DOMAINS,
  DOMAIN_LABEL,
  PROGRAM_SCHEMA,
  cleanProgram,
  archiveDomainPrograms,
  syncProgramTemplates,
} from '../../shared/program.ts';

const CATEGORY_BY_GOAL = {
  apparence: 'beaute',
  peau: 'beaute',
  cheveux: 'beaute',
  force: 'sport',
  sport_specifique: 'sport',
  exercice: 'sport',
  mobilite: 'sport',
  alimentation: 'alimentation',
  cuisiner: 'alimentation',
  culture: 'culture',
  langue: 'culture',
  discipline: 'organisation',
  procrastination: 'organisation',
  temps: 'organisation',
  rangement: 'menage',
  confiance: 'personnel',
  sommeil: 'personnel',
};

const DOMAIN_RULES = {
  sport: `- Commence par un échauffement (articulations et montée en température) avec la durée exacte.
- Donne ensuite les exercices dans l'ordre : séries × répétitions ou durée, temps de repos entre les séries, position de départ, exécution, respiration.
- Termine par un retour au calme si la séance est intense.
- Dans « adaptations », donne la variante plus facile (appui, amplitude, volume réduit) et la variante plus exigeante.`,
  beaute: `- Étapes dans l'ordre exact d'application, avec le type de produit (sans inventer de marque), la quantité indicative (ex. « une noisette », « 2 pressions », « l'équivalent d'une pièce de 10 centimes »), le temps d'attente avant l'étape suivante.
- Précise la fréquence (matin / soir, nombre de fois par semaine) et les précautions (zones à éviter, produits à ne pas mélanger, protection solaire).
- Pour les cheveux : lavage, application, temps de pose, rinçage, séchage, fréquence personnalisée.`,
  alimentation: `- Donne une recette précise et réalisable : nom, portions, ingrédients avec quantités, étapes de préparation ordonnées, temps de préparation et de cuisson, matériel nécessaire.
- Respecte le régime, les allergies, les goûts et le budget indiqués. Pas de régime restrictif, pas de calories imposées.`,
  menage: `- Nomme la zone exacte à traiter.
- Donne les actions dans l'ordre, avec une durée indicative pour chacune, le matériel nécessaire, et le résultat attendu à la fin.
- Reste dans le temps disponible indiqué par la personne.`,
  culture: `- Sujet précis, notions à comprendre (3 à 5), un exercice ou un quiz de 3 questions avec les réponses, et le résultat attendu à la fin de la séance.
- Cite des sources réellement existantes (manuel, encyclopédie, ouvrage) sans inventer de lien ni de référence.`,
  organisation: `- Une action précise par étape, la toute première étape doit être très simple (moins de 2 minutes) pour démarrer.
- Donne la durée réaliste et le critère qui permet de savoir que la tâche est terminée.`,
  personnel: `- Habitudes concrètes, rythme tenable, aucune promesse de résultat, aucun diagnostic.
- Donne les signes qui indiquent que la personne doit ralentir ou en parler à un professionnel.`,
};

function profileContext(p) {
  return {
    age: p.age || p.age_range || null,
    taille_cm: p.height_cm || null,
    poids_kg: p.weight_kg || null,
    niveau_activite: p.activity_level || null,
    niveau_sport: p.sport_level || null,
    equipement: p.equipment || [],
    minutes_libres_par_jour: p.free_minutes_per_day || null,
    jours_disponibles: p.available_days || [],
    alimentation: p.diet || null,
    allergies: p.allergies || null,
    aime_manger: p.food_likes || null,
    n_aime_pas: p.food_dislikes || null,
    niveau_cuisine: p.cooking_level || null,
    type_peau: p.skin_type || null,
    sensibilite_peau: p.skin_sensitivity || null,
    preoccupations_peau: p.skin_concerns || [],
    type_cheveux: p.hair_type || null,
    preoccupations_cheveux: p.hair_concerns || [],
    produits_possedes: p.beauty_products || null,
    budget_mensuel: p.monthly_budget || null,
    minutes_rangement: p.tidy_minutes || null,
    sujets_culture: p.culture_topics || [],
    style_coaching: p.coaching_style || null,
  };
}

const feedbackContext = (list) =>
  (list || []).slice(0, 5).map((f) => ({
    activite: f.title,
    resultat: f.status,
    difficulte: f.difficulty || null,
    ressenti: f.feeling || null,
    douleur: !!f.pain,
    note: f.note || null,
  }));

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const requested = Array.isArray(body.domains) ? body.domains.filter((d) => DOMAINS.includes(d)).slice(0, 6) : [];

    const [profiles, goals] = await Promise.all([
      base44.entities.UserProfile.filter({ created_by_id: user.id }),
      base44.entities.Goal.filter({ status: 'en_cours' }),
    ]);

    const p = profiles[0];
    if (!p) return Response.json({ error: 'Profil introuvable' }, { status: 400 });

    const domainGoals = p.domain_goals || {};
    const objectiveByDomain = {};
    DOMAINS.forEach((d) => {
      const text = String(domainGoals[d] || '').trim();
      if (text) objectiveByDomain[d] = text;
    });
    goals.forEach((g) => {
      const domain = CATEGORY_BY_GOAL[g.goal_type];
      if (!domain || objectiveByDomain[domain]) return;
      const text = String(g.desired_outcome || g.title || '').trim();
      if (text) objectiveByDomain[domain] = text;
    });

    const domains = (requested.length ? requested : DOMAINS).filter((d) => objectiveByDomain[d]).slice(0, 6);
    if (!domains.length) return Response.json({ programs: [], needsObjectives: true });

    const context = profileContext(p);

    const results = await Promise.allSettled(
      domains.map(async (domain) => {
        const feedbackPage = await base44.entities.ActivityFeedback.filter(
          { domain },
          { sort: '-created_date', limit: 5 }
        );
        const feedbacks = feedbackContext(feedbackPage.items);

        const prompt = `Tu écris le programme de ${DOMAIN_LABEL[domain]} d'une personne, dans l'application GlowUp. Tu t'appelles Mimo.

PROFIL :
${JSON.stringify(context)}

OBJECTIF PRÉCIS DE LA PERSONNE (c'est le cœur du programme) :
${objectiveByDomain[domain]}

${feedbacks.length ? `RETOURS D'EXPÉRIENCE RÉCENTS (adaptés à ces résultats, ne progresse pas si elle a échoué ou eu mal) :\n${JSON.stringify(feedbacks)}` : "Aucun retour d'expérience pour l'instant : commence au niveau prudent."}

CONSIGNES POUR CE DOMAINE :
${DOMAIN_RULES[domain]}

RÈGLE ABSOLUE : une activité ne doit JAMAIS se limiter à un titre ou à une consigne vague. La personne doit pouvoir ouvrir la séance et savoir exactement quoi faire, sans rien rechercher, comme si un coach était à côté d'elle.
- 3 séances maximum, détaillées et différentes les unes des autres.
- Chaque séance : 4 à 8 étapes ordonnées. Chaque étape contient un titre précis et, dans « detail », les quantités exactes (séries × répétitions, minutes, millilitres, quantité de produit), la position ou le geste, la respiration, le tempo, le temps de repos ou d'attente, et le point technique clé. 3 phrases minimum par étape.
- « instructions » : 4 à 6 phrases qui donnent le déroulé complet (ce qui vient avant, ce qui vient après, l'allure générale, ce que la personne doit ressentir, la tenue ou l'installation).
- « materials » : liste précise, avec quantités ou tailles (ex. « 2 serviettes, une chaise stable, 1 L d'eau »). Écris « aucun » s'il n'y a rien.
- « errors » : 2 à 4 erreurs fréquentes concrètes, avec la correction à faire à la place.
- « adaptations » : une version plus simple et une version plus exigeante, chacune avec le changement exact (nombre, amplitude, durée).
- « caution » : le signe précis qui impose d'arrêter tout de suite.
- Si le profil ne permet pas de fixer une quantité, donne une fourchette claire et explique comment ajuster selon la sensation.
- « milestones » : 3 paliers observables. « review_weeks » : dans combien de semaines réévaluer.
- « rationale » : pourquoi ce contenu et cette progression.
- SÉCURITÉ : rien de dangereux, aucun diagnostic, aucun médicament, aucun complément, aucune calorie imposée, aucun jeûne.
- Français simple, phrases courtes, TUTOIEMENT obligatoire (« tu », « ton », jamais « vous »).

Réponds uniquement via le format JSON demandé.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: PROGRAM_SCHEMA,
        });
        return { domain, program: cleanProgram(result) };
      })
    );

    const generated = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((entry) => entry.program.items.length);

    if (!generated.length) return Response.json({ error: 'Programme vide' }, { status: 502 });

    const previousList = await base44.entities.Program.filter({ domain: { $in: generated.map((g) => g.domain) } });
    const latestByDomain = {};
    [...previousList]
      .sort((a, b) => (Number(b.version) || 0) - (Number(a.version) || 0))
      .forEach((prog) => {
        if (!latestByDomain[prog.domain]) latestByDomain[prog.domain] = prog;
      });

    const created = [];
    for (const { domain, program } of generated) {
      const previous = latestByDomain[domain];
      const version = previous ? (Number(previous.version) || 1) + 1 : 1;
      const history = [
        ...((previous?.history) || []),
        {
          version,
          date: new Date().toISOString(),
          reason: previous
            ? 'Nouvelle version détaillée générée depuis ton profil et tes objectifs.'
            : 'Première version du programme.',
        },
      ];

      await archiveDomainPrograms(base44, domain);

      const [record] = await base44.entities.Program.bulkCreate([
        {
          domain,
          objective: program.objective || objectiveByDomain[domain],
          level: program.start_level,
          start_level: program.start_level,
          target: program.target,
          summary: program.summary,
          rationale: program.rationale,
          safety: program.safety,
          review_weeks: program.review_weeks,
          version,
          status: 'actif',
          active: true,
          milestones: program.milestones,
          history,
          items: program.items,
        },
      ]);

      await syncProgramTemplates(base44, record);
      created.push(record);
    }

    return Response.json({ programs: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}