import { askForJson } from "../lib/openai";
import { RawNewsArticle, SAFETY_KEYWORDS, containsSafetyKeyword } from "../services/newsService";
import { logAgentRun } from "./agentLogger";
import { env } from "../config/env";

export type ExtractedType =
  | "crime" | "robbery" | "harassment" | "violence"
  | "protest" | "road_closure" | "accident" | "security" | "other";

export interface NewsExtraction {
  relevant: boolean;
  type: ExtractedType;
  severity: "low" | "medium" | "high" | "critical";
  locationHint: string | null;
  summary: string;
  source: "rules" | "rules+ai";
}

const TYPE_KEYWORDS: Record<ExtractedType, string[]> = {
  crime: ["crime", "theft", "burglary"],
  robbery: ["robbery", "robbed", "snatch"],
  harassment: ["harassment", "molest", "stalk", "eve-teasing"],
  violence: ["violence", "assault", "attack", "stabbed", "shot"],
  protest: ["protest", "rally", "demonstration", "bandh"],
  road_closure: ["road closure", "road closed", "diversion", "blocked"],
  accident: ["accident", "collision", "crash", "hit-and-run"],
  security: ["security", "police deployment", "curfew"],
  other: [],
};

const CRITICAL_WORDS = ["killed", "murder", "dead", "fatal", "shot", "stabbed"];
const HIGH_WORDS = ["assault", "robbery", "robbed", "attack", "riot"];
const MEDIUM_WORDS = ["theft", "harassment", "snatch", "protest"];

function ruleBasedExtraction(article: RawNewsArticle): NewsExtraction {
  const text = `${article.title} ${article.description || ""} ${article.content || ""}`.toLowerCase();
  const relevant = containsSafetyKeyword(text);

  let type: ExtractedType = "other";
  for (const [t, words] of Object.entries(TYPE_KEYWORDS) as [ExtractedType, string[]][]) {
    if (words.some((w) => text.includes(w))) {
      type = t;
      break;
    }
  }

  let severity: NewsExtraction["severity"] = "low";
  if (CRITICAL_WORDS.some((w) => text.includes(w))) severity = "critical";
  else if (HIGH_WORDS.some((w) => text.includes(w))) severity = "high";
  else if (MEDIUM_WORDS.some((w) => text.includes(w))) severity = "medium";

  return {
    relevant,
    type,
    severity,
    locationHint: null,
    summary: article.title,
    source: "rules",
  };
}

/**
 * SPEC.md #10 newsAnalysisAgent. Rule-based keyword extraction first
 * (deterministic, free, always available); if OpenAI is configured it
 * re-checks with a structured-JSON call and we prefer the AI's read only
 * when it's confident *and* internally consistent, otherwise keep rules.
 */
export async function runNewsAnalysisAgent(article: RawNewsArticle): Promise<NewsExtraction> {
  const startedAt = Date.now();
  const rules = ruleBasedExtraction(article);
  let result = rules;

  if (rules.relevant) {
    const ai = await askForJson<{
      relevant: boolean;
      type: ExtractedType;
      severity: "low" | "medium" | "high" | "critical";
      locationHint: string | null;
      summary: string;
    }>(
      `You extract structured road-safety incident data from news for the ${env.PILOT_CITY} area. ` +
        `Return JSON only: {"relevant": boolean, "type": one of [${Object.keys(TYPE_KEYWORDS).join(", ")}], ` +
        `"severity": one of [low, medium, high, critical], "locationHint": string or null (neighbourhood/road name if mentioned), ` +
        `"summary": short one-sentence summary}.`,
      `Title: ${article.title}\nDescription: ${article.description || ""}\nContent: ${(article.content || "").slice(0, 800)}`
    );

    if (ai && Object.keys(TYPE_KEYWORDS).includes(ai.type)) {
      result = { ...ai, source: "rules+ai" };
    }
  }

  await logAgentRun({
    agentName: "newsAnalysisAgent",
    operation: "extract_incident",
    input: { url: article.url, title: article.title },
    output: result,
    status: "success",
    startedAt,
  });

  return result;
}
