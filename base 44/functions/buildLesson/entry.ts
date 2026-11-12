import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const LEVELS = ['débutant', 'intermédiaire', 'avancé'];
const DURATIONS = [10, 15, 20, 30];

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Titre clair et concret de la leçon.' },
    content: {
      type: 'string',
      description:
        'La leçon complète en Markdown : un titre "#", puis 3 à 5 sections "##", des paragraphes courts, un exemple concret, et une dernière section "## À retenir".',
    },
    takeaways: {
      type: 'array',
      items: { type: 'string' },
      description: '3 à 5 notions clés, une phrase chacune.',
    },
    sources: {
      type: 'array',
      items: { type: 'string' },
      description: 'Noms d’ouvrages, d’encyclopédies ou d’auteurs de référence. Jamais d’URL.',
    },
  },
  required: ['title', 'content', 'takeaways', 'sources'],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const topic = String(body.topic || '').trim().slice(0, 120);
    const minutes = DURATIONS.includes(Number(body.minutes)) ? Number(body.minutes) : 15;
    const level = LEVELS.includes(body.level) ? body.level : 'débutant';
    if (topic.length < 3) return Response.json({ error: 'Sujet trop court' }, { status: 400 });

    const count = await base44.entities.CultureLesson.count({});
    if (count >= 300) {
      return Response.json({ error: 'Beaucoup de leçons déjà créées. Supprime-en quelques-unes.' }, { status: 429 });
    }

    const words = Math.round(minutes * 110);

    const prompt = `Tu es Mimo, le compagnon de l'application GlowUp. Tu écris une leçon de culture générale courte, exacte et agréable à lire.

Sujet demandé : « ${topic} »
Niveau : ${level}
Durée de lecture visée : ${minutes} minutes (environ ${words} mots)

RÈGLES :
- Écris en français simple, avec TUTOIEMENT ( « tu », « ton » ), jamais « vous ».
- Structure imposée en Markdown : commence par "# Titre", puis 3 à 5 sections "##" (contexte, idées clés, exemple concret, nuance ou erreur fréquente, puis "## À retenir").
- Une section = 2 à 4 phrases courtes. Pas de jargon non expliqué : si un mot technique est nécessaire, définis-le en une phrase.
- Apporte une information réelle et vérifiable. Si tu n'es pas sûr d'un chiffre ou d'une date, reste général plutôt que d'inventer.
- Aucune source inventée : ne donne que des ouvrages, encyclopédies ou auteurs réellement existants, sans URL. Si tu n'es pas sûr, laisse la liste vide.
- Pas de conseil médical, juridique ou financier personnalisé ; reste sur du savoir général.
- Termine le contenu par la section "## À retenir" avec 3 à 5 puces.

Réponds uniquement via le format JSON demandé.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: SCHEMA,
    });

    // Les modèles renvoient parfois tout le Markdown sur une seule ligne :
    // on rétablit les sauts de ligne avant chaque titre et chaque puce.
    const normalized = String(result?.content || '')
      .replace(/\r/g, '')
      .replace(/\s+(#{1,3})\s+/g, '\n\n$1 ')
      .replace(/\s+([-*•])\s+/g, '\n$1 ')
      .trim();

    // Le titre est déjà affiché par l'interface : on retire le H1 de tête.
    const content = normalized.replace(/^#[^#\n]*\n+/, '').slice(0, 14000);
    if (content.length < 200) return Response.json({ error: 'Leçon vide' }, { status: 502 });

    const lesson = await base44.entities.CultureLesson.create({
      topic,
      title: String(result?.title || topic).slice(0, 180),
      level,
      minutes,
      content,
      takeaways: (Array.isArray(result?.takeaways) ? result.takeaways : [])
        .slice(0, 5)
        .map((item) => String(item).slice(0, 220)),
      sources: (Array.isArray(result?.sources) ? result.sources : [])
        .slice(0, 5)
        .map((item) => String(item).slice(0, 220))
        .filter(Boolean),
    });

    return Response.json({ lesson });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}