-- ============================================================================
--  Nutrivue database schema
--  Run this in the Supabase dashboard:  SQL Editor -> New query -> paste -> Run
--  It creates the tables, storage bucket, and Row-Level-Security (RLS) rules
--  that guarantee every user can ONLY read/write their own rows.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES  (one permanent health profile per user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  conditions   text[] not null default '{}',
  allergies    text[] not null default '{}',
  restrictions text[] not null default '{}',
  notes        text,
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can only see and edit the row whose id == their auth id.
create policy "profiles: owner can read"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles: owner can insert"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: owner can update"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create an empty profile row the moment a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. MEALS  (history of AI meal analyses)
-- ---------------------------------------------------------------------------
create table if not exists public.meals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  image_url  text,
  result     jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists meals_user_created_idx
  on public.meals (user_id, created_at desc);

alter table public.meals enable row level security;

create policy "meals: owner can read"
  on public.meals for select using (auth.uid() = user_id);
create policy "meals: owner can insert"
  on public.meals for insert with check (auth.uid() = user_id);
create policy "meals: owner can delete"
  on public.meals for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. REMINDERS  (medication + hydration; alarms fire locally on the device)
-- ---------------------------------------------------------------------------
create table if not exists public.reminders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  type             text not null check (type in ('medication', 'hydration')),
  title            text not null,
  time             text,
  interval_hours   int,
  days_of_week     int[],
  enabled          boolean not null default true,
  notification_ids text[] not null default '{}',
  created_at       timestamptz not null default now()
);

create index if not exists reminders_user_idx on public.reminders (user_id);

alter table public.reminders enable row level security;

create policy "reminders: owner can read"
  on public.reminders for select using (auth.uid() = user_id);
create policy "reminders: owner can insert"
  on public.reminders for insert with check (auth.uid() = user_id);
create policy "reminders: owner can update"
  on public.reminders for update using (auth.uid() = user_id);
create policy "reminders: owner can delete"
  on public.reminders for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. STORAGE  (private bucket for meal photos)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

-- Users can only touch files inside a folder named after their own user id,
-- e.g.  meal-photos/<uid>/<filename>.jpg
create policy "meal-photos: owner can read"
  on storage.objects for select
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "meal-photos: owner can upload"
  on storage.objects for insert
  with check (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "meal-photos: owner can delete"
  on storage.objects for delete
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
