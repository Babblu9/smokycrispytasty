import { Recipe, Ingredient, CookStep } from '@/types';

const BASE = 'https://www.themealdb.com/api/json/v1/1';

// ─── Raw API types ────────────────────────────────────────────────────────────

export type MealSummary = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

export type MealCategory = {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
};

type RawMeal = Record<string, string | null>;

// ─── API calls ────────────────────────────────────────────────────────────────

export async function searchMeals(query: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getCategories(): Promise<MealCategory[]> {
  const res = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories ?? [];
}

export async function getMealsByCategory(category: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getMealById(id: string): Promise<Recipe | null> {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  if (!data.meals?.[0]) return null;
  return mealDbToRecipe(data.meals[0] as RawMeal);
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

export function mealDbToRecipe(meal: RawMeal): Recipe {
  return {
    id: `mdb_${meal.idMeal}`,
    name: meal.strMeal ?? 'Unknown',
    description: meal.strCategory
      ? `A ${meal.strArea ?? ''} ${meal.strCategory} dish.`.trim()
      : '',
    category: meal.strCategory ?? 'Other',
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    servings: 4,
    difficulty: 'Medium',
    image: meal.strMealThumb ?? undefined,
    ingredients: extractIngredients(meal),
    steps: parseInstructionsToSteps(meal.strInstructions ?? ''),
  };
}

function extractIngredients(meal: RawMeal): Ingredient[] {
  const result: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();
    if (!name) break;
    // Split measure into quantity and unit: "3/4 cup" → { quantity: "3/4", unit: "cup" }
    const parts = (measure ?? '').split(' ');
    result.push({
      name,
      quantity: parts[0] || 'as needed',
      unit: parts.slice(1).join(' '),
    });
  }
  return result;
}

export function parseInstructionsToSteps(instructions: string): CookStep[] {
  if (!instructions.trim()) return [];

  // Split by line breaks and numbered step patterns
  const lines = instructions
    .split(/\r\n|\n|\r/)
    .map((l) => l.replace(/^\s*\d+[\.\)]\s*/, '').trim())
    .filter((l) => l.length > 8);

  if (lines.length === 0) {
    // Fallback: split by sentences
    return instructions
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8)
      .map((s, i) => ({ id: `step_${i + 1}`, instruction: s, durationSeconds: 0 }));
  }

  return lines.map((line, i) => ({
    id: `step_${i + 1}`,
    instruction: line,
    durationSeconds: 0,
  }));
}
