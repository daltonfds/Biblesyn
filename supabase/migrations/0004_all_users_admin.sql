-- Biblesyn 0004: grant admin access to every account except the protected address.
-- New accounts receive the same role automatically; the exception is always kept as a regular user.
begin;

update public.profiles p
set email = u.email,
    role = case
      when lower(coalesce(u.email, p.email, '')) = 'ninguemeusou211@gmail.com' then 'user'
      else 'admin'
    end
from auth.users u
where u.id = p.id;

-- Keep the protected account non-admin even if its profile email was already populated.
update public.profiles
set role = 'user'
where lower(coalesce(email, '')) = 'ninguemeusou211@gmail.com';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, country, locale, role)
  values (
    new.id,
    new.email,
    nullif(upper(left(new.raw_user_meta_data->>'country', 2)), ''),
    coalesce(
      (select code from public.languages
       where code = new.raw_user_meta_data->>'locale' and active),
      'en'
    ),
    case
      when lower(coalesce(new.email, '')) = 'ninguemeusou211@gmail.com' then 'user'
      else 'admin'
    end
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

commit;
