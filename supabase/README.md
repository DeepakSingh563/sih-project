# Database setup

Run these **in order** in the Supabase SQL editor (or via `supabase db push`):

1. `migrations/0001_schema.sql` — tables + indexes
2. `migrations/0002_functions.sql` — triggers, `handle_new_user`, `is_admin`, `haversine_m`, `incidents_near` RPC
3. `migrations/0003_rls.sql` — Row Level Security policies
4. `seed.sql` — Delhi NCR demo data (safe to re-run; clears its own demo rows first)

## Notes
- **No PostGIS needed** — nearby-incident search uses the `incidents_near(lat,lng,radius_m,...)` SQL function.
- **Profiles auto-create** on signup via the `on_auth_user_created` trigger — the client never inserts its own profile.
- **Make yourself an admin** after signing up:
  ```sql
  update public.profiles set role = 'admin' where email = 'you@example.com';
  ```
- **RLS trust model:** the browser (anon key) is fully governed by policies; the backend (service-role key) bypasses RLS and enforces its own authorization in middleware.
- Storage: create a public bucket named `report-images` for community-report photo uploads (Phase 6 wires this up).
