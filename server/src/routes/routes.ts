import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import { fetchRoutes, generateFallbackRoutes } from "../services/routingService";
import { runRiskScoringAgent } from "../agents/riskScoringAgent";
import { planRoutes } from "../agents/routePlanningAgent";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { env } from "../config/env";

const router = Router();

function parseLatLng(body: any, key: "origin" | "destination") {
  const v = body[key];
  if (!v || typeof v.lat !== "number" || typeof v.lng !== "number") {
    const err: any = new Error(`Invalid or missing "${key}" {lat, lng}`);
    err.status = 400;
    err.publicMessage = err.message;
    throw err;
  }
  return { lat: v.lat, lng: v.lng };
}

/**
 * POST /api/routes/plan
 * body: { origin: {lat,lng}, destination: {lat,lng}, travelAt?: ISOString }
 * Returns every route option scored for safety, with a recommendation —
 * this is the core "Route A vs Recommended Route B" comparison from the deck.
 */
router.post(
  "/plan",
  requireAuth,
  asyncHandler(async (req, res) => {
    const origin = parseLatLng(req.body, "origin");
    const destination = parseLatLng(req.body, "destination");
    const travelAt = req.body.travelAt ? new Date(req.body.travelAt) : new Date();

    let rawRoutes;
    try {
      rawRoutes = await fetchRoutes(origin, destination);
    } catch (err) {
      console.error("[routes/plan] OSRM failed, using fallback:", err);
      if (!env.DEMO_MODE) throw err;
      rawRoutes = generateFallbackRoutes(origin, destination);
    }

    const safetyScores = await Promise.all(
      rawRoutes.map((r) => runRiskScoringAgent(r.geometry, travelAt))
    );
    const plan = planRoutes(rawRoutes, safetyScores);

    // Persist so the frontend can reference a stable routeId (for alerts/SOS).
    const supabase = getSupabaseAdmin();
    const { data: savedRoute, error } = await supabase
      .from("routes")
      .insert({
        user_id: req.user!.id,
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        selected_route_index: plan.recommendedIndex,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[routes/plan] failed to persist route:", error.message);
    }

    if (savedRoute) {
      const rows = plan.options.map((o) => ({
        route_id: savedRoute.id,
        route_index: o.routeIndex,
        distance_meters: o.distanceMeters,
        duration_seconds: o.durationSeconds,
        safety_score: o.safety.score,
        risk_level: o.safety.level,
        geometry: rawRoutes[o.routeIndex].geometry as any,
        risk_reasons: o.safety.reasons as any,
      }));
      await supabase.from("route_options").insert(rows);
    }

    res.json({
      routeId: savedRoute?.id ?? null,
      origin,
      destination,
      travelAt: travelAt.toISOString(),
      options: plan.options.map((o, i) => ({
        ...o,
        geometry: rawRoutes[i].geometry,
      })),
      recommendedIndex: plan.recommendedIndex,
      reason: plan.reason,
      tradeoff: plan.tradeoff,
      demoFallbackUsed: rawRoutes[0]?.isFallback ?? false,
    });
  })
);

/** GET /api/routes/:id — replay a previously computed plan (e.g. after refresh). */
router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { data: route, error } = await supabase
      .from("routes")
      .select("*, route_options(*)")
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .single();
    if (error || !route) {
      return res.status(404).json({ error: "Route not found" });
    }
    res.json(route);
  })
);

export default router;
