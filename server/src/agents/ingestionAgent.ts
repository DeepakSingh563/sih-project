import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { haversineKm } from "../services/routingService";
import { logAgentRun } from "./agentLogger";

// Rough Delhi NCR bounding box (Delhi, Noida, Ghaziabad, Gurugram) — used to
// reject obviously out-of-scope submissions for the pilot.
const NCR_BOUNDS = { minLat: 28.2, maxLat: 28.95, minLng: 76.7, maxLng: 77.55 };

export interface IngestionInput {
  latitude: number;
  longitude: number;
  incidentType: string;
  description: string | null;
  occurredAt?: string | null;
}

export interface IngestionResult {
  valid: boolean;
  warnings: string[];
  possibleDuplicateId: string | null;
}

/**
 * Rule-based cleaning/verification of incoming data per SPEC.md #10
 * (ingestionAgent). Checks required fields, pilot-city bounds, and looks for
 * a near-duplicate report (same rough location + type within 6 hours).
 */
export async function runIngestionAgent(input: IngestionInput): Promise<IngestionResult> {
  const startedAt = Date.now();
  const warnings: string[] = [];

  const inBounds =
    input.latitude >= NCR_BOUNDS.minLat &&
    input.latitude <= NCR_BOUNDS.maxLat &&
    input.longitude >= NCR_BOUNDS.minLng &&
    input.longitude <= NCR_BOUNDS.maxLng;
  if (!inBounds) {
    warnings.push("Location falls outside the Delhi NCR pilot area.");
  }
  if (!input.description || input.description.trim().length < 5) {
    warnings.push("Description is very short — consider asking the reporter for more detail.");
  }

  let possibleDuplicateId: string | null = null;
  try {
    const supabase = getSupabaseAdmin();
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("community_reports")
      .select("id, latitude, longitude, incident_type, created_at")
      .eq("incident_type", input.incidentType)
      .gte("created_at", sixHoursAgo)
      .neq("status", "rejected");

    for (const row of data || []) {
      const distKm = haversineKm(
        { lat: input.latitude, lng: input.longitude },
        { lat: row.latitude, lng: row.longitude }
      );
      if (distKm <= 0.3) {
        possibleDuplicateId = row.id;
        warnings.push("A similar report near this location was submitted in the last 6 hours.");
        break;
      }
    }
  } catch (err) {
    console.error("[ingestionAgent] dedupe check failed:", err);
  }

  const result: IngestionResult = {
    valid: inBounds,
    warnings,
    possibleDuplicateId,
  };

  await logAgentRun({
    agentName: "ingestionAgent",
    operation: "validate_and_dedupe",
    input,
    output: result,
    status: "success",
    startedAt,
  });

  return result;
}
