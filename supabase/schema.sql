-- RKEB ENSA Carpool — schema v1
-- À exécuter UNE FOIS dans Supabase : SQL Editor → New query → coller → Run.
-- Puis exécuter seed.sql.

-- ============ TABLES ============

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  cne text,
  card_photo_url text,
  role text not null default 'passager' check (role in ('passager', 'conducteur', 'admin')),
  vehicle text check (vehicle in ('Voiture', 'Moto')),
  rating_avg numeric not null default 0,
  verified boolean not null default false,
  filiere text,
  created_at timestamptz not null default now(),
  constraint email_ensa check (
    email ilike '%@etu.uae.ac.ma'
    or email ilike '%@uae.ac.ma'
    or lower(email) = 'yvnnsart@gmail.com' -- exception test (compte admin)
  )
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references profiles (id) on delete set null,
  driver_name text not null, -- nom d'affichage (listes publiques sans exposer les profils)
  from_quarter text not null,
  pickups jsonb not null default '[]',
  departure_date date not null,
  departure_time time not null,
  arrival_time time,
  slot text not null check (slot in ('Matin', 'Soir')),
  vehicle text not null check (vehicle in ('Voiture', 'Moto')),
  car text,
  plate text,
  ambiance text check (ambiance in ('Musique', 'Silence', 'Discussion')),
  seats_total int not null check (seats_total between 1 and 8),
  seats_left int not null check (seats_left >= 0),
  price int not null default 5,
  recurring boolean not null default false,
  last_minute boolean not null default false,
  status text not null default 'ouvert' check (status in ('ouvert', 'complet', 'annulé', 'terminé')),
  created_at timestamptz not null default now(),
  constraint trips_no_doublon unique (driver_name, departure_date, departure_time)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips (id) on delete cascade,
  passenger_id uuid not null references profiles (id) on delete cascade,
  pickup text not null,
  pay text not null default 'wallet' check (pay in ('wallet', 'points', 'cotisation')),
  status text not null default 'confirmé' check (status in ('confirmé', 'terminé', 'annulé')),
  created_at timestamptz not null default now(),
  unique (trip_id, passenger_id)
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  label text not null,
  amount int not null, -- négatif = débit, positif = crédit
  kind text not null check (kind in ('trajet', 'remboursement', 'recharge', 'cotisation')),
  created_at timestamptz not null default now()
);

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references profiles (id) on delete cascade,
  to_id uuid not null references profiles (id) on delete cascade,
  trip_id uuid references trips (id) on delete set null,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips (id) on delete cascade,
  sender_id uuid not null references profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists recharge_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  amount int not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ============ STOCKAGE PHOTOS CARTES ============

insert into storage.buckets (id, name, public)
values ('card-photos', 'card-photos', false)
on conflict (id) do nothing;

-- ============ CRÉATION AUTO DU PROFIL À L'INSCRIPTION ============
-- Supabase n'écrit rien dans profiles quand un compte est créé : ce trigger s'en charge.
-- Le rôle est borné à passager/conducteur : impossible de s'inscrire admin (voir lock_privilege_fields).
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

-- ============ RLS ============

alter table profiles enable row level security;
alter table trips enable row level security;
alter table bookings enable row level security;
alter table wallet_transactions enable row level security;
alter table ratings enable row level security;
alter table messages enable row level security;
alter table recharge_requests enable row level security;

-- Rôle admin lu sans récursion RLS
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Personne ne s'auto-promut admin / ne se fait vérifier seul
create or replace function public.lock_privilege_fields()
returns trigger language plpgsql as $$
begin
  if (old.verified is distinct from new.verified or old.role is distinct from new.role)
     and not public.is_admin() then
    raise exception 'seul un admin peut modifier verified / role';
  end if;
  return new;
end $$;

drop trigger if exists trg_lock_privilege on profiles;
create trigger trg_lock_privilege before update on profiles
for each row execute function public.lock_privilege_fields();

-- profiles : lecture connectée, écriture proprio (champs sensibles gardés par le trigger)
create policy "profiles read authenticated" on profiles for select to authenticated using (true);
create policy "profiles insert own" on profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on profiles for update to authenticated using (id = auth.uid());
create policy "profiles admin all" on profiles for all to authenticated using (public.is_admin());

-- trips : listing public (comme la démo), écriture conducteur proprio
create policy "trips read public" on trips for select to anon, authenticated using (true);
create policy "trips insert driver" on trips for insert to authenticated with check (driver_id = auth.uid());
create policy "trips update driver" on trips for update to authenticated using (driver_id = auth.uid());
create policy "trips admin all" on trips for all to authenticated using (public.is_admin());

-- bookings : passager voit les siennes, conducteur celles de ses trajets
create policy "bookings read own" on bookings for select to authenticated using (
  passenger_id = auth.uid()
  or exists (select 1 from trips where trips.id = bookings.trip_id and trips.driver_id = auth.uid())
);
create policy "bookings insert own" on bookings for insert to authenticated with check (passenger_id = auth.uid());
create policy "bookings update own" on bookings for update to authenticated using (
  passenger_id = auth.uid()
  or exists (select 1 from trips where trips.id = bookings.trip_id and trips.driver_id = auth.uid())
);
create policy "bookings admin all" on bookings for all to authenticated using (public.is_admin());

-- wallet : chacun le sien (+ admin)
create policy "wallet read own" on wallet_transactions for select to authenticated using (user_id = auth.uid());
create policy "wallet insert own" on wallet_transactions for insert to authenticated with check (user_id = auth.uid());
create policy "wallet admin all" on wallet_transactions for all to authenticated using (public.is_admin());
-- NOTE Phase 3.x : déplacer débits/crédits dans un trigger Postgres sur bookings (ledger serviable).

-- ratings : lecture publique (affichés sur les fiches trajets), écriture auteur
create policy "ratings read public" on ratings for select to anon, authenticated using (true);
create policy "ratings insert own" on ratings for insert to authenticated with check (from_id = auth.uid());
create policy "ratings admin all" on ratings for all to authenticated using (public.is_admin());

-- messages : participants du trajet uniquement
create policy "messages read participants" on messages for select to authenticated using (
  sender_id = auth.uid()
  or exists (select 1 from bookings where bookings.trip_id = messages.trip_id and bookings.passenger_id = auth.uid())
  or exists (select 1 from trips where trips.id = messages.trip_id and trips.driver_id = auth.uid())
);
create policy "messages insert own" on messages for insert to authenticated with check (sender_id = auth.uid());

-- recharges : les siennes + admin
create policy "recharges read own" on recharge_requests for select to authenticated using (user_id = auth.uid());
create policy "recharges insert own" on recharge_requests for insert to authenticated with check (user_id = auth.uid());
create policy "recharges admin all" on recharge_requests for all to authenticated using (public.is_admin());

-- storage card-photos : chacun son dossier, lecture admin
create policy "card-photos insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'card-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "card-photos read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'card-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
