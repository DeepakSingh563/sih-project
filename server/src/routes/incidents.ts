import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";

const router = Router();

/** GET /api/incidents/near?lat=&lng=&radiusM=&severity=&type= */
router.get(
  "/near",
  requireAuth,
  asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "lat and lng query params are required" });
    }
    const radiusM = parseFloat((req.query.radiusM as string) || "2000");
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("incidents_near", {
      in_lat: lat,
      in_lng: lng,
      radius_m: radiusM,
      in_severity: (req.query.severity as string) || null,
      in_type: (req.query.type as string) || null,
      only_active: true,
    });
    if (error) throw error;
    res.json({ incidents: data || [] });
  })
);

/** GET /api/incidents — paginated list for map overlays / admin views */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const limit = Math.min(parseInt((req.query.limit as string) || "100", 10), 500);
    let query = supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (req.query.severity) query = query.eq("severity", req.query.severity as string);
    if (req.query.status) query = query.eq("verification_status", req.query.status as string);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ incidents: data || [] });
  })
);

/** PATCH /api/incidents/:id — admin verify/reject/edit */
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const allowed = ["severity", "title", "description", "verification_status", "verified"];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in req.body) patch[key] = req.body[key];
    }
    if (patch.verification_status === "verified") patch.verified = true;
    if (patch.verification_status === "rejected") patch.verified = false;

    const { data, error } = await supabase
      .from("incidents")
      .update(patch)
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;
    res.json({ incident: data });
  })
);

export default router;
