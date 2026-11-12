import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MOODS = ['accueil', 'ecoute', 'reflexion', 'explication', 'encouragement', 'felicitation', 'concentration', 'cuisine', 'beaute', 'repos'];

const CATEGORY_VALUES = ['sport', 'beaute', 'alimentation', 'culture', 'menage', 'organisation', 'travail', 'repos', 'personnel'];

const GOAL_TYPES = ['apparence', 'peau', 'cheveux', 'force', 'sport_specifique', 'exercice', 'mobilite', 'alimentation', 'cuisiner', 'culture', 'langue', 'discipline', 'procrastination', 'temps', 'rangement', 'confiance', 'sommeil'];

const SCHEMA = {
  type: 'object',
  properties: {
    reply: {
      type: 'string',
      description: 'Réponse de Mimo en français, tutoiement, 110 mots maximum, chaleureuse et concrète.',
    },
    mood: { type: 'string', enum: MOODS },
    actions: {
      type: 'array',
      description: 'Actions concrètes à enregistrer après confirmation. Tableau vide si aucune action.',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['create_routine', 'add_tasks', 'create_goal', 'create_habit'] },
          title: { type: 'string', description: 'Titre court de la proposition, ex. « Routine peau du soir ».' },
          routine: {
            type: 'object',
            description: 'À remplir uniquement si type = create_routine, sinon omettre.',
            properties: {
              name: { type: 'string' },
              moment: { type: 'string', enum: ['matin', 'soir'] },
              category: { type: 'string', enum: CATEGORY_VALUES },
              steps: { type: 'array', items: { type: 'string' } },
              days: { type: 'array', items: { type: 'number' } },
            },
            required: ['name', 'steps'],
          },
          tasks: {
            type: 'array',
            description: 'À remplir uniquement si type = add_tasks, sinon omettre.',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                date: { type: 'string', description: 'YYYY-MM-DD' },
                start_time: { type: 'string', description: 'HH:MM, optionnel' },
                duration_minutes: { type: 'number' },
                category: { type: 'string', enum: CATEGORY_VALUES },
                priority: { type: 'string', enum: ['haute', 'moyenne', 'basse'] },
              },
              required: ['title', 'date'],
            },
          },
          goal: {
            type: 'object',
            description: 'À remplir uniquement si type = create_goal, sinon omettre.',
            properties: {
              title: { type: 'string' },
              goal_type: { type: 'string', enum: GOAL_TYPES },
              desired_outcome: { type: 'string' },
              target_date: { type: 'string' },
            },
            required: ['title'],
          },
          habit: {
            type: 'object',
            description: 'À remplir uniquement si type = create_habit, sinon omettre.',
            properties: {
              name: { type: 'string' },
              frequency: { type: 'string', enum: ['quotidien', 'hebdomadaire'] },
              days: { type: 'array', items: { type: 'number' } },
              target_per_week: { type: 'number' },
            },
            required: ['name'],
          },
        },
        required: ['type', 'title'],
      },
    },
  },
  required: ['reply', 'mood'],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : '';
    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

    const history = Array.isArray(body.history)
      ? body.history.slice(-8).map((m) => ({
          role: m?.role === 'assistant' ? 'assistant' : 'user',
          content: String(m?.content || '').slice(0, 600),
        }))
      : [];

    const now = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const inTwoWeeks = new Date(now.getTime() + 14 * 86400000);

    const [profiles, goals, routines, habits, tasks, blocks] = await Promise.all([
      base44.entities.UserProfile.filter({ created_by_id: user.id }),
      base44.entities.Goal.filter({ status: 'en_cours' }),
      base44.entities.Routine.filter({ active: true }),
      base44.entities.Habit.filter({ active: true }),
      base44.entities.Task.filter({ date: { $gte: iso(now), $lte: iso(inTwoWeeks) } }),
      base44.entities.TimeBlock.list(),
    ]);

    const profile = profiles[0] || null;
    const p = profile || {};

    const context = {
      date_du_jour: iso(now),
      heure_locale: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      jours_semaine: '0=dimanche, 1=lundi, 2=mardi, 3=mercredi, 4=jeudi, 5=vendredi, 6=samedi',
      profil: profile
        ? {
            prenom: p.nickname,
            tranche_age: p.age_range,
            taille_cm: p.height_cm,
            poids_kg: p.weight_kg,
            niveau_activite: p.activity_level,
            niveau_sport: p.sport_level,
            alimentation: p.diet,
            allergies: p.allergies,
            aime_manger: p.food_likes,
            n_aime_pas: p.food_dislikes,
            niveau_cuisine: p.cooking_level,
            type_peau: p.skin_type,
            type_cheveux: p.hair_type,
            budget_mensuel: p.monthly_budget,
            minutes_libres_par_jour: p.free_minutes_per_day,
            reveil: p.wake_time,
            coucher: p.sleep_time,
            jours_disponibles: p.available_days,
            creneaux_preferes: p.preferred_slots,
            objectifs_choisis: p.goals_selected,
            modules: p.modules,
            style_coaching: p.coaching_style,
            equipement: p.equipment,
          }
        : null,
      objectifs: goals.slice(0, 8).map((g) => ({ titre: g.title, type: g.goal_type, echeance: g.target_date, progression: g.progress })),
      routines: routines.slice(0, 8).map((r) => ({ nom: r.name, moment: r.moment, categorie: r.category, etapes: (r.steps || []).slice(0, 6), jours: r.days })),
      habitudes: habits.slice(0, 10).map((h) => ({ nom: h.name, frequence: h.frequency, jours: h.days })),
      obligations_hebdomadaires: blocks.slice(0, 30).map((b) => ({ intitule: b.label, type: b.type, jour: b.day_of_week, debut: b.start_time, fin: b.end_time })),
      planning_a_venir: tasks.slice(0, 40).map((t) => ({ date: t.date, heure: t.start_time, titre: t.title, categorie: t.category, statut: t.status, duree: t.duration_minutes })),
    };

    const prompt = `Tu es Mimo, le compagnon bienveillant de l'application GlowUp (organisation, sport, beauté, alimentation, culture, ménage).

Voici les données déjà connues de l'utilisateur (ne les redemande JAMAIS) :
${JSON.stringify(context)}

RÈGLES :
- Réponds en français, tutoiement, ton chaleureux et simple, 110 mots maximum.
- Si une information indispensable manque pour agir, poses UNE seule question courte et ne renvoie aucune action.
- Tu ne peux PAS encore : proposer des recettes ou menus complets, recommander des produits cosmétiques précis, analyser des photos. Dis-le simplement si on te le demande, sans inventer, et propose ce que tu sais faire (routine, tâches, objectif, habitude).
- Tu ne peux pas cocher une tâche à la place de l'utilisateur : ne prétends jamais qu'une action a été réalisée.
- Pas de diagnostic médical, pas de régime restrictif, pas de promesse de résultat. En cas de douleur, de symptôme ou de trouble alimentaire, invite à consulter un professionnel.
- Adapte les volumes au niveau, à l'âge et au temps disponible. Reste progressif et sûr.
- Utilise les jours disponibles et respecte les obligations hebdomadaires et le planning déjà rempli : ne programme rien pendant un créneau occupé.
- Les dates des tâches doivent être au format YYYY-MM-DD, entre ${iso(now)} et ${iso(inTwoWeeks)}. Les jours sont numérotés : 0=dimanche ... 6=samedi.
- Remplis uniquement le champ correspondant au type d'action (routine pour create_routine, tasks pour add_tasks, goal pour create_goal, habit pour create_habit). N'ajoute jamais les autres champs.
- Propose des actions seulement si l'utilisateur demande quelque chose de concret. Elles seront enregistrées après sa confirmation.
  * create_routine : 3 à 8 étapes maximum, un moment (matin/soir), une catégorie, des jours.
  * add_tasks : 1 à 6 tâches maximum, avec durée entre 5 et 90 minutes.
  * create_goal : un objectif clair avec type et échéance.
  * create_habit : une action simple, répétable.
- Choisis "mood" selon le ton de ta réponse : accueil, ecoute, reflexion, explication, encouragement, felicitation, concentration, cuisine, beaute, repos.

Historique récent de la conversation :
${history.length ? history.map((m) => `${m.role === 'assistant' ? 'Mimo' : 'Utilisateur'} : ${m.content}`).join('\n') : '(début de la conversation)'}

Nouveau message de l'utilisateur : ${message}

Réponds uniquement via le format JSON demandé.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: SCHEMA,
    });

    const reply = typeof result?.reply === 'string' && result.reply.trim() ? result.reply.trim() : 'Je n’ai pas réussi à formuler une réponse. Reformule ta demande ?';
    const mood = MOODS.includes(result?.mood) ? result.mood : 'explication';

    // On ne garde que la charge utile correspondant au type d'action
    const keepPayload = (action) => {
      if (!action || typeof action !== 'object') return null;
      const base = { type: action.type, title: String(action.title || '').slice(0, 120) };
      if (action.type === 'create_routine' && action.routine?.name) return { ...base, routine: action.routine };
      if (action.type === 'add_tasks' && Array.isArray(action.tasks) && action.tasks.length) return { ...base, tasks: action.tasks };
      if (action.type === 'create_goal' && action.goal?.title) return { ...base, goal: action.goal };
      if (action.type === 'create_habit' && action.habit?.name) return { ...base, habit: action.habit };
      return null;
    };

    const actions = Array.isArray(result?.actions)
      ? result.actions.slice(0, 4).map(keepPayload).filter(Boolean)
      : [];

    return Response.json({ reply, mood, actions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}