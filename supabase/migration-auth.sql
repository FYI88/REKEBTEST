-- RKEB — migration Phase 3.2 (auth)
-- À exécuter UNE FOIS dans SQL Editor sur une base déjà créée par schema.sql.
-- (schema.sql contient déjà ces changements pour une base neuve.)

-- 1) Autoriser l'email admin de test (exception à la règle @etu.uae.ac.ma / @uae.ac.ma)
alter table profiles drop constraint if exists email_ensa;
alter table profiles add constraint email_ensa check (
  email ilike '%@etu.uae.ac.ma'
  or email ilike '%@uae.ac.ma'
  or lower(email) = 'yvnnsart@gmail.com'
);

-- 2) Créer automatiquement le profil à l'inscription d'un compte
--    (rôle borné à passager/conducteur : impossible de s'inscrire admin)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role text := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'passager');
begin
  if v_role not in ('passager', 'conducteur') then
    v_role := 'passager';
  end if;
  insert into public.profiles (id, full_name, email, role, cne, filiere)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    v_role,
    nullif(new.raw_user_meta_data->>'cne', ''),
    nullif(new.raw_user_meta_data->>'filiere', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
