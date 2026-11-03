-- Country locale defaults used by middleware and the country-specific external checkout table.
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

commit;
