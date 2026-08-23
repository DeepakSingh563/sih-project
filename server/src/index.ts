import express from "express";
import cors from "cors";
import { env, isSupabaseConfigured, isOpenAIConfigured, isNewsApiConfigured } from "./config/env";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    demoMode: env.DEMO_MODE,
    supabaseConfigured: isSupabaseConfigured,
    openaiConfigured: isOpenAIConfigured,
    newsApiConfigured: isNewsApiConfigured,
    pilotCity: env.PILOT_CITY,
  });
});

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`SafeRoute AI server listening on :${env.PORT}`);
  if (!isSupabaseConfigured) {
    console.warn("⚠️  Supabase not configured — most routes will fail until .env is set up.");
  }
  if (!isOpenAIConfigured) {
    console.warn("ℹ️  OPENAI_API_KEY not set — AI agents will run in rule-based-only mode.");
  }
  if (!isNewsApiConfigured) {
    console.warn("ℹ️  NEWS_API_KEY not set — news ingestion will rely on seeded demo articles.");
  }
});
