-- Private signature recipes + admin flag + single-device tracking.
-- Run once in Supabase → SQL Editor (after schema.sql).

-- Admin flag + current device on profiles.
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists current_device text;

-- ─── recipes (private, curated) ────────────────────────────────────────
create table if not exists public.recipes (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text default '',
  category      text default 'Signature',
  image_url     text,
  prep_minutes  int not null default 10,
  cook_minutes  int not null default 20,
  servings      int not null default 4,
  difficulty    text not null default 'Medium' check (difficulty in ('Easy','Medium','Hard')),
  ingredients   jsonb not null default '[]'::jsonb,  -- [{name, quantity, unit}]
  steps         jsonb not null default '[]'::jsonb,  -- [{instruction, durationSeconds, tip}]
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table public.recipes enable row level security;

-- Login-gated: only authenticated users can read recipes.
drop policy if exists "recipes readable by authenticated" on public.recipes;
create policy "recipes readable by authenticated"
  on public.recipes for select
  to authenticated using (true);

-- Only admins can add/edit/delete.
drop policy if exists "admins insert recipes" on public.recipes;
create policy "admins insert recipes"
  on public.recipes for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admins update recipes" on public.recipes;
create policy "admins update recipes"
  on public.recipes for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "admins delete recipes" on public.recipes;
create policy "admins delete recipes"
  on public.recipes for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ─── seed (remove later; here so the app isn't empty before you add your own) ──
insert into public.recipes (name, description, category, image_url, prep_minutes, cook_minutes, servings, difficulty, ingredients, steps)
select
  'Signature Garlic Butter Prawns',
  'Juicy prawns tossed in a rich garlic butter sauce — a house favourite.',
  'Seafood',
  'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=800&h=600&fit=crop',
  10, 12, 4, 'Easy',
  '[{"name":"Prawns","quantity":"500","unit":"g"},{"name":"Butter","quantity":"3","unit":"tbsp"},{"name":"Garlic","quantity":"6","unit":"cloves"},{"name":"Chilli flakes","quantity":"1","unit":"tsp"},{"name":"Lemon","quantity":"1","unit":""},{"name":"Parsley","quantity":"2","unit":"tbsp"}]'::jsonb,
  '[{"instruction":"Peel and devein the prawns, pat dry.","durationSeconds":0},{"instruction":"Melt butter in a pan over medium heat.","durationSeconds":60},{"instruction":"Add minced garlic and saute until fragrant.","durationSeconds":90,"tip":"Do not let the garlic brown or it turns bitter."},{"instruction":"Add prawns and cook until pink, turning once.","durationSeconds":180},{"instruction":"Add chilli flakes, lemon juice and parsley, toss.","durationSeconds":30},{"instruction":"Serve hot.","durationSeconds":0}]'::jsonb
where not exists (select 1 from public.recipes where name = 'Signature Garlic Butter Prawns');

insert into public.recipes (name, description, category, image_url, prep_minutes, cook_minutes, servings, difficulty, ingredients, steps)
select
  'House Paneer Butter Masala',
  'Creamy tomato-based paneer curry, mildly spiced.',
  'Vegetarian',
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop',
  15, 25, 4, 'Medium',
  '[{"name":"Paneer","quantity":"400","unit":"g"},{"name":"Tomatoes","quantity":"4","unit":""},{"name":"Onion","quantity":"1","unit":""},{"name":"Cream","quantity":"100","unit":"ml"},{"name":"Butter","quantity":"2","unit":"tbsp"},{"name":"Garam masala","quantity":"1","unit":"tsp"}]'::jsonb,
  '[{"instruction":"Blanch and blend the tomatoes into a smooth puree.","durationSeconds":120},{"instruction":"Saute chopped onion in butter until soft.","durationSeconds":180},{"instruction":"Add tomato puree and simmer.","durationSeconds":600,"tip":"Simmer until the raw smell goes and oil separates."},{"instruction":"Stir in garam masala and cream.","durationSeconds":60},{"instruction":"Add paneer cubes and simmer gently.","durationSeconds":300},{"instruction":"Garnish and serve with naan or rice.","durationSeconds":0}]'::jsonb
where not exists (select 1 from public.recipes where name = 'House Paneer Butter Masala');
