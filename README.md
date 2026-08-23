# Safe Route AI
### *"Navigate Faster. Travel Safer."*

A full-stack safety-aware route planner for Delhi NCR: plan a route, score how
safe each option is using real incident data, and get the best **balance of
speed and safety** — not just the shortest path.

> ⚠️ **This ZIP is an EARLY SNAPSHOT — Phase 1 of 7.**
> Only the **database foundation** is built so far. There is **no runnable app
> in this snapshot yet** (no server code, no frontend code). See the status
> table below for exactly what exists. Nothing here is faked — empty means
> not-built-yet, not hidden.

---

## 📊 Build status (be honest with yourself before running anything)

The full project is planned in **7 phases**. This snapshot contains **Phase 1 only.**

| Phase | Scope | Status in this ZIP |
|------:|-------|--------------------|
| **1** | Repo scaffold, DB schema + migrations + RLS, seed data | ✅ **Built** (this snapshot) |
| 1 | Auth (signup / login / logout / session) | ⬜ Not built yet |
| 2 | OSRM routing, geocoding, Leaflet map, plan-a-route | ⬜ Not built yet |
| 3 | Safety scoring (pure math), incident lookup, recommendation | ⬜ Not built yet |
| 4 | Community reports + image upload + admin verify/reject | ⬜ Not built yet |
| 5 | Admin dashboard, charts, analytics | ⬜ Not built yet |
| 6 | OpenAI agents (news analysis, verification assist), logs | ⬜ Not built yet |
| 7 | Alerts, rerouting, SOS simulation, realtime | ⬜ Not built yet |

**What "Built" means for Phase 1:** the SQL that creates every table, security
policy, helper function, and demo data. You can run it against a real Supabase
project today and get a fully-populated, secured database. The app code that
*uses* that database comes in later phases.

---

## ✅ What's fully wired  /  🟡 stubbed  /  ⬜ missing

| Feature | State | Notes |
|---|---|---|
| PostgreSQL schema (12 tables) | ✅ Fully wired | `supabase/migrations/0001_schema.sql` |
| Row Level Security on all user tables | ✅ Fully wired | `0003_rls.sql` |
| DB functions (haversine, nearby-incident search, auto-profile) | ✅ Fully wired | `0002_functions.sql` |
| Seed data — 32 incidents, 10 reports, 10 news, 5 alerts, 3 routes | ✅ Fully wired | `supabase/seed.sql`, Delhi NCR, labelled DEMO |
| `.env.example` with every variable | ✅ Fully wired | root `.env.example` |
| Backend API (Express) | ⬜ Missing | folder `server/src/` is intentionally empty |
| Frontend (React + Vite) | ⬜ Missing | folder `client/src/` is intentionally empty |
| Auth flow | ⬜ Missing | DB trigger for auto-profile exists; UI/session does not |
| Routing / maps / scoring / AI / alerts / SOS | ⬜ Missing | Phases 2–7 |

---

## 📁 Folder map

```
safe-route-ai/
├─ README.md              ← you are here (project status + setup)
├─ SPEC.md                ← the original build brief / requirements
├─ .env.example           ← every env var, with "where to get this key" notes
├─ .gitignore
├─ supabase/              ← ✅ THE ONLY BUILT PART SO FAR
│  ├─ README.md           ← how to run the SQL, in order
│  ├─ migrations/
│  │  ├─ 0001_schema.sql       tables + indexes
│  │  ├─ 0002_functions.sql    triggers, is_admin, haversine, incidents_near
│  │  └─ 0003_rls.sql          Row Level Security policies
│  └─ seed.sql            Delhi NCR demo data (safe to re-run)
├─ server/src/            ⬜ empty — Express API goes here (Phase 2+)
└─ client/src/            ⬜ empty — React app goes here (Phase 2+)
```

---

## 🚀 How to use this snapshot (about 10 minutes)

You only need a free **Supabase** account for Phase 1. Nothing else.

1. **Create a Supabase project** at https://supabase.com (free tier is fine).
2. Open the project's **SQL Editor**.
3. Run these files **in this exact order** (copy-paste each, click Run):
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_functions.sql`
   3. `supabase/migrations/0003_rls.sql`
   4. `supabase/seed.sql`
4. Open the **Table Editor** → you should see 32 incidents, 10 reports, 10 news
   articles, etc., all clustered around Delhi / Noida / Ghaziabad / Gurugram and
   labelled `DEMO / SIMULATED SAFETY DATA`.
5. Copy `.env.example` → `.env` and fill in your Supabase URL + keys (see the
   comments in that file for where each value lives in the dashboard). You'll
   need this once the server/client phases land.

See `supabase/README.md` for details, including how to make yourself an admin.

> **Heads-up for later:** when you get to the auth phase, turn **"Confirm email"
> OFF** in Supabase → Authentication → Providers → Email, or signup→login will
> stall on a fresh project with no email server configured.

---

## 🔒 Security notes (already respected in the SQL)

- **Row Level Security** is on for every user table — the browser (anon key) can
  only ever touch its own rows.
- The **service-role key bypasses RLS** and is meant for the backend only. Never
  put `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` in any `VITE_*` variable or
  the frontend — they'd be exposed to the browser.
- Profiles are created by a **database trigger on signup**, so the client is
  never trusted to create its own profile row.

---

## 🗺️ Design decisions worth knowing

- **No PostGIS.** Distance/nearby-incident search uses a plain SQL `haversine_m`
  function + the `incidents_near()` RPC, so it runs on any Postgres.
- **Delhi NCR** is the pilot city. All seed rows are flagged `is_demo = true` and
  sourced as `DEMO / SIMULATED SAFETY DATA` so real and demo data never mix.
- **Demo-first.** The plan is that the whole app runs with **only Supabase**
  configured; OpenAI / NewsAPI / Mapbox keys are optional upgrades added later.

---

## ▶️ What comes next (Phases 2–7)

Nothing in Phases 2–7 is in this ZIP. The plan, in order:
Phase 2 routing+map → Phase 3 safety scoring → Phase 4 community reports →
Phase 5 admin dashboard → Phase 6 OpenAI agents → Phase 7 alerts/SOS/realtime.

Full requirements for all phases are in **`SPEC.md`**.
