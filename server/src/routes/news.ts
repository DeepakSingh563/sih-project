import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { orchestrateNewsIngestion } from "../agents/orchestratorAgent";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(30);
    if (error) throw error;
    res.json({ articles: data || [] });
  })
);

/** POST /api/news/refresh — admin-triggered ingestion run (would normally be
 *  a scheduled cron job; manual trigger is fine for the pilot). */
router.post(
  "/refresh",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await orchestrateNewsIngestion();
    res.json(result);
  })
);

export default router;
