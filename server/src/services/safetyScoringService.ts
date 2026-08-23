import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { LatLng, sampleRoutePoints } from "./routingService";

export type Severity = "low" | "medium" | "high" | "critical";
export type RiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 30,
  high: 20,
  medium: 10,
  low: 5,
};

// Radius (metres) each sampled route point checks for nearby incidents.
const SAMPLE_RADIUS_M = 600;
// Half-life (days) for recency decay — an incident from this long ago counts
// at half its original weight.
const RECENCY_HALF_LIFE_DAYS = 45;
// Multiplier applied when travelling at night AND the incident itself
// occurred at night (both signals reinforcing each other).
const NIGHT_MULTIPLIER = 1.3;

export interface NearbyIncidentRow {
  id: string;
  type: string;
  severity: Severity;
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  occurred_at: string | null;
  verified: boolean;
  verification_status: string;
  confidence: number;
  is_demo: boolean;
  distance_m: number;
}

export interface ScoredReason {
  incidentId: string;
  title: string;
  severity: Severity;
  distanceM: number;
  contribution: number;
}

export interface RouteSafetyScore {
  score: number; // 0-100, higher = safer
  level: RiskLevel;
  totalRisk: number;
  incidentCount: number;
  reasons: ScoredReason[]; // top contributing incidents, highest impact first
}

export function levelForScore(score: number): RiskLevel {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MODERATE";
  if (score >= 40) return "ELEVATED";
  if (score >= 20) return "HIGH";
  return "CRITICAL";
}

function getISTHour(date: Date): number {
  const s = date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hour12: false,
  });
  return parseInt(s, 10) % 24;
}

function isNightHour(hour: number): boolean {
  return hour >= 20 || hour < 5;
}

function recencyDecay(occurredAt: string | null, now: Date): number {
  if (!occurredAt) return 0.6; // unknown recency — moderate default weight
  const ageDays = (now.getTime() - new Date(occurredAt).getTime()) / 86_400_000;
  if (ageDays < 0) return 1; // future/typo timestamp, don't punish
  const decayed = Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
  return Math.max(0.2, decayed); // floor so old incidents still count a little
}

/**
 * Scores a route's safety by sampling points along its geometry and pulling
 * nearby incidents from the DB via the incidents_near() RPC (0002_functions.sql).
 * Implements SPEC.md #10-16:
 *   base 100, subtract per-incident risk with distance decay + recency +
 *   time-of-day weighting, score = max(0, 100 - totalRisk).
 */
export async function scoreRouteSafety(
  geometry: GeoJSON.LineString,
  travelAt: Date = new Date()
): Promise<RouteSafetyScore> {
  const supabase = getSupabaseAdmin();
  const points = sampleRoutePoints(geometry, 20);
  const travelIsNight = isNightHour(getISTHour(travelAt));

  // incidentId -> best (closest-point) contribution seen so far, so an
  // incident near several sample points isn't double-counted.
  const bestContribution = new Map<string, ScoredReason>();

  for (const point of points) {
    const { data, error } = await supabase.rpc("incidents_near", {
      in_lat: point.lat,
      in_lng: point.lng,
      radius_m: SAMPLE_RADIUS_M,
      in_severity: null,
      in_type: null,
      only_active: true,
    });
    if (error) {
      console.error("[safetyScoring] incidents_near RPC failed:", error.message);
      continue;
    }
    const rows = (data || []) as NearbyIncidentRow[];
    for (const incident of rows) {
      const severityWeight = SEVERITY_WEIGHT[incident.severity] ?? SEVERITY_WEIGHT.low;
      const distanceFactor = Math.max(0, 1 - incident.distance_m / SAMPLE_RADIUS_M);
      const recencyFactor = recencyDecay(incident.occurred_at, travelAt);

      let timeFactor = 1;
      if (travelIsNight && incident.occurred_at && isNightHour(getISTHour(new Date(incident.occurred_at)))) {
        timeFactor = NIGHT_MULTIPLIER;
      }

      // Unverified / community-only incidents count at reduced weight until
      // an admin confirms them, scaled by their own confidence score.
      const trustFactor =
        incident.verification_status === "verified" ? 1 : Math.max(0.3, incident.confidence || 0.5);

      const contribution =
        severityWeight * distanceFactor * recencyFactor * timeFactor * trustFactor;

      const existing = bestContribution.get(incident.id);
      if (!existing || contribution > existing.contribution) {
        bestContribution.set(incident.id, {
          incidentId: incident.id,
          title: incident.title || incident.type,
          severity: incident.severity,
          distanceM: Math.round(incident.distance_m),
          contribution,
        });
      }
    }
  }

  const contributions = Array.from(bestContribution.values());
  const totalRisk = contributions.reduce((sum, c) => sum + c.contribution, 0);
  const score = Math.round(Math.max(0, 100 - totalRisk));
  const reasons = contributions
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);

  return {
    score,
    level: levelForScore(score),
    totalRisk: Math.round(totalRisk),
    incidentCount: contributions.length,
    reasons,
  };
}

/** Point-in-time score (used for alerting on the user's current position
 *  rather than a whole route geometry). */
export async function scorePointSafety(
  point: LatLng,
  travelAt: Date = new Date()
): Promise<RouteSafetyScore> {
  return scoreRouteSafety(
    { type: "LineString", coordinates: [[point.lng, point.lat]] },
    travelAt
  );
}
