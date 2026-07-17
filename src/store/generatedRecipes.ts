import type { Recipe } from '@/types';

const STORAGE_KEY = '@sous_chef/recipes';

// ponytail: localStorage is synchronous + browser-only. Guard for SSR/build.
// Functions stay async to match the old AsyncStorage API so callers don't change.
const store = typeof window !== 'undefined' ? window.localStorage : null;

const cache = new Map<string, Recipe>();
if (store) {
  try {
    const json = store.getItem(STORAGE_KEY);
    if (json) (JSON.parse(json) as Recipe[]).forEach((r) => cache.set(r.id, r));
  } catch {/* start empty if read/parse fails */}
}

function persist(): void {
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(Array.from(cache.values())));
  } catch {/* quota or private-mode; drop silently */}
}

export async function saveGeneratedRecipe(recipe: Recipe): Promise<void> {
  cache.set(recipe.id, recipe);
  persist();
}

export async function getGeneratedRecipe(id: string): Promise<Recipe | undefined> {
  return cache.get(id);
}

export async function getAllSavedRecipes(): Promise<Recipe[]> {
  return Array.from(cache.values()).reverse();
}
