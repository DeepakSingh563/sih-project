-- ============================================================
-- SAFE ROUTE AI — 0001 schema
-- Core tables. Run this first (Supabase SQL editor or `supabase db push`).
-- No PostGIS required: geo distance is done with a haversine SQL function
-- defined in 0003_functions.sql.
-- ============================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ---------- profiles ----------
-- 1:1 with auth.users. Auto-populated by handle_new_user() trigger (0003).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  role        text not null default 'user' check (role in ('user','admin')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- incidents ----------
-- Canonical safety events (from news ingestion, verified reports, or admins).
create table if not exists public.incidents (
  id                  uuid primary key default gen_random_uuid(),
  type                text not null,
  severity            text not null check (severity in ('low','medium','high','critical')),
  title               text,
  description         text,
  latitude            double precision not null,
  longitude           double precision not null,
  address             text,
  occurred_at         timestamptz,
  reported_at         timestamptz not null default now(),
  source              text,
  source_url          text,
  verified            boolean not null default false,
  verification_status text default 'pending' check (verification_status in ('pending','verified','rejected')),
  confidence          double precision not null default 0,
  is_demo             boolean not null default false,   -- flags seeded / simulated rows
  created_by          uuid references public.profiles (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists incidents_lat_lng_idx     on public.incidents (latitude, longitude);
create index if not exists incidents_severity_idx    on public.incidents (severity);
create index if not exists incidents_type_idx        on public.incidents (type);
create index if not exists incidents_occurred_at_idx on public.incidents (occurred_at);

-- ---------- community_reports ----------
create table if not exists public.community_reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles (id) on delete set null,
  incident_type text not null,
  description   text,
  severity      text check (severity in ('low','medium','high','critical')),
  latitude      double precision not null,
  longitude     double precision not null,
  address       text,
  image_url     text,
  status        text not null default 'pending' check (status in ('pending','verified','rejected')),
  confidence    double precision not null default 0,
  duplicate_of  uuid references public.community_reports (id) on delete set null,
  is_demo       boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists reports_user_idx   on public.community_reports (user_id);
create index if not exists reports_status_idx on public.community_reports (status);

-- ---------- routes ----------
create table if not exists public.routes (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references public.profiles (id) on delete cascade,
  origin_lat           double precision,
  origin_lng           double precision,
  destination_lat      double precision,
  destination_lng      double precision,
  origin_address       text,
  destination_address  text,
  selected_route_index integer,
  created_at           timestamptz not null default now()
);
create index if not exists routes_user_idx on public.routes (user_id);

-- ---------- route_options ----------
create table if not exists public.route_options (
  id               uuid primary key default gen_random_uuid(),
  route_id         uuid references public.routes (id) on delete cascade,
  route_index      integer,
  distance_meters  double precision,
  duration_seconds double precision,
  safety_score     double precision,
  risk_level       text,
  geometry         jsonb,
  risk_reasons     jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists route_options_route_idx on public.route_options (route_id);

-- ---------- alerts ----------
create table if not exists public.alerts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.profiles (id) on delete cascade,
  incident_id        uuid references public.incidents (id) on delete set null,
  route_id           uuid references public.routes (id) on delete set null,
  title              text,
  message            text,
  severity           text,
  latitude           double precision,
  longitude          double precision,
  distance_from_user double precision,
  is_read            boolean not null default false,
  created_at         timestamptz not null default now()
);
create index if not exists alerts_user_idx on public.alerts (user_id, is_read);

-- ---------- sos_events ----------
create table if not exists public.sos_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles (id) on delete cascade,
  latitude     double precision,
  longitude    double precision,
  status       text not null default 'active' check (status in ('active','cancelled','resolved')),
  activated_at timestamptz not null default now(),
  cancelled_at timestamptz
);
create index if not exists sos_user_idx on public.sos_events (user_id);

-- ---------- news_articles ----------
create table if not exists public.news_articles (
  id           uuid primary key default gen_random_uuid(),
  title        text,
  description  text,
  url          text unique,
  source       text,
  published_at timestamptz,
  content      text,
  processed    boolean not null default false,
  is_demo      boolean not null default false,
  ai_analysis  jsonb,
  created_at   timestamptz not null default now()
);

-- ---------- ai_agent_logs ----------
create table if not exists public.ai_agent_logs (
  id                uuid primary key default gen_random_uuid(),
  agent_name        text,
  operation         text,
  input             jsonb,
  output            jsonb,
  status            text,
  execution_time_ms integer,
  created_at        timestamptz not null default now()
);
create index if not exists ai_logs_agent_idx on public.ai_agent_logs (agent_name, created_at desc);

-- ---------- safety_scores ----------
create table if not exists public.safety_scores (
  id              uuid primary key default gen_random_uuid(),
  route_option_id uuid references public.route_options (id) on delete cascade,
  score           double precision,
  crime_risk      double precision,
  severity_risk   double precision,
  recency_risk    double precision,
  time_risk       double precision,
  community_risk  double precision,
  reasons         jsonb,
  created_at      timestamptz not null default now()
);

-- ---------- user_preferences ----------
create table if not exists public.user_preferences (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.profiles (id) on delete cascade unique,
  preferred_route_mode text not null default 'balanced' check (preferred_route_mode in ('fastest','shortest','safest','balanced')),
  night_travel        boolean not null default false,
  alert_radius_km     double precision not null default 2,
  created_at          timestamptz not null default now()
);
