// ============================================================================
//  Supabase Edge Function: analyze-meal
//  Runs on Supabase's servers (Deno). The Google Gemini API key lives here as
//  a secret and is NEVER shipped inside the mobile app.
//
//  Deploy:   supabase functions deploy analyze-meal
//  Secret:   supabase secrets set GEMINI_API_KEY=your-google-ai-studio-key
// ============================================================================

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Try these vision-capable models in order until one has free-tier quota.
// (Different Gemini models have different free limits per account/region, so a
//  fallback list makes the app resilient to "quota: 0" on any single model.)
const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are a clinical nutrition assistant. You analyze a photo of a meal
for a specific person, taking their medical conditions into account.

Rules:
- Estimate nutrition for the WHOLE plate shown.
- "rating" reflects overall suitability given the user's health profile:
  "safe" = fine to eat as shown, "caution" = eat with limits/modifications,
  "avoid" = contains something risky for their conditions.
- Be specific: tie every concern to a named condition or allergy when possible.
- If an allergen the user listed may be present, always use "avoid".`;

// Force Gemini to return exactly the JSON shape the app expects.
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    foods: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { name: { type: 'STRING' }, confidence: { type: 'NUMBER' } },
        required: ['name'],
      },
    },
    nutrition: {
      type: 'OBJECT',
      properties: {
        calories: { type: 'NUMBER' }, carbs_g: { type: 'NUMBER' },
        protein_g: { type: 'NUMBER' }, fats_g: { type: 'NUMBER' },
        sodium_mg: { type: 'NUMBER' }, sugar_g: { type: 'NUMBER' },
      },
      required: ['calories', 'carbs_g', 'protein_g', 'fats_g', 'sodium_mg', 'sugar_g'],
    },
    safety: {
      type: 'OBJECT',
      properties: {
        rating: { type: 'STRING', enum: ['safe', 'caution', 'avoid'] },
        summary: { type: 'STRING' },
        concerns: { type: 'ARRAY', items: { type: 'STRING' } },
      },
      required: ['rating', 'summary', 'concerns'],
    },
    recommendations: {
      type: 'OBJECT',
      properties: {
        portions: { type: 'STRING' },
        avoid_or_limit: { type: 'ARRAY', items: { type: 'STRING' } },
        tips: { type: 'ARRAY', items: { type: 'STRING' } },
      },
      required: ['portions', 'avoid_or_limit', 'tips'],
    },
  },
  required: ['foods', 'nutrition', 'safety', 'recommendations'],
};

function buildUserText(profile: any): string {
  const conditions = (profile?.conditions ?? []).join(', ') || 'none reported';
  const allergies = (profile?.allergies ?? []).join(', ') || 'none reported';
  const restrictions = (profile?.restrictions ?? []).join(', ') || 'none reported';
  const notes = profile?.notes ? `\nAdditional notes: ${profile.notes}` : '';
  return `Analyze this meal for a user with the following health profile.\n` +
    `Medical conditions: ${conditions}\nAllergies: ${allergies}\n` +
    `Dietary restrictions: ${restrictions}${notes}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return json({ error: 'Unauthorized' }, 401);

    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64) return json({ error: 'Missing imageBase64' }, 400);

    const { data: profile } = await supabase
      .from('profiles').select('conditions, allergies, restrictions, notes')
      .eq('id', user.id).single();

    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{
        role: 'user',
        parts: [
          { inline_data: { mime_type: mediaType ?? 'image/jpeg', data: imageBase64 } },
          { text: buildUserText(profile) },
        ],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    // Try each model until one succeeds (skips models that are out of quota / unavailable).
    let aiData: any = null;
    let usedModel = '';
    let lastDetail = '';
    let lastStatus = 0;
    for (const m of MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'content-type': 'application/json' }, body }
      );
      if (res.ok) { aiData = await res.json(); usedModel = m; break; }
      lastStatus = res.status;
      lastDetail = await res.text();
      // 429 = quota exhausted, 404 = model not available for this key -> try next.
      // Any other error (400 bad key, etc.) -> stop and report.
      if (res.status !== 429 && res.status !== 404) break;
    }

    if (!aiData) {
      return json(
        { error: 'AI request failed', status: lastStatus, detail: lastDetail, triedModels: MODELS },
        502
      );
    }

    const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    let result: any;
    try { result = JSON.parse(cleaned); }
    catch { return json({ error: 'AI returned invalid JSON', raw: rawText }, 502); }
    return json({ result, model: usedModel }, 200);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
