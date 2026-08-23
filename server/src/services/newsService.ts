import { env, isNewsApiConfigured } from "../config/env";

export interface RawNewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string | null;
  publishedAt: string | null;
  content: string | null;
}

const SAFETY_KEYWORDS = [
  "crime",
  "robbery",
  "harassment",
  "violence",
  "protest",
  "road closure",
  "accident",
  "security",
];

/**
 * Fetches recent safety-relevant articles for the pilot city from NewsAPI.
 * Returns [] (never throws) when NEWS_API_KEY is absent — callers should
 * treat that as "use the seeded DEMO NEWS DATA already in the DB" per
 * SPEC.md #9, not as an error.
 */
export async function fetchLatestSafetyNews(
  city: string = env.PILOT_CITY
): Promise<RawNewsArticle[]> {
  if (!isNewsApiConfigured) return [];

  const query = `(${SAFETY_KEYWORDS.join(" OR ")}) AND ${city.split(" ")[0]}`;
  const url =
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}` +
    `&language=en&sortBy=publishedAt&pageSize=20&apiKey=${env.NEWS_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[newsService] NewsAPI responded ${res.status}`);
      return [];
    }
    const body: any = await res.json();
    if (body.status !== "ok" || !Array.isArray(body.articles)) return [];
    return body.articles
      .filter((a: any) => a.title && a.url)
      .map((a: any) => ({
        title: a.title,
        description: a.description || null,
        url: a.url,
        source: a.source?.name || null,
        publishedAt: a.publishedAt || null,
        content: a.content || null,
      }));
  } catch (err) {
    console.error("[newsService] fetch failed:", err);
    return [];
  }
}

export function containsSafetyKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return SAFETY_KEYWORDS.some((k) => lower.includes(k));
}

export { SAFETY_KEYWORDS };
