# Cookora

AI-powered cooking website. Figma Make frontend (Vite + React + Tailwind + shadcn/ui) wired to a live backend:

- **Recipes / search / detail** → [TheMealDB](https://www.themealdb.com) (public, no key)
- **AI Chef** → NVIDIA NIM (`z-ai/glm-5.2`, OpenAI-compatible), called through a **server-side proxy** (`api/ai.ts`) so the key never ships to the browser
- **Saved recipes** → `localStorage`

## Setup

```bash
npm install
cp .env.example .env   # then put your key in NVIDIA_API_KEY
```

## Run

```bash
npm run dev      # Vite only — UI + MealDB work; AI Chef will NOT (no /api runtime)
npx vercel dev   # full stack — runs the /api/gemini function too, so AI Chef works
```

Plain `vite` doesn't execute serverless functions. Use `vercel dev` locally to test AI Chef.

## Deploy (Vercel)

Auto-detected as Vite. Set `NVIDIA_API_KEY` in the Vercel project's Environment Variables. `api/*.ts` deploys as a Node serverless function automatically.

## Layout

```
api/ai.ts            server-side LLM proxy — NVIDIA glm-5.2 (holds the key)
src/app/App.tsx      all pages (page-state routing)
src/lib/             mealdb, LLM client (ai.ts), recipes, cookora transforms
src/store/           saved bookmarks + generated-recipe cache (localStorage)
src/types/           Recipe / Ingredient / CookStep
reference/           old Stitch HTML screens (guided-cook flow, not yet built)
```
