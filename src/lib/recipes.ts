import { supabase } from '@/lib/supabase';
import { ratingFor, caloriesFor } from '@/lib/cookora';
import type { Recipe } from '@/types';

// Shape matches <RecipeCard> props verbatim (+ id), so App.tsx can spread it.
export type Card = {
  id: string;
  img: string;
  title: string;
  time: string;
  rating: number;
  calories: string;
  category: string;
};

type Row = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  prep_minutes: number;
  cook_minutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: { instruction: string; durationSeconds?: number; tip?: string }[];
};

function rowToCard(r: Row): Card {
  return {
    id: r.id,
    img: r.image_url ?? '',
    title: r.name,
    time: `${r.cook_minutes} min`,
    rating: ratingFor(r.id),
    calories: String(caloriesFor(r.id)),
    category: r.category ?? 'Signature',
  };
}

export function rowToRecipe(r: Row): Recipe {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    category: r.category ?? 'Signature',
    prepTimeMinutes: r.prep_minutes,
    cookTimeMinutes: r.cook_minutes,
    servings: r.servings,
    difficulty: r.difficulty,
    image: r.image_url ?? undefined,
    ingredients: r.ingredients ?? [],
    steps: (r.steps ?? []).map((s, i) => ({ id: `step_${i + 1}`, instruction: s.instruction, durationSeconds: s.durationSeconds ?? 0, tip: s.tip })),
  };
}

// Category pills are loose labels; "All" returns everything, otherwise fuzzy-match category.
export async function loadRecipes(uiCat: string): Promise<Card[]> {
  let q = supabase.from('recipes').select('*').order('created_at', { ascending: false });
  if (uiCat && uiCat !== 'All') q = q.ilike('category', `%${uiCat}%`);
  const { data } = await q;
  return (data as Row[] | null ?? []).map(rowToCard);
}

export async function searchRecipes(query: string): Promise<Card[]> {
  const { data } = await supabase.from('recipes').select('*').ilike('name', `%${query}%`).order('created_at', { ascending: false });
  return (data as Row[] | null ?? []).map(rowToCard);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle();
  return data ? rowToRecipe(data as Row) : null;
}
