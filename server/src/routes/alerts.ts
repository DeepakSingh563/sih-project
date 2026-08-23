import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { runAlertAgent } from "../agents/alertAgent";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ alerts: data || [] });
  })
);

/** POST /api/alerts/check — frontend polls this with the user's live
 *  position while navigating (SPEC.md #17). */
router.post(
  "/check",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { latitude, longitude, routeId } = req.body;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "latitude and longitude are required" });
    }
    const supabase = getSupabaseAdmin();
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("alert_radius_km")
      .eq("user_id", req.user!.id)
      .maybeSingle();

    const result = await runAlertAgent({
      userId: req.user!.id,
      routeId: routeId || null,
      position: { lat: latitude, lng: longitude },
      alertRadiusKm: prefs?.alert_radius_km ?? 2,
    });
    res.json(result);
  })
);

router.patch(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("alerts")
      .update({ is_read: true })
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

export default router;
