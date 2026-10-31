-- Biblesyn 0003: languages, countries, per-language content, UI strings, roles, subscriptions, payments.
-- Removes the sample content seeded in 0001: all content is now managed by admins in /admin.
delete from public.article_bodies; delete from public.articles; delete from public.study_plan_days; delete from public.study_plans; delete from public.devotions;

create table public.languages (code text primary key, name text not null, native_name text, active boolean not null default true, is_default boolean not null default false, sort int not null default 0);
create unique index one_default_language on public.languages (is_default) where is_default;
create table public.countries (code text primary key, name text not null, default_locale text references public.languages(code) on update cascade on delete set null, active boolean not null default true);
create table public.ui_strings (key text not null, locale text not null references public.languages(code) on update cascade on delete cascade, value text not null, primary key (key, locale));
create table public.topics (id uuid primary key default gen_random_uuid(), slug text unique not null, sort int not null default 0);
create table public.topic_names (topic_id uuid not null references public.topics on delete cascade, locale text not null references public.languages(code) on update cascade on delete cascade, name text not null, primary key (topic_id, locale));
insert into public.languages (code, name, native_name, is_default, sort) values ('en','English','English',true,1),('pt','Portuguese','Português',false,2),('fr','French','Français',false,3),('es','Spanish','Español',false,4);
insert into public.countries (code, name, default_locale) values ('PT','Portugal','pt'),('BR','Brazil','pt'),('MZ','Mozambique','pt'),('AO','Angola','pt'),('CV','Cape Verde','pt'),('ZA','South Africa','en'),('US','United States','en'),('GB','United Kingdom','en'),('CA','Canada','en'),('AU','Australia','en'),('NG','Nigeria','en'),('KE','Kenya','en'),('FR','France','fr'),('BE','Belgium','fr'),('CH','Switzerland','fr'),('ES','Spain','es'),('MX','Mexico','es'),('AR','Argentina','es'),('CO','Colombia','es'),('CL','Chile','es');

alter table public.profiles add column email text, add column role text not null default 'user' check (role in ('user','editor','admin')), add column suspended boolean not null default false,
  add column font_family text not null default 'serif' check (font_family in ('serif','sans','classic')), add column font_size int not null default 19 check (font_size between 15 and 28),
  add column premium_source text check (premium_source in ('stripe','admin'));
update public.profiles p set email = u.email from auth.users u where u.id = p.id;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, country, locale) values (new.id, new.email, nullif(upper(left(new.raw_user_meta_data->>'country', 2)), ''),
    coalesce((select code from public.languages where code = new.raw_user_meta_data->>'locale' and active), 'en'));
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create or replace function public.is_premium() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_premium and not suspended from public.profiles where id = auth.uid()), false) $$;
revoke update on public.profiles from anon, authenticated;
grant update (display_name, country, locale, font_family, font_size) on public.profiles to authenticated;

alter table public.articles add column group_id uuid not null default gen_random_uuid(), add column topic_id uuid references public.topics on delete set null, add column cover_url text;
alter table public.articles drop column topic;
alter table public.articles add constraint articles_group_locale unique (group_id, locale), add constraint articles_locale_fk foreign key (locale) references public.languages(code) on update cascade;
alter table public.study_plans add column locale text not null default 'en' references public.languages(code) on update cascade, add column group_id uuid not null default gen_random_uuid();
alter table public.study_plans drop constraint study_plans_slug_key;
alter table public.study_plans add constraint study_plans_slug_locale unique (slug, locale), add constraint study_plans_group_locale unique (group_id, locale);
alter table public.devotions add column locale text not null default 'en' references public.languages(code) on update cascade;
alter table public.devotions drop constraint devotions_pkey; alter table public.devotions add primary key (day, locale);

create table public.subscriptions (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, stripe_subscription_id text unique not null, stripe_customer_id text,
  status text not null, currency text, amount_cents int, country text, current_period_end timestamptz, cancel_at_period_end boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.payments (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete set null, stripe_invoice_id text unique not null, currency text not null, amount_cents int not null, country text, paid_at timestamptz not null default now(), refunded boolean not null default false);

alter table public.languages enable row level security; alter table public.countries enable row level security; alter table public.ui_strings enable row level security;
alter table public.topics enable row level security; alter table public.topic_names enable row level security; alter table public.subscriptions enable row level security; alter table public.payments enable row level security;
create policy "languages read" on public.languages for select to anon, authenticated using (active);
create policy "countries read" on public.countries for select to anon, authenticated using (active);
create policy "strings read" on public.ui_strings for select to anon, authenticated using (true);
create policy "topics read" on public.topics for select to anon, authenticated using (true);
create policy "topic names read" on public.topic_names for select to anon, authenticated using (true);
create policy "own subscriptions" on public.subscriptions for select to authenticated using (user_id = (select auth.uid()));
create index on public.subscriptions (user_id); create index on public.payments (user_id); create index on public.payments (paid_at); create index on public.topic_names (locale); create index on public.ui_strings (locale);
create index on public.articles (topic_id); create index on public.profiles (country); create index on public.profiles (role);
