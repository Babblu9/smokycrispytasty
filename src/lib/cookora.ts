// Decorative, STABLE rating/calorie values derived from a recipe id.
// Recipes carry no rating/calorie data — this keeps cards looking complete
// and consistent across renders. Not real nutrition.
function decor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  h = Math.abs(h);
  return {
    rating: Number((4.3 + (h % 7) / 10).toFixed(1)), // 4.3–4.9
    calories: 220 + (h % 9) * 50, // 220–620
  };
}

export const ratingFor = (id: string) => decor(id).rating;
export const caloriesFor = (id: string) => decor(id).calories;
