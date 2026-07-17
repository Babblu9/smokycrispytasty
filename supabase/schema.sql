-- Cookora schema — run once in Supabase → SQL Editor.
-- Safe to re-run (idempotent guards where practical).

-- ─── profiles ──────────────────────────────────────────────────────────
-- One row per auth user. Auto-created on signup by the trigger below.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
  on public.profiles for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── saved_recipes ─────────────────────────────────────────────────────
-- Per-user bookmarks. recipe_id is the app id ("mdb_52772" or "gen_...").
create table if not exists public.saved_recipes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  recipe_id    text not null,
  recipe_name  text,
  recipe_image text,
  created_at   timestamptz not null default now(),
  unique (user_id, recipe_id)
);

alter table public.saved_recipes enable row level security;

drop policy if exists "users read own saved" on public.saved_recipes;
create policy "users read own saved"
  on public.saved_recipes for select using (auth.uid() = user_id);

drop policy if exists "users insert own saved" on public.saved_recipes;
create policy "users insert own saved"
  on public.saved_recipes for insert with check (auth.uid() = user_id);

drop policy if exists "users delete own saved" on public.saved_recipes;
create policy "users delete own saved"
  on public.saved_recipes for delete using (auth.uid() = user_id);

-- ─── community_posts ───────────────────────────────────────────────────
create table if not exists public.community_posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  caption    text not null,
  image_url  text,
  likes      int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;

drop policy if exists "posts readable by everyone" on public.community_posts;
create policy "posts readable by everyone"
  on public.community_posts for select using (true);

drop policy if exists "users insert own posts" on public.community_posts;
create policy "users insert own posts"
  on public.community_posts for insert with check (auth.uid() = user_id);

drop policy if exists "users delete own posts" on public.community_posts;
create policy "users delete own posts"
  on public.community_posts for delete using (auth.uid() = user_id);
