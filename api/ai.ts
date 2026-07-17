import OpenAI from 'openai';
import type { Recipe, CookStep } from '../src/types';

// Server-side LLM proxy. Key lives here, never in the client bundle.
// Backend: NVIDIA NIM (OpenAI-compatible), model z-ai/glm-5.2.
// Vercel serverless function: POST /api/ai { action, ...args }
const API_KEY = process.env.NVIDIA_API_KEY ?? '';
// Fast + reliable on NVIDIA NIM (~1-2s). Qwen instruct options here were slow/flaky.
const MODEL = 'meta/llama-3.1-8b-instruct';

const client = new OpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: API_KEY,
  timeout: 60_000, // glm-5.2 is a slow reasoning model; fail cleanly instead of hanging the request
  maxRetries: 1,
});

const stripFences = (t: string) =>
  t
    .replace(/<think>[\s\S]*?<\/think>/gi, '') // drop any reasoning block a Qwen model might emit
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

// The model must return raw JSON only — enforced in the system role, not buried in the user text.
const JSON_SYSTEM =
  'You are a professional cooking assistant. You reply with ONLY valid JSON that matches the ' +
  'structure the user specifies — no markdown, no code fences, no commentary. Just the raw JSON.';

async function chat(system: string, user: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.7,
    top_p: 1,
    max_tokens: 8192,
  });
  return stripFences(res.choices[0]?.message?.content ?? '');
}

const RECIPE_USER = (input: string, mode: 'dish' | 'ingredients', langName?: string) => `
${
  mode === 'ingredients'
    ? `The user has these ingredients at home: "${input}". Create a practical recipe using some or all of them.`
    : `The user wants to cook: "${input}". Generate a full recipe for this dish.`
}
${langName && langName !== 'English' ? `Write ALL text fields (name, description, category, ingredients, instructions, tips) in ${langName}.` : ''}

Return a JSON object with exactly this structure:
{
  "id": "<unique string>",
  "name": "<recipe name>",
  "description": "<1-2 sentence description>",
  "category": "<category like Indian, Italian, Breakfast, etc.>",
  "prepTimeMinutes": <number>,
  "cookTimeMinutes": <number>,
  "servings": <number>,
  "difficulty": "<Easy | Medium | Hard>",
  "ingredients": [ { "name": "<ingredient>", "quantity": "<amount>", "unit": "<unit or empty string>" } ],
  "steps": [ { "id": "step_1", "instruction": "<single clear action>", "durationSeconds": <0 or seconds>, "tip": "<optional>" } ]
}

Rules:
- Each step is ONE clear action.
- durationSeconds reflects realistic time (boiling water = 300, frying = 180); chopping/mixing = 0.
- 5-10 steps minimum; add tips for tricky steps.
`;

const STRUCTURE_USER = (name: string, instructions: string) => `
Convert these recipe instructions for "${name}" into a structured JSON array of steps.

Raw instructions:
"""
${instructions}
"""

Return ONLY a JSON array. Each element:
{ "id": "step_1", "instruction": "<single clear action>", "durationSeconds": <0 or seconds>, "tip": "<optional, omit if not needed>" }

Rules:
- Break compound steps into individual actions.
- durationSeconds: boiling = 300-600, simmering = 600-1200, frying/sauteing = 120-300, baking = 1200-3600, chopping/mixing = 0.
- Add tips only where genuinely useful.
`;

const TRANSLATE_USER = (recipe: Recipe, langName: string) => `
Translate the following recipe JSON from English to ${langName}.

Rules:
- Translate ALL text fields: name, description, category, ingredient names, step instructions, tips.
- PRESERVE all numeric values exactly: prepTimeMinutes, cookTimeMinutes, servings, durationSeconds.
- PRESERVE the "id" field exactly.
- PRESERVE the "difficulty" field exactly (keep English: Easy / Medium / Hard).
- If durationSeconds is 0, estimate a realistic duration (boiling=300, simmering=600, frying=180, chopping=0).
- Return ONLY valid JSON in the same structure.

Input recipe:
${JSON.stringify(recipe)}
`;

async function generateRecipe(input: string, mode: 'dish' | 'ingredients', langName?: string): Promise<Recipe> {
  const recipe: Recipe = JSON.parse(await chat(JSON_SYSTEM, RECIPE_USER(input, mode, langName)));
  recipe.id = `gen_${Date.now()}`;
  return recipe;
}

async function structureRecipeSteps(recipeName: string, instructions: string): Promise<CookStep[]> {
  try {
    const steps: CookStep[] = JSON.parse(await chat(JSON_SYSTEM, STRUCTURE_USER(recipeName, instructions)));
    return steps.map((s, i) => ({ ...s, id: `step_${i + 1}` }));
  } catch {
    return [];
  }
}

async function translateRecipe(recipe: Recipe, langName: string): Promise<Recipe> {
  try {
    const t: Recipe = JSON.parse(await chat(JSON_SYSTEM, TRANSLATE_USER(recipe, langName)));
    t.steps = t.steps.map((s, i) => ({ ...s, id: `step_${i + 1}` }));
    return t;
  } catch {
    return recipe;
  }
}

// ponytail: one endpoint, action-dispatched. Split into separate files only if they diverge.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!API_KEY) return res.status(500).json({ error: 'NVIDIA_API_KEY not set on server' });

  const { action, ...args } = req.body ?? {};
  try {
    switch (action) {
      case 'generate':
        return res.json(await generateRecipe(args.input, args.mode, args.langName));
      case 'structure':
        return res.json({ steps: await structureRecipeSteps(args.recipeName, args.instructions) });
      case 'translate':
        return res.json(await translateRecipe(args.recipe, args.langName));
      default:
        return res.status(400).json({ error: `unknown action: ${action}` });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'LLM request failed' });
  }
}
