-- Run this in Supabase SQL Editor before testing the app.
-- Roles live in auth.users.app_metadata: { "role": "rep" | "boss" }.

create table if not exists public.sr_visits (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references auth.users(id) on delete cascade,
  rep_name text not null,
  visit_date date not null default current_date,
  hotel_name text not null,
  contact_name text,
  contact_phone text,
  activity text not null,
  progress text not null check (progress in ('跟进中', '已成交', '新线索', '暂无意向')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.sr_visits enable row level security;

-- A sales rep can only see and write rows that belong to their auth account.
create policy "reps read own visits" on public.sr_visits for select to authenticated using (rep_id = auth.uid());
create policy "reps create own visits" on public.sr_visits for insert to authenticated with check (rep_id = auth.uid());

-- Bosses can review every record. The role must be set server-side, never by the app.
create policy "bosses read all visits" on public.sr_visits for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'boss');

create index if not exists sr_visits_rep_date_idx on public.sr_visits (rep_id, visit_date desc);
create index if not exists sr_visits_date_idx on public.sr_visits (visit_date desc);

-- Example: set roles for existing accounts (run with your own user IDs).
-- update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"boss"}'::jsonb where email = 'admin1@jhdf.internal';
