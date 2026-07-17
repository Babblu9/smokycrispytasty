import { getMealsByCategory, searchMeals } from '@/lib/mealdb';
import { ratingFor, caloriesFor } from '@/lib/cookora';
import type { MealSummary } from '@/lib/mealdb';

// Shape matches <RecipeCard> props verbatim (+ id for navigation), so App.tsx can spread it.
export type Card = {
  id: string;
  img: string;
  title: string;
  time: string;
  rating: number;
  calories: string;
  category: string;
};

// The UI's category pills don't match MealDB's categories 1:1. Map the closest.
// ponytail: MealDB has no Lunch/Dinner/Healthy — approximate. Swap categories if it matters.
const CAT_MAP: Record<string, string> = {
  All: 'Chicken',
  Breakfast: 'Breakfast',
  Lunch: 'Pasta',
  Dinner: 'Beef',
  Desserts: 'Dessert',
  Healthy: 'Vegetarian',
  Veg: 'Vegetarian',
  'Non-Veg': 'Chicken',
  Seafood: 'Seafood',
};

function toCard(m: MealSummary, categoryLabel: string): Card {
  const id = `mdb_${m.idMeal}`;
  return {
    id,
    img: m.strMealThumb,
    title: m.strMeal,
    time: '30 min', // MealDB gives no time; placeholder
    rating: ratingFor(id),
    calories: String(caloriesFor(id)),
    category: categoryLabel,
  };
}

export async function loadRecipes(uiCat: string): Promise<Card[]> {
  const meals = await getMealsByCategory(CAT_MAP[uiCat] ?? 'Chicken');
  return meals.slice(0, 12).map((m) => toCard(m, uiCat === 'All' ? 'Recipe' : uiCat));
}

export async function searchRecipes(query: string): Promise<Card[]> {
  const meals = await searchMeals(query);
  return meals.slice(0, 12).map((m) => toCard(m, 'Recipe'));
}
