-- Biblesyn schema, RLS and seed data
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text, country text, locale text not null default 'en',
  is_premium boolean not null default false, stripe_customer_id text,
  created_at timestamptz not null default now());
create table public.articles (
  id uuid primary key default gen_random_uuid(), slug text not null, locale text not null default 'en',
  title text not null, topic text, excerpt text, audio_url text, read_minutes int not null default 8,
  is_free boolean not null default false, published boolean not null default false,
  created_at timestamptz not null default now(), unique (slug, locale));
create table public.article_bodies (article_id uuid primary key references public.articles on delete cascade, body text not null);
create table public.study_plans (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, description text, days int not null, sort int not null default 0, published boolean not null default true);
create table public.study_plan_days (id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.study_plans on delete cascade, day_number int not null, title text not null, passage text, body text, reflection text, prayer text, unique (plan_id, day_number));
create table public.plan_progress (user_id uuid not null default auth.uid() references auth.users on delete cascade, plan_id uuid not null references public.study_plans on delete cascade, day_number int not null, completed_at timestamptz not null default now(), primary key (user_id, plan_id, day_number));
create table public.journal_entries (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, body text not null, verse_ref text, created_at timestamptz not null default now());
create table public.saved_articles (user_id uuid not null default auth.uid() references auth.users on delete cascade, article_id uuid not null references public.articles on delete cascade, primary key (user_id, article_id));
create table public.devotions (day date primary key, verse_ref text not null, verse_text text not null, reflection text, prayer text);
create table public.prices (country text primary key, currency text not null, amount_cents int not null check (amount_cents > 0), active boolean not null default true);

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
alter table public.prices enable row level security;

create policy "own profile read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id = (select auth.uid()));
revoke update on public.profiles from anon, authenticated;
grant update (display_name, country, locale) on public.profiles to authenticated;
create policy "articles public read" on public.articles for select to anon, authenticated using (published);
create policy "bodies: free for members, all for premium" on public.article_bodies for select to authenticated
  using (public.is_premium() or exists (select 1 from public.articles a where a.id = article_id and a.is_free and a.published));
create policy "plans public read" on public.study_plans for select to anon, authenticated using (published);
create policy "plan days: day 1 free for members" on public.study_plan_days for select to authenticated using (public.is_premium() or day_number = 1);
create policy "own progress" on public.plan_progress for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own journal" on public.journal_entries for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own saved" on public.saved_articles for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "devotions public read" on public.devotions for select to anon, authenticated using (true);
create policy "prices public read" on public.prices for select to anon, authenticated using (active);
create index on public.plan_progress (plan_id);
create index on public.journal_entries (user_id, created_at desc);
create index on public.study_plan_days (plan_id);
create index on public.saved_articles (article_id);

-- Seed. Amounts are in minor units; adjust to your pricing. Stripe supports the listed currencies.
insert into public.prices (country, currency, amount_cents) values
 ('*','USD',100),('US','USD',100),('PT','EUR',100),('ES','EUR',100),('FR','EUR',100),('BR','BRL',500),('GB','GBP',100),('ZA','ZAR',2000);
insert into public.study_plans (slug, title, description, days, sort) values
 ('21-days-of-daniel','21 Days of Daniel','Faith, prayer and courage under pressure.',21,1),
 ('30-days-of-prayer','30 Days of Prayer','Learn to pray from Scripture.',30,2),
 ('14-days-with-the-holy-spirit','14 Days with the Holy Spirit','Who the Spirit is and how He leads.',14,3),
 ('21-days-of-spiritual-warfare','21 Days of Spiritual Warfare','Standing firm in Christ.',21,4),
 ('7-days-to-strengthen-your-faith','7 Days to Strengthen Your Faith','A short week of foundations.',7,5);
insert into public.study_plan_days (plan_id, day_number, title, passage, body, reflection, prayer)
 select id, 1, 'Resolve in a foreign land', 'Daniel 1', 'Daniel is taken far from home, yet decides to stay faithful in small daily choices. Faith is often built in quiet decisions, not public moments.', 'Where is God asking you to stay faithful in a small thing today?', 'Lord, give me a steady heart and courage to honor You in the details. Amen.'
 from public.study_plans where slug = '21-days-of-daniel';
insert into public.devotions (day, verse_ref, verse_text, reflection, prayer) values
 (current_date, 'Psalm 46:10', 'Be still, and know that I am God.', 'Stillness is not the absence of action. It is trusting that God is already at work.', 'Father, quiet my mind and teach me to rest in You. Amen.');
with a as (insert into public.articles (slug, title, topic, excerpt, read_minutes, is_free, published) values
 ('why-does-god-remain-silent','Why Does God Remain Silent?','Prayer',E'Every believer meets seasons when heaven seems quiet. Scripture does not hide this experience. It gives it voice.',9,true,true),
 ('how-to-recognize-gods-voice','How to Recognize God''s Voice','Guidance','Discernment grows through Scripture, prayer and community. Here is how to test what you are hearing.',10,false,true) returning id, slug)
insert into public.article_bodies (article_id, body) select id, case slug
 when 'why-does-god-remain-silent' then E'Introduction\n\nEvery believer meets seasons when heaven seems quiet. Scripture does not hide this experience. It gives it voice (Psalm 22:1-2; Habakkuk 1:2).\n\nBiblical foundations\n\nThe psalmists and prophets bring their questions to God honestly. Silence in the Bible is never presented as abandonment: God''s promises remain (Hebrews 13:5).\n\nPractical application\n\nKeep praying, keep reading, and stay in community. Writing your questions down can turn silence into a conversation.\n\nClosing prayer\n\nLord, teach me to trust You when I cannot hear You. Amen.'
 else E'Introduction\n\nDiscernment grows through Scripture, prayer and community (John 10:27).\n\nBiblical foundations\n\nTest every impression against Scripture (1 John 4:1). God''s voice never contradicts His Word.\n\nPractical application\n\nSlow down, pray, ask trusted believers, and wait for peace that fits what the Bible teaches.\n\nClosing prayer\n\nFather, make me attentive to Your voice. Amen.' end from a;
