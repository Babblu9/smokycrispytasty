// Cookora data layer — live MealDB adapters + static community/AI seed.
import type { Recipe } from '@/types';
import type { MealSummary } from '@/lib/mealdb';

/** Minimal shape the recipe cards render. */
export interface CardRecipe {
  id: string;
  name: string;
  image: string;
  caption: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  calories: number;
}

// ponytail: MealDB has no rating/calories. Derive a STABLE decorative value from
// the id so cards look complete and don't flicker between renders. Not real nutrition.
function decor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  h = Math.abs(h);
  return {
    rating: Number((4.3 + (h % 7) / 10).toFixed(1)), // 4.3–4.9
    calories: 220 + (h % 9) * 50, // 220–620
  };
}

/** MealDB list item → card (no full recipe fetched yet). */
export function summaryToCard(m: MealSummary, category = ''): CardRecipe {
  const { rating, calories } = decor(m.idMeal);
  return {
    id: `mdb_${m.idMeal}`,
    name: m.strMeal,
    image: m.strMealThumb,
    caption: category || 'Tap to view recipe',
    time: '30 min',
    difficulty: 'Medium',
    rating,
    calories,
  };
}

/** Full MealDB recipe → card. */
export function recipeToCard(r: Recipe): CardRecipe {
  const { rating, calories } = decor(r.id);
  return {
    id: r.id,
    name: r.name,
    image: r.image ?? '',
    caption: r.description || r.category,
    time: `${r.cookTimeMinutes} min`,
    difficulty: r.difficulty,
    rating,
    calories,
  };
}

/** Strip the `mdb_` prefix back to a raw MealDB id for lookup. */
export const rawMealId = (id: string) => id.replace(/^mdb_/, '');

export const ratingFor = (id: string) => decor(id).rating;
export const caloriesFor = (id: string) => decor(id).calories;

// ─── Static seed (community feed + AI demo) ──────────────────────────────────

export const COMMUNITY_POSTS = [
  { id: 1, user: 'Priya K.', handle: '@priya_cooks', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format', time: '2h', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=360&fit=crop&auto=format', caption: 'Sunday butter chicken came out PERFECT with Cookora AI! 🔥 The step-by-step timer is a total game changer.', likes: 234, comments: 18 },
  { id: 2, user: 'Rahul M.', handle: '@rahul_foodie', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format', time: '5h', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=360&fit=crop&auto=format', caption: 'Went from ordering every day to cooking healthy bowls! Cookora changed my life 💚 #HealthyEating', likes: 187, comments: 24 },
  { id: 3, user: 'Ananya S.', handle: '@ananya.eats', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format', time: '8h', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=360&fit=crop&auto=format', caption: 'First homemade pizza and it was BETTER than the restaurant! My family was shocked 🍕✨ #HomeCook', likes: 312, comments: 45 },
];
