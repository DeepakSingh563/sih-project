import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";

const router = Router();

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "latitude and longitude are required" });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("sos_events")
      .insert({ user_id: req.user!.id, latitude, longitude, status: "active" })
      .select("*")
      .single();
    if (error) throw error;
    // NOTE for the team: this is where a real deployment would notify
    // emergency contacts / a monitoring dashboard (e.g. via Supabase
    // Realtime or FCM push). Out of scope for the 20-day prototype — see
    // TASKS.md "Phase 7: SOS + Alerts".
    res.status(201).json({ sos: data });
  })
);

router.patch(
  "/:id/cancel",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("sos_events")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("*")
      .single();
    if (error) throw error;
    res.json({ sos: data });
  })
);

router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("sos_events")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("activated_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ sosEvents: data || [] });
  })
);

export default router;
