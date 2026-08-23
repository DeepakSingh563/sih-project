-- ============================================================
-- SAFE ROUTE AI — 0003 Row Level Security
--
-- Trust model:
--  * The browser uses the ANON key and is fully governed by these policies.
--  * The backend uses the SERVICE ROLE key, which BYPASSES RLS — it is the
--    trusted actor and does its own authorization (see server/middleware).
--  * auth.uid() is the caller's verified user id from their JWT.
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.incidents         enable row level security;
alter table public.community_reports enable row level security;
alter table public.routes            enable row level security;
alter table public.route_options     enable row level security;
alter table public.alerts            enable row level security;
alter table public.sos_events        enable row level security;
alter table public.news_articles     enable row level security;
alter table public.ai_agent_logs     enable row level security;
alter table public.safety_scores     enable row level security;
alter table public.user_preferences  enable row level security;

-- ---------- profiles ----------
drop policy if exists profiles_self_read   on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_read  on public.profiles;
create policy profiles_self_read   on public.profiles for select using (id = auth.uid());
create policy profiles_self_update on public.profiles for update using (id = auth.uid());
create policy profiles_admin_read  on public.profiles for select using (public.is_admin());

-- ---------- incidents ----------
-- Everyone signed in may read incidents (the map needs them). Only admins write.
drop policy if exists incidents_read        on public.incidents;
drop policy if exists incidents_admin_write on public.incidents;
create policy incidents_read        on public.incidents for select using (auth.role() = 'authenticated');
create policy incidents_admin_write on public.incidents for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- community_reports ----------
drop policy if exists reports_owner_read  on public.community_reports;
drop policy if exists reports_owner_write on public.community_reports;
drop policy if exists reports_admin_all   on public.community_reports;
create policy reports_owner_read  on public.community_reports for select using (user_id = auth.uid());
create policy reports_owner_write on public.community_reports for insert with check (user_id = auth.uid());
create policy reports_admin_all   on public.community_reports for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- routes / route_options / safety_scores ----------
drop policy if exists routes_owner on public.routes;
create policy routes_owner on public.routes for select using (user_id = auth.uid());

drop policy if exists route_options_owner on public.route_options;
create policy route_options_owner on public.route_options for select
  using (exists (select 1 from public.routes r where r.id = route_id and r.user_id = auth.uid()));

drop policy if exists safety_scores_owner on public.safety_scores;
create policy safety_scores_owner on public.safety_scores for select
  using (exists (
    select 1 from public.route_options o
    join public.routes r on r.id = o.route_id
    where o.id = route_option_id and r.user_id = auth.uid()
  ));

-- ---------- alerts ----------
drop policy if exists alerts_owner_read   on public.alerts;
drop policy if exists alerts_owner_update on public.alerts;
create policy alerts_owner_read   on public.alerts for select using (user_id = auth.uid());
create policy alerts_owner_update on public.alerts for update using (user_id = auth.uid());

-- ---------- sos_events ----------
drop policy if exists sos_owner on public.sos_events;
create policy sos_owner on public.sos_events for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- user_preferences ----------
drop policy if exists prefs_owner on public.user_preferences;
create policy prefs_owner on public.user_preferences for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- news_articles ----------
-- Read-only for signed-in users; backend (service role) writes.
drop policy if exists news_read on public.news_articles;
create policy news_read on public.news_articles for select using (auth.role() = 'authenticated');

-- ---------- ai_agent_logs ----------
-- Admin-only visibility (AI operations dashboard).
drop policy if exists ai_logs_admin on public.ai_agent_logs;
create policy ai_logs_admin on public.ai_agent_logs for select using (public.is_admin());
