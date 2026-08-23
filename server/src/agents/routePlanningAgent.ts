import { RouteOption } from "../services/routingService";
import { RouteSafetyScore } from "../services/safetyScoringService";
import { logAgentRun } from "./agentLogger";

export interface ScoredRouteOption {
  routeIndex: number;
  distanceMeters: number;
  durationSeconds: number;
  safety: RouteSafetyScore;
  combinedScore: number;
  isFallback: boolean;
}

export interface RoutePlanResult {
  options: ScoredRouteOption[];
  recommendedIndex: number;
  reason: string;
  tradeoff: string | null;
}

const WEIGHTS = { safety: 0.5, time: 0.3, distance: 0.2 };

// Normalizes a metric across alternatives so the best option scores 100 and
// the worst scores toward 0 (lower time/distance = better, so we invert).
function normalizeInverse(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 100);
  return values.map((v) => 100 * (1 - (v - min) / (max - min)));
}

/**
 * SPEC.md #10 routePlanningAgent: combined = 0.50*safety + 0.30*time +
 * 0.20*distance. Never just picks the shortest route.
 */
export function planRoutes(
  routes: RouteOption[],
  safetyScores: RouteSafetyScore[]
): RoutePlanResult {
  const startedAt = Date.now();

  const durations = routes.map((r) => r.durationSeconds);
  const distances = routes.map((r) => r.distanceMeters);
  const timeScores = normalizeInverse(durations);
  const distanceScores = normalizeInverse(distances);

  const options: ScoredRouteOption[] = routes.map((route, i) => {
    const safety = safetyScores[i];
    const combinedScore =
      WEIGHTS.safety * safety.score +
      WEIGHTS.time * timeScores[i] +
      WEIGHTS.distance * distanceScores[i];
    return {
      routeIndex: route.index,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      safety,
      combinedScore: Math.round(combinedScore * 10) / 10,
      isFallback: route.isFallback,
    };
  });

  let recommendedIndex = 0;
  for (let i = 1; i < options.length; i++) {
    if (options[i].combinedScore > options[recommendedIndex].combinedScore) recommendedIndex = i;
  }

  const recommended = options[recommendedIndex];
  const fastest = [...options].sort((a, b) => a.durationSeconds - b.durationSeconds)[0];

  let reason: string;
  let tradeoff: string | null = null;

  if (recommended.routeIndex === fastest.routeIndex) {
    reason = `Route ${recommended.routeIndex + 1} is both the fastest option and has the strongest safety score (${recommended.safety.score}/100, ${recommended.safety.level}).`;
  } else {
    const extraMinutes = Math.round((recommended.durationSeconds - fastest.durationSeconds) / 60);
    reason = `Route ${recommended.routeIndex + 1} has a meaningfully better safety score (${recommended.safety.score}/100 vs ${fastest.safety.score}/100) than the fastest option.`;
    tradeoff =
      extraMinutes > 0
        ? `About ${extraMinutes} extra minute${extraMinutes === 1 ? "" : "s"} compared to the fastest route, for a safer path.`
        : `Comparable travel time, meaningfully safer route.`;
  }

  logAgentRun({
    agentName: "routePlanningAgent",
    operation: "recommend_route",
    input: { optionCount: routes.length },
    output: { recommendedIndex, reason, tradeoff },
    status: "success",
    startedAt,
  }).catch(() => {});

  return { options, recommendedIndex, reason, tradeoff };
}
