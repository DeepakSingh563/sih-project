import { scoreRouteSafety, RouteSafetyScore } from "../services/safetyScoringService";
import { logAgentRun } from "./agentLogger";

/**
 * SPEC.md #10 riskScoringAgent. The actual math lives in
 * safetyScoringService (deterministic, per the exact formula in SPEC.md
 * #10-16) — this wrapper is the "agent" boundary that logs every run for
 * the AI operations dashboard (SPEC.md #21-22).
 */
export async function runRiskScoringAgent(
  geometry: GeoJSON.LineString,
  travelAt: Date = new Date()
): Promise<RouteSafetyScore> {
  const startedAt = Date.now();
  try {
    const result = await scoreRouteSafety(geometry, travelAt);
    await logAgentRun({
      agentName: "riskScoringAgent",
      operation: "score_route",
      input: { pointCount: geometry.coordinates.length, travelAt: travelAt.toISOString() },
      output: { score: result.score, level: result.level, incidentCount: result.incidentCount },
      status: "success",
      startedAt,
    });
    return result;
  } catch (err) {
    await logAgentRun({
      agentName: "riskScoringAgent",
      operation: "score_route",
      input: { pointCount: geometry.coordinates.length },
      output: { error: String(err) },
      status: "error",
      startedAt,
    });
    throw err;
  }
}
