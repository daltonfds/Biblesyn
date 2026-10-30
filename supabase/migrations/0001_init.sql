-- Biblesyn production schema. Content is intentionally empty until editorially reviewed material is published.
create extension if not exists pgcrypto;
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text, country text, locale text not null default 'en',
  is_premium boolean not null default false, stripe_customer_id text,
  created_at timestamptz not null default now()
);
create table public.articles (
  id uuid primary key default gen_random_uuid(), slug text not null, locale text not null default 'en',
  title text not null, topic text, excerpt text, audio_url text, read_minutes int not null default 8,
  is_free boolean not null default false, published boolean not null default false,
  created_at timestamptz not null default now(), unique (slug, locale)
);
create table public.article_bodies (
  article_id uuid primary key references public.articles on delete cascade, body text not null
);
create table public.study_plans (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  description text, days int not null check (days > 0), sort int not null default 0,
  published boolean not null default false
);
create table public.study_plan_days (
  id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.study_plans on delete cascade,
  day_number int not null check (day_number > 0), title text not null, passage text,
  body text, reflection text, prayer text, unique (plan_id, day_number)
);
create table public.plan_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  plan_id uuid not null references public.study_plans on delete cascade, day_number int not null,
  completed_at timestamptz not null default now(), primary key (user_id, plan_id, day_number)
);
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade,
  body text not null, verse_ref text, created_at timestamptz not null default now()
);
create table public.saved_articles (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  article_id uuid not null references public.articles on delete cascade, primary key (user_id, article_id)
);
create table public.devotions (
  day date primary key, verse_ref text not null, verse_text text not null, reflection text, prayer text
);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id); return new; end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.is_premium() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_premium from public.profiles where id = auth.uid()), false) $$;
revoke execute on function public.is_premium() from public, anon;
grant execute on function public.is_premium() to authenticated;

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.article_bodies enable row level security;
alter table public.study_plans enable row level security;
alter table public.study_plan_days enable row level security;
alter table public.plan_progress enable row level security;
alter table public.journal_entries enable row level security;
alter table public.saved_articles enable row level security;
alter table public.devotions enable row level security;

create policy "own profile read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id = (select auth.uid()));
revoke update on public.profiles from anon, authenticated;
grant update (display_name, country, locale) on public.profiles to authenticated;
create policy "articles public read" on public.articles for select to anon, authenticated using (published);
create policy "bodies: free for members, all for premium" on public.article_bodies for select to authenticated
  using (public.is_premium() or exists (select 1 from public.articles a where a.id = article_id and a.is_free and a.published));
create policy "plans public read" on public.study_plans for select to anon, authenticated using (published);
create policy "plan days: day 1 free for members" on public.study_plan_days for select to authenticated
  using (public.is_premium() or (day_number = 1 and exists (select 1 from public.study_plans p where p.id = plan_id and p.published)));
create policy "own progress" on public.plan_progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own journal" on public.journal_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own saved" on public.saved_articles for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "devotions public read" on public.devotions for select to anon, authenticated using (true);

create index plan_progress_plan_idx on public.plan_progress (plan_id);
create index journal_entries_user_created_idx on public.journal_entries (user_id, created_at desc);
create index study_plan_days_plan_idx on public.study_plan_days (plan_id);
create index saved_articles_article_idx on public.saved_articles (article_id);
