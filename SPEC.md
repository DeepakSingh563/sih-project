# Safe Route AI — Build Specification
### *"Navigate Faster. Travel Safer."*

> This is the original build brief for the project. It describes the **complete
> intended product** (all 7 phases). The current ZIP snapshot implements
> **Phase 1 only** — see `README.md` for the live status table.

This is a **complete working full-stack prototype**, not a UI-only mockup.
Every important button must actually work — no fake buttons that only change the
UI.

---

## Required capabilities (full product)

Frontend · Backend · PostgreSQL database · Authentication · Real API
integrations · AI API integration · Route API integration · Geocoding ·
Incident database · Community reports · Safety scoring · AI agents · Alerts ·
Rerouting · SOS simulation · Admin dashboard · Analytics · API error handling ·
Environment variables · Database migrations/SQL · Seed data.

---

## 1. Technology stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Leaflet,
  React-Leaflet, Lucide React, Recharts
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime where useful
- **AI:** OpenAI API
- **Routing:** OSRM
- **Geocoding:** configurable provider abstraction (Mapbox → Google → self-hosted
  fallback). **Do not** build autocomplete against public Nominatim.
- **Maps:** Leaflet + OpenStreetMap-compatible tiles (provider configurable)

---

## 2. Environment variables

Provided in `.env.example`. Never hardcode keys. Never expose
`OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the frontend.

---

## 3. Database (Supabase PostgreSQL)

Tables: `profiles`, `incidents`, `community_reports`, `routes`, `route_options`,
`alerts`, `sos_events`, `news_articles`, `ai_agent_logs`, `safety_scores`,
`user_preferences`. (Full column lists implemented in
`supabase/migrations/0001_schema.sql`.)

## 4. Database security
Row Level Security on all user tables. Users read/update their own data; admins
read incidents, verify/reject reports, manage alerts, view analytics. Never
expose the service-role key to the client.

## 5. Authentication
Sign up, login, logout, forgot password, session persistence via Supabase Auth.
Create a profile row after signup. Email/password required; Google OAuth optional.

## 6. Backend API endpoints
`POST /api/routes/plan`, `GET /api/routes/:id`, `POST /api/safety-score`,
`GET /api/incidents`, `POST /api/incidents` (admin), `POST /api/reports`,
`GET /api/reports` (admin), `POST /api/reports/:id/verify` (admin),
`POST /api/reports/:id/reject` (admin), `POST /api/analyze-news`, `GET /api/news`,
`GET /api/alerts`, `POST /api/alerts`, `POST /api/sos`, `POST /api/sos/:id/cancel`,
`GET /api/dashboard/stats`, `GET /api/ai/logs` (admin).

## 7. Routing (OSRM)
`GET {OSRM_BASE_URL}/route/v1/driving/{lon1},{lat1};{lon2},{lat2}` with
`alternatives=true&steps=true&geometries=geojson&overview=full`. Do not fabricate
distance/duration when routing succeeds. On failure, return a meaningful error;
demo mode may use seeded fallback routes.

## 8. Geocoding
`geocodeAddress()` / `reverseGeocode()` behind a provider abstraction switchable
via `GEOCODING_PROVIDER`. Cache results. No public-Nominatim autocomplete.

## 9. News
`newsService.ts` using `NEWS_API_KEY`; fetch crime/robbery/harassment/violence/
protest/road-closure/accident/security articles; city-specific; store in
`news_articles`, dedupe by URL, process only new. No key → seeded demo news
labelled **DEMO NEWS DATA**.

## 10–16. AI agents (OpenAI)
`ingestionAgent`, `verificationAgent`, `newsAnalysisAgent`, `riskScoringAgent`,
`routePlanningAgent`, `alertAgent`, `orchestratorAgent`. Structured JSON output
with schema validation; rule-based fallback when AI fails; log every important
run to `ai_agent_logs`. Use rules first, AI only when useful — do not blindly
trust AI.

**Risk scoring:** base 100; subtract by severity (critical 30 / high 20 /
medium 10 / low 5) with distance decay + recency + time-of-day weighting;
`score = max(0, 100 - totalRisk)`. Levels: 80–100 LOW, 60–79 MODERATE,
40–59 ELEVATED, 20–39 HIGH, 0–19 CRITICAL. Return reasons.

**Route planning:** `combined = 0.50*safety + 0.30*time + 0.20*distance`. Don't
just pick the shortest route; return `recommendedRoute`, `reason`, `tradeoff`.

## 17–18. Alerts & rerouting
Poll browser Geolocation while navigating; if a high/critical incident is within
the configured radius, create an alert (View Details / Reroute / Dismiss).
Reroute keeps the destination, recomputes routes + safety, shows a safer option.

## 19. Community reporting
Report form (type, severity, description, location, optional image → Supabase
Storage). Run ingestion + verification (rules first) and update scoring. Show
"Report submitted · Status: Pending verification".

## 20. SOS (simulation only)
On click: get GPS, create `sos_events`, show emergency screen with coordinates +
timer, **simulate** notifying contacts, allow cancellation. **Never** claim real
emergency services were contacted. Label: *"Prototype SOS — notification
simulation"*.

## 21–22. Dashboards
Admin dashboard (cards + charts + incident map + filters) and AI operations
dashboard showing **real** `ai_agent_logs` execution times — not faked.

## 23. Realtime
Use Supabase Realtime where useful: admin verifies a report → user/admin views
update without manual refresh.

## 24–25. Security & API error handling
Auth, authorization, RLS, input validation, rate limiting, CORS, secure env vars.
Every external call: try/catch, timeout, status validation, fallback, logging.
Never crash the whole app. Take the user ID from the server-side session.

## 26. Demo mode
`DEMO_MODE=true` still uses the real frontend/backend/Supabase/routing when
available; only unavailable external services fall back to controlled demo data.
Seed ≥30 incidents, 10 reports, 10 news, 5 alerts, multiple routes, clustered on
one pilot city, clearly labelled **"DEMO / SIMULATED SAFETY DATA"**.

## 27. Pilot city
**Delhi NCR** — Delhi, Noida, Ghaziabad, Gurugram. All seeded incidents clearly
labelled.
```
