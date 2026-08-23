import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";

const router = Router();

router.get(
  "/stats",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const [incidents, pendingReports, activeSOS, agentLogs] = await Promise.all([
      supabase.from("incidents").select("id", { count: "exact", head: true }),
      supabase.from("community_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("sos_events").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("ai_agent_logs").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    res.json({
      totalIncidents: incidents.count || 0,
      pendingReports: pendingReports.count || 0,
      activeSOSEvents: activeSOS.count || 0,
      recentAgentRuns: agentLogs.data || [],
    });
  })
);

export default router;
