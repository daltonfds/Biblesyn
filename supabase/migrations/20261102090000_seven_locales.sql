-- Add the seven supported locale codes without duplicating localized content.
-- Existing Portuguese rows are re-keyed to pt-BR; pt-PT starts empty.
begin;

update public.languages
set code = 'pt-BR', name = 'Portuguese (Brazil)', native_name = 'Português (Brasil)', sort = 3
where code = 'pt';

insert into public.languages (code, name, native_name, active, is_default, sort)
values
  ('en-ZA', 'English (South Africa)', 'English (South Africa)', true, false, 2),
  ('pt-PT', 'Portuguese (Portugal)', 'Português (Portugal)', true, false, 4),
  ('it', 'Italian', 'Italiano', true, false, 7)
on conflict (code) do update set
  name = excluded.name,
  native_name = excluded.native_name,
  active = true;

update public.languages set name='English', native_name='English', is_default=true, sort=1 where code='en';
update public.languages set name='French', native_name='Français', sort=5 where code='fr';
update public.languages set name='Spanish', native_name='Español', sort=6 where code='es';

-- Profile locale is not guaranteed to have a foreign key in existing installations.
update public.profiles set locale='pt-BR' where locale='pt';

update public.countries set default_locale='pt-BR' where code='BR';
update public.countries set default_locale='pt-PT' where code in ('PT','AO','MZ','CV');
update public.countries set default_locale='fr' where code in ('FR','BE','CH','LU');
update public.countries set default_locale='es' where code in ('ES','MX','AR','CO','CL','PE');
update public.countries set default_locale='it' where code in ('IT','SM','VA');
update public.countries set default_locale='en-ZA' where code='ZA';
update public.countries set default_locale='en' where code in ('US','GB','CA','AU');

commit;
