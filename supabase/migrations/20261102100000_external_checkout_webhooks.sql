begin;

alter table public.profiles drop constraint if exists profiles_premium_source_check;
update public.profiles set is_premium = false, premium_source = null where premium_source = 'stripe';
alter table public.profiles drop column if exists stripe_customer_id;
alter table public.profiles add column if not exists premium_expires_at timestamptz;
alter table public.profiles add column if not exists premium_country text;
alter table public.profiles add column if not exists premium_currency text;
alter table public.profiles add column if not exists premium_provider text;
alter table public.profiles add column if not exists premium_order_id text;
alter table public.profiles add column if not exists premium_status text;
alter table public.profiles add constraint profiles_premium_source_check
  check (premium_source is null or premium_source in ('escalepay','manual','admin'));

drop table if exists public.subscriptions cascade;
drop table if exists public.payments cascade;

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_hash text not null,
  event_type text not null,
  order_id text,
  user_id uuid references auth.users(id) on delete set null,
  payload jsonb not null,
  processing_status text not null default 'received'
    check (processing_status in ('received','processed','ignored','failed')),
  processing_error text,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id),
  unique (provider, event_hash)
);
create index if not exists payment_webhook_events_order_idx on public.payment_webhook_events(provider, order_id);
create index if not exists payment_webhook_events_created_idx on public.payment_webhook_events(created_at desc);
alter table public.payment_webhook_events enable row level security;
revoke all on table public.payment_webhook_events from anon, authenticated;
grant select, insert, update on table public.payment_webhook_events to service_role;

commit;
