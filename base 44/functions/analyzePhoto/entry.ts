import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const stepSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Nom du geste, court.' },
    detail: { type: 'string', description: 'Quantité, geste précis, temps d’attente, point de vigilance.' },
  },
  required: ['title', 'detail'],
};

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    readable: { type: 'boolean', description: 'La photo permet-elle une observation utile ?' },
    summary: { type: 'string', description: '2 à 3 phrases sur ce que montre la photo, sans diagnostic.' },
    observations: { type: 'array', description: '3 à 5 constats visibles uniquement.', items: { type: 'string' } },
    concerns: { type: 'array', description: '2 à 4 points d’attention cosmétiques.', items: { type: 'string' } },
    morning_steps: { type: 'array', description: 'Routine du matin, 3 à 5 étapes ordonnées.', items: stepSchema },
    evening_steps: { type: 'array', description: 'Routine du soir, 3 à 5 étapes ordonnées.', items: stepSchema },
    weekly_steps: { type: 'array', description: 'Soin hebdomadaire, 0 à 2 étapes.', items: stepSchema },
    products: { type: 'array', description: 'Types de produits à utiliser, sans marque.', items: { type: 'string' } },
    avoid: { type: 'array', description: 'Ce qu’il faut éviter avec ce profil.', items: { type: 'string' } },
    caution: { type: 'string', description: 'Une phrase : quand consulter un professionnel.' },
  },
  required: ['readable', 'summary', 'observations', 'morning_steps', 'evening_steps', 'caution'],
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const kind = body.kind === 'hair' ? 'hair' : 'skin';
    const incoming = Array.isArray(body.photos)
      ? body.photos.map((photo) => ({
          label: String(photo?.label || 'Photo').slice(0, 60),
          file_uri: String(photo?.file_uri || ''),
        }))
      : [{ label: 'Photo', file_uri: String(body.file_uri || '') }];
    const photos = incoming.filter((photo) => photo.file_uri).slice(0, 4);
    if (!photos.length) return Response.json({ error: 'photos is required' }, { status: 400 });

    const signed = await Promise.all(
      photos.map((photo) =>
        base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
          file_uri: photo.file_uri,
          expires_in: 600,
        }).catch(() => null)
      )
    );
    const usable = photos
      .map((photo, index) => ({ label: photo.label, url: signed[index]?.signed_url }))
      .filter((photo) => photo.url);
    if (!usable.length) return Response.json({ error: 'Photos inaccessibles' }, { status: 400 });

    const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
    const profile = profiles[0] || {};

    const subject = kind === 'hair' ? 'les cheveux et le cuir chevelu' : 'le visage et la peau';
    const photoList = usable.map((photo, index) => `${index + 1}. ${photo.label}`).join('\n');

    const prompt = `Tu es Mimo, conseiller soins de l'application GlowUp. Tu observes ${usable.length} photo(s) de ${subject} prises sous des angles différents :

${photoList}

CROISE LES ANGLES :
- Ce qui apparaît sur plusieurs photos est un constat fiable.
- Ce qui n'apparaît que sur un seul angle ou en contre-jour est à nuancer, jamais à dramatiser.
- Utilise les profils pour repérer les zones que la face ne montre pas (tempes, mâchoires, derrière les oreilles, nuque).

PROFIL DÉCLARÉ :
${JSON.stringify({
  age: profile.age || profile.age_range || null,
  type_peau: profile.skin_type || null,
  sensibilite: profile.skin_sensitivity || null,
  preoccupations_peau: profile.skin_concerns || [],
  type_cheveux: profile.hair_type || null,
  preoccupations_cheveux: profile.hair_concerns || [],
  produits_possedes: profile.beauty_products || null,
  budget: profile.monthly_budget || null,
  objectif: profile.domain_goals?.beaute || null,
})}

RÈGLES ABSOLUES :
- Tu décris uniquement ce qui est visible. Aucun diagnostic, aucune maladie, aucun médicament, aucun complément, aucune promesse de résultat.
- Si les photos sont floues, trop sombres, maquillées ou inutilisables : « readable » = false et explique en une phrase ce qu'il faut refaire.
- Si une seule photo est exploitable, analyse-la sans le signaler.
- Sois respectueux : jamais de jugement sur l'apparence.
- Étapes dans l'ordre exact d'application, avec la quantité (une noisette, 2 pressions, l'équivalent d'une pièce de 10 centimes) et le temps d'attente avant l'étape suivante.
- Utilise en priorité les produits que la personne possède déjà ; sinon reste sur des catégories de produits courantes, sans marque.
- Donne la fréquence (tous les matins, 2 fois par semaine) et les précautions (zones à éviter, produits à ne pas mélanger, protection solaire).
- 3 à 5 étapes le matin, 3 à 5 le soir, 0 à 2 par semaine.
- Français simple, phrases courtes, TUTOIEMENT obligatoire.

Réponds uniquement via le format JSON demandé.`;

    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: usable.map((photo) => photo.url),
      response_json_schema: ANALYSIS_SCHEMA,
    });

    const cleanSteps = (list) =>
      (Array.isArray(list) ? list : [])
        .slice(0, 6)
        .map((s) => ({ title: String(s?.title || '').slice(0, 140), detail: String(s?.detail || '').slice(0, 600) }))
        .filter((s) => s.title && s.detail);

    const analysis = {
      readable: raw?.readable !== false,
      summary: String(raw?.summary || '').slice(0, 900),
      observations: (Array.isArray(raw?.observations) ? raw.observations : []).slice(0, 5).map((t) => String(t).slice(0, 300)),
      concerns: (Array.isArray(raw?.concerns) ? raw.concerns : []).slice(0, 4).map((t) => String(t).slice(0, 300)),
      morning_steps: cleanSteps(raw?.morning_steps),
      evening_steps: cleanSteps(raw?.evening_steps),
      weekly_steps: cleanSteps(raw?.weekly_steps).slice(0, 2),
      products: (Array.isArray(raw?.products) ? raw.products : []).slice(0, 8).map((t) => String(t).slice(0, 120)),
      avoid: (Array.isArray(raw?.avoid) ? raw.avoid : []).slice(0, 5).map((t) => String(t).slice(0, 200)),
      caution: String(raw?.caution || '').slice(0, 400),
      kind,
    };

    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}