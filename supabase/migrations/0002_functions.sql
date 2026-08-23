-- ============================================================
-- SAFE ROUTE AI — 0002 functions, triggers, RPCs
-- ============================================================

-- ---------- updated_at auto-touch ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated  on public.profiles;
create trigger trg_profiles_updated  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_incidents_updated on public.incidents;
create trigger trg_incidents_updated before update on public.incidents
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_reports_updated   on public.community_reports;
create trigger trg_reports_updated   before update on public.community_reports
  for each row execute function public.touch_updated_at();

-- ---------- auto-create profile on signup ----------
-- Fires when Supabase Auth inserts into auth.users. Keeps profiles in sync
-- so the app never has to trust the client to create its own profile row.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- role helper (used by RLS) ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- haversine distance (metres) ----------
create or replace function public.haversine_m(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision language sql immutable as $$
  select 6371000 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- ---------- nearby incidents RPC ----------
-- Returns incidents within `radius_m` of a point, nearest first, with the
-- computed distance. Optional severity / type filters. Callable from the
-- backend via supabase.rpc('incidents_near', {...}).
create or replace function public.incidents_near(
  in_lat      double precision,
  in_lng      double precision,
  radius_m    double precision default 2000,
  in_severity text default null,
  in_type     text default null,
  only_active boolean default true
)
returns table (
  id uuid, type text, severity text, title text, description text,
  latitude double precision, longitude double precision, address text,
  occurred_at timestamptz, verified boolean, verification_status text,
  confidence double precision, is_demo boolean, distance_m double precision
)
language sql stable as $$
  select i.id, i.type, i.severity, i.title, i.description,
         i.latitude, i.longitude, i.address,
         i.occurred_at, i.verified, i.verification_status,
         i.confidence, i.is_demo,
         public.haversine_m(in_lat, in_lng, i.latitude, i.longitude) as distance_m
  from public.incidents i
  where public.haversine_m(in_lat, in_lng, i.latitude, i.longitude) <= radius_m
    and (in_severity is null or i.severity = in_severity)
    and (in_type     is null or i.type = in_type)
    and (not only_active or i.verification_status <> 'rejected')
  order by distance_m asc;
$$;
