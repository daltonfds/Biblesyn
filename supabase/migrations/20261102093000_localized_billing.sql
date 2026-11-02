-- Locale-aware country defaults and Stripe prices.
-- The amounts below reuse the existing EUR/USD/ZAR seed price points; Brazil remains on EscalePay.
begin;

insert into public.countries (code, name, default_locale) values
  ('LU','Luxembourg','fr'),
  ('IT','Italy','it'),
  ('SM','San Marino','it'),
  ('VA','Vatican City','it')
on conflict (code) do update set default_locale = excluded.default_locale;

update public.countries set default_locale='pt-BR' where code='BR';
update public.countries set default_locale='pt-PT' where code in ('PT','AO','MZ','CV');
update public.countries set default_locale='fr' where code in ('FR','BE','CH','LU');
update public.countries set default_locale='es' where code in ('ES','MX','AR','CO','CL','PE');
update public.countries set default_locale='it' where code in ('IT','SM','VA');
update public.countries set default_locale='en-ZA' where code='ZA';
update public.countries set default_locale='en' where code in ('US','GB','CA','AU');

insert into public.prices (country, currency, amount_cents, active) values
  ('US','USD',100,true),('GB','USD',100,true),('CA','USD',100,true),('AU','USD',100,true),
  ('PT','EUR',100,true),('FR','EUR',100,true),('BE','EUR',100,true),('CH','EUR',100,true),('LU','EUR',100,true),
  ('ES','EUR',100,true),('IT','EUR',100,true),('SM','EUR',100,true),('VA','EUR',100,true),
  ('ZA','ZAR',2000,true)
on conflict (country) do update set currency=excluded.currency, amount_cents=excluded.amount_cents, active=true;

commit;
