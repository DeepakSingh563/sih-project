import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";

const router = Router();

/** GET /api/ai/logs — real (not faked) AI agent operations, for the
 *  "AI operations dashboard" required by SPEC.md #21-22. */
router.get(
  "/logs",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const limit = Math.min(parseInt((req.query.limit as string) || "50", 10), 200);
    let query = supabase
      .from("ai_agent_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (req.query.agentName) query = query.eq("agent_name", req.query.agentName as string);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ logs: data || [] });
  })
);

export default router;
