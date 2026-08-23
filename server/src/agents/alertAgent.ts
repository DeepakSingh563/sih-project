import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { LatLng } from "../services/routingService";
import { logAgentRun } from "./agentLogger";

export interface AlertCheckInput {
  userId: string;
  routeId: string | null;
  position: LatLng;
  alertRadiusKm: number;
}

export interface AlertCheckResult {
  triggered: boolean;
  alertId: string | null;
  incidentId: string | null;
  message: string | null;
}

/**
 * SPEC.md #17 alertAgent: while navigating, poll position; if a high/
 * critical incident is within the user's configured alert radius, create an
 * alert row (frontend renders View Details / Reroute / Dismiss).
 * Only fires once per incident per route (checked via existing alerts).
 */
export async function runAlertAgent(input: AlertCheckInput): Promise<AlertCheckResult> {
  const startedAt = Date.now();
  const supabase = getSupabaseAdmin();
  const radiusM = input.alertRadiusKm * 1000;

  const { data: nearby, error } = await supabase.rpc("incidents_near", {
    in_lat: input.position.lat,
    in_lng: input.position.lng,
    radius_m: radiusM,
    in_severity: null,
    in_type: null,
    only_active: true,
  });

  if (error) {
    await logAgentRun({
      agentName: "alertAgent",
      operation: "check_position",
      input,
      output: { error: error.message },
      status: "error",
      startedAt,
    });
    return { triggered: false, alertId: null, incidentId: null, message: null };
  }

  const risky = (nearby || []).filter(
    (i: any) => i.severity === "high" || i.severity === "critical"
  );
  if (!risky.length) {
    return { triggered: false, alertId: null, incidentId: null, message: null };
  }

  const worst = risky.sort((a: any, b: any) => a.distance_m - b.distance_m)[0];

  // Avoid duplicate alerts for the same incident on the same route.
  const { data: existing } = await supabase
    .from("alerts")
    .select("id")
    .eq("user_id", input.userId)
    .eq("incident_id", worst.id)
    .maybeSingle();

  if (existing) {
    return { triggered: false, alertId: existing.id, incidentId: worst.id, message: null };
  }

  const message = `${worst.severity === "critical" ? "Critical" : "High-risk"} ${worst.type} reported ${Math.round(worst.distance_m)}m ahead${worst.title ? ` — ${worst.title}` : ""}.`;

  const { data: inserted, error: insertErr } = await supabase
    .from("alerts")
    .insert({
      user_id: input.userId,
      incident_id: worst.id,
      route_id: input.routeId,
      title: "Safety alert on your route",
      message,
      severity: worst.severity,
      latitude: worst.latitude,
      longitude: worst.longitude,
      distance_from_user: worst.distance_m,
    })
    .select("id")
    .single();

  if (insertErr) {
    await logAgentRun({
      agentName: "alertAgent",
      operation: "check_position",
      input,
      output: { error: insertErr.message },
      status: "error",
      startedAt,
    });
    return { triggered: false, alertId: null, incidentId: null, message: null };
  }

  await logAgentRun({
    agentName: "alertAgent",
    operation: "check_position",
    input,
    output: { triggered: true, incidentId: worst.id },
    status: "success",
    startedAt,
  });

  return { triggered: true, alertId: inserted.id, incidentId: worst.id, message };
}
