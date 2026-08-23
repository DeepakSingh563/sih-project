import { askForJson } from "../lib/openai";
import { logAgentRun } from "./agentLogger";

export interface VerificationInput {
  incidentType: string;
  severity: string | null;
  description: string | null;
  duplicateReportsNearby: number; // count of similar reports found by ingestionAgent context
}

export interface VerificationResult {
  confidence: number; // 0-1
  suggestedStatus: "pending" | "verified" | "rejected";
  rationale: string;
  source: "rules" | "rules+ai";
}

const STRONG_SIGNAL_WORDS = ["saw", "witnessed", "police", "reported to", "happened to me", "attacked", "stole", "snatched"];
const WEAK_SIGNAL_WORDS = ["heard", "someone said", "maybe", "rumor", "not sure"];

function ruleBasedConfidence(input: VerificationInput): { confidence: number; rationale: string } {
  let confidence = 0.4; // baseline for any structured report
  const text = (input.description || "").toLowerCase();

  if (STRONG_SIGNAL_WORDS.some((w) => text.includes(w))) confidence += 0.2;
  if (WEAK_SIGNAL_WORDS.some((w) => text.includes(w))) confidence -= 0.15;
  if (input.duplicateReportsNearby > 0) confidence += Math.min(0.3, input.duplicateReportsNearby * 0.15);
  if (input.severity === "critical" && input.duplicateReportsNearby === 0) confidence -= 0.1; // extraordinary claims need corroboration
  if (!input.description || input.description.trim().length < 10) confidence -= 0.15;

  confidence = Math.max(0.05, Math.min(0.95, confidence));
  const rationale =
    input.duplicateReportsNearby > 0
      ? `${input.duplicateReportsNearby} similar nearby report(s) found in the last 6 hours, description language reviewed.`
      : "Single report, no corroboration yet — description language reviewed for plausibility signals.";
  return { confidence, rationale };
}

/**
 * SPEC.md #10 verificationAgent: rules first, AI only when useful, never
 * blindly trusted. Auto-verify threshold is intentionally conservative
 * (>=0.85) — anything below always lands as "pending" for a human admin.
 */
export async function runVerificationAgent(input: VerificationInput): Promise<VerificationResult> {
  const startedAt = Date.now();
  const rules = ruleBasedConfidence(input);
  let confidence = rules.confidence;
  let rationale = rules.rationale;
  let source: VerificationResult["source"] = "rules";

  const aiResult = await askForJson<{ plausibility: number; note: string }>(
    "You assist (never decide alone) in triaging crowd-sourced road-safety reports for a Delhi NCR safety app. " +
      "Return JSON only: {\"plausibility\": number between 0 and 1, \"note\": short string}. " +
      "Be conservative — vague or sensational reports should score low.",
    `Incident type: ${input.incidentType}\nSeverity claimed: ${input.severity}\nDescription: ${input.description || "(none)"}`
  );

  if (aiResult && typeof aiResult.plausibility === "number") {
    // Rules stay dominant (70%) — AI nudges, never overrides.
    confidence = Math.max(0, Math.min(1, confidence * 0.7 + aiResult.plausibility * 0.3));
    rationale = `${rationale} AI note: ${aiResult.note}`;
    source = "rules+ai";
  }

  const suggestedStatus: VerificationResult["suggestedStatus"] =
    confidence >= 0.85 ? "verified" : confidence <= 0.15 ? "rejected" : "pending";

  const result: VerificationResult = { confidence, suggestedStatus, rationale, source };

  await logAgentRun({
    agentName: "verificationAgent",
    operation: "assess_report",
    input,
    output: result,
    status: "success",
    startedAt,
  });

  return result;
}
