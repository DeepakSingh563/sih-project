import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { runIngestionAgent } from "../agents/ingestionAgent";
import { runVerificationAgent } from "../agents/verificationAgent";

const router = Router();

const VALID_SEVERITIES = ["low", "medium", "high", "critical"];

/** POST /api/reports — submit a community report. Runs ingestion + verification
 *  synchronously so the reporter gets an immediate status, per SPEC.md #7. */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { incidentType, description, severity, latitude, longitude, address, imageUrl } = req.body;
    if (!incidentType || typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "incidentType, latitude, longitude are required" });
    }
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: `severity must be one of ${VALID_SEVERITIES.join(", ")}` });
    }

    const ingestion = await runIngestionAgent({
      latitude,
      longitude,
      incidentType,
      description: description || null,
    });

    const verification = await runVerificationAgent({
      incidentType,
      severity: severity || null,
      description: description || null,
      duplicateReportsNearby: ingestion.possibleDuplicateId ? 1 : 0,
    });

    const supabase = getSupabaseAdmin();
    const { data: report, error } = await supabase
      .from("community_reports")
      .insert({
        user_id: req.user!.id,
        incident_type: incidentType,
        description: description || null,
        severity: severity || null,
        latitude,
        longitude,
        address: address || null,
        image_url: imageUrl || null,
        status: verification.suggestedStatus,
        confidence: verification.confidence,
        duplicate_of: ingestion.possibleDuplicateId,
      })
      .select("*")
      .single();
    if (error) throw error;

    // Auto-verified reports get promoted to a real incident immediately so
    // they factor into safety scoring right away.
    if (verification.suggestedStatus === "verified") {
      await supabase.from("incidents").insert({
        type: incidentType,
        severity: severity || "medium",
        title: `Community report: ${incidentType}`,
        description,
        latitude,
        longitude,
        address,
        source: "community_report",
        verified: true,
        verification_status: "verified",
        confidence: verification.confidence,
        created_by: req.user!.id,
      });
    }

    res.status(201).json({
      report,
      ingestionWarnings: ingestion.warnings,
      verification,
    });
  })
);

/** GET /api/reports/mine — the current user's own submitted reports */
router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("community_reports")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ reports: data || [] });
  })
);

/** GET /api/reports/pending — admin queue */
router.get(
  "/pending",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("community_reports")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json({ reports: data || [] });
  })
);

/** PATCH /api/reports/:id — admin verify/reject */
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!["verified", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "status must be verified, rejected, or pending" });
    }
    const supabase = getSupabaseAdmin();
    const { data: report, error } = await supabase
      .from("community_reports")
      .update({ status })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;

    if (status === "verified") {
      await supabase.from("incidents").insert({
        type: report.incident_type,
        severity: report.severity || "medium",
        title: `Community report: ${report.incident_type}`,
        description: report.description,
        latitude: report.latitude,
        longitude: report.longitude,
        address: report.address,
        source: "community_report",
        verified: true,
        verification_status: "verified",
        confidence: Math.max(report.confidence, 0.9), // admin-confirmed
        created_by: report.user_id,
      });
    }

    res.json({ report });
  })
);

export default router;
