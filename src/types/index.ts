export type CookStep = {
  id: string;
  instruction: string;
  durationSeconds: number; // 0 means no timer for this step
  tip?: string;
};

export type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  category: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image?: string;
  ingredients: Ingredient[];
  steps: CookStep[];
};
