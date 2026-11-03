begin;

alter table public.profiles drop constraint if exists profiles_premium_source_check;
update public.profiles set is_premium = false, premium_source = null where premium_source is not null and premium_source not in ('escalepay','manual','admin');
alter table public.profiles drop column if exists stripe_customer_id;
alter table public.profiles add column if not exists premium_expires_at timestamptz;
alter table public.profiles add column if not exists premium_country text;
alter table public.profiles add column if not exists premium_currency text;
alter table public.profiles add column if not exists premium_provider text;
alter table public.profiles add column if not exists premium_order_id text;
alter table public.profiles add column if not exists premium_status text;
drop table if exists public.prices cascade;
create or replace function public.is_premium() returns boolean language sql stable security definer set search_path = public as $
  select coalesce((select is_premium and not suspended and (premium_expires_at is null or premium_expires_at > now()) from public.profiles where id = auth.uid()), false) $;
revoke execute on function public.is_premium() from public, anon;
grant execute on function public.is_premium() to authenticated;

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
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_order_id text not null,
  user_id uuid references public.profiles(id) on delete set null,
  country text,
  currency text,
  amount_cents bigint,
  status text not null default 'paid',
  refunded boolean not null default false,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);
alter table public.payment_transactions enable row level security;
revoke all on table public.payment_transactions from anon, authenticated;
grant select, insert, update on table public.payment_transactions to service_role;
create index if not exists payment_transactions_user_idx on public.payment_transactions(user_id);
create index if not exists payment_transactions_paid_idx on public.payment_transactions(paid_at desc);

create index if not exists payment_webhook_events_order_idx on public.payment_webhook_events(provider, order_id);
create index if not exists payment_webhook_events_created_idx on public.payment_webhook_events(created_at desc);
alter table public.payment_webhook_events enable row level security;
revoke all on table public.payment_webhook_events from anon, authenticated;
grant select, insert, update on table public.payment_webhook_events to service_role;

commit;
