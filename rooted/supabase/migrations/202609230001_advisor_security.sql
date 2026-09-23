-- Apply to the existing project after a database backup. Legacy tables stay
-- accessible to server-side service role code only; never to public clients.
alter table if exists public.leads enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.ingredients enable row level security;
alter table if exists public.product_ingredients enable row level security;
alter table if exists public.user_hair_profiles enable row level security;
alter table if exists public.assessments enable row level security;
revoke all on public.leads, public.products, public.ingredients, public.product_ingredients, public.user_hair_profiles, public.assessments from anon, authenticated;

create table if not exists public.advisor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  version text not null,
  answers jsonb not null,
  recommendations jsonb not null
);
create index if not exists advisor_profiles_user_created_idx on public.advisor_profiles(user_id, created_at desc);
alter table public.advisor_profiles enable row level security;
revoke all on public.advisor_profiles from anon, authenticated;
grant select, insert, delete on public.advisor_profiles to authenticated;
create policy "read own advisor profiles" on public.advisor_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own advisor profiles" on public.advisor_profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "delete own advisor profiles" on public.advisor_profiles for delete to authenticated using (user_id = (select auth.uid()));
