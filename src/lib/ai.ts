import type { Recipe, CookStep } from '@/types';

// Client-side wrappers over the /api/ai serverless proxy (NVIDIA NIM / glm-5.2).
// Signatures are LLM-agnostic, so callers don't care which model runs behind it.
async function call<T>(action: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...args }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error);
  }
  return res.json();
}

export const generateRecipe = (input: string, mode: 'dish' | 'ingredients', langName?: string) =>
  call<Recipe>('generate', { input, mode, langName });

export const structureRecipeSteps = (recipeName: string, instructions: string) =>
  call<{ steps: CookStep[] }>('structure', { recipeName, instructions }).then((r) => r.steps);

export const translateRecipe = (recipe: Recipe, langName: string) =>
  call<Recipe>('translate', { recipe, langName });
