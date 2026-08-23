import dotenv from "dotenv";
dotenv.config();

function bool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  return v.toLowerCase() === "true";
}

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  DEMO_MODE: bool(process.env.DEMO_MODE, true),

  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",

  OSRM_BASE_URL: process.env.OSRM_BASE_URL || "https://router.project-osrm.org",

  GEOCODING_PROVIDER: (process.env.GEOCODING_PROVIDER || "internal") as
    | "mapbox"
    | "google"
    | "internal",
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || "",
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",

  NEWS_API_KEY: process.env.NEWS_API_KEY || "",

  PILOT_CITY: process.env.PILOT_CITY || "Delhi NCR",
  PILOT_LAT: parseFloat(process.env.PILOT_LAT || "28.6139"),
  PILOT_LNG: parseFloat(process.env.PILOT_LNG || "77.2090"),
};

export const isSupabaseConfigured = Boolean(
  env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
);
export const isOpenAIConfigured = Boolean(env.OPENAI_API_KEY);
export const isNewsApiConfigured = Boolean(env.NEWS_API_KEY);
