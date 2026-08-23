import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { env } from "../config/env";

const router = Router();

/**
 * These are thin convenience wrappers around Supabase Auth so the frontend
 * has one consistent base URL to call. The client SDK can also call
 * Supabase directly — both are valid, this just keeps the API surface
 * uniform for teammates who'd rather not wire up the Supabase client twice.
 */

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: env.DEMO_MODE, // auto-confirm in demo mode so the pilot doesn't need email delivery configured
      user_metadata: { full_name: fullName || null },
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ user: data.user });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    res.json({ session: data.session, user: data.user });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("profiles").select("*").eq("id", req.user!.id).single();
    res.json({ user: req.user, profile: data });
  })
);

export default router;
