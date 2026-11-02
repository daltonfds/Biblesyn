create table if not exists public.visitor_events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  session_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null default 'page_view'
    check (event_name in ('page_view','sign_up','login','checkout_click','subscription_success')),
  page_path text not null,
  page_title text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  region text,
  city text,
  device_type text check (device_type is null or device_type in ('mobile','tablet','desktop','other')),
  browser text,
  operating_system text,
  is_new_visitor boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists visitor_events_created_at_idx on public.visitor_events (created_at desc);
create index if not exists visitor_events_visitor_created_idx on public.visitor_events (visitor_id, created_at desc);
create index if not exists visitor_events_session_created_idx on public.visitor_events (session_id, created_at desc);
create index if not exists visitor_events_page_created_idx on public.visitor_events (page_path, created_at desc);
create index if not exists visitor_events_country_created_idx on public.visitor_events (country, created_at desc);

alter table public.visitor_events enable row level security;
revoke all on table public.visitor_events from anon, authenticated;
grant select, insert on table public.visitor_events to service_role;
grant usage, select on sequence public.visitor_events_id_seq to service_role;
