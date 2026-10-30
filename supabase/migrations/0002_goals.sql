create table public.goals (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, body text not null, done boolean not null default false, created_at timestamptz not null default now());
alter table public.goals enable row level security;
create policy "own goals" on public.goals for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index on public.goals (user_id, created_at desc);
