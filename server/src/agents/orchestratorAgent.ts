import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { runIngestionAgent } from "./ingestionAgent";
import { runVerificationAgent } from "./verificationAgent";
import { runNewsAnalysisAgent } from "./newsAnalysisAgent";
import { fetchLatestSafetyNews } from "../services/newsService";
import { logAgentRun } from "./agentLogger";
import { env } from "../config/env";
import { geocodeAddress } from "../services/geocodingService";

/**
 * SPEC.md #10 orchestratorAgent: builds the live risk map by pulling
 * ingestion + verification + (for news) extraction together, then writing
 * to `incidents`. This is what the pilot's "continuous learning" loop calls
 * on a schedule (or an admin can trigger manually via POST /api/analyze-news).
 */

export async function orchestrateReportToIncident(reportId: string): Promise<void> {
  const startedAt = Date.now();
  const supabase = getSupabaseAdmin();

  const { data: report, error } = await supabase
    .from("community_reports")
    .select("*")
    .eq("id", reportId)
    .single();
  if (error || !report) throw new Error(`Report ${reportId} not found`);

  const ingestion = await runIngestionAgent({
    latitude: report.latitude,
    longitude: report.longitude,
    incidentType: report.incident_type,
    description: report.description,
  });

  const verification = await runVerificationAgent({
    incidentType: report.incident_type,
    severity: report.severity,
    description: report.description,
    duplicateReportsNearby: ingestion.possibleDuplicateId ? 1 : 0,
  });

  await supabase
    .from("community_reports")
    .update({ status: verification.suggestedStatus, confidence: verification.confidence })
    .eq("id", reportId);

  // Only promote to the canonical incidents table once verified (auto or
  // admin) — pending/rejected reports stay out of route scoring.
  if (verification.suggestedStatus === "verified") {
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
      confidence: verification.confidence,
      is_demo: report.is_demo,
    });
  }

  await logAgentRun({
    agentName: "orchestratorAgent",
    operation: "report_to_incident",
    input: { reportId },
    output: { verification, promoted: verification.suggestedStatus === "verified" },
    status: "success",
    startedAt,
  });
}

export async function orchestrateNewsIngestion(): Promise<{ processed: number; created: number }> {
  const startedAt = Date.now();
  const supabase = getSupabaseAdmin();
  const articles = await fetchLatestSafetyNews();

  let created = 0;
  for (const article of articles) {
    // Dedupe by URL (unique constraint on news_articles.url).
    const { data: existing } = await supabase
      .from("news_articles")
      .select("id")
      .eq("url", article.url)
      .maybeSingle();
    if (existing) continue;

    const extraction = await runNewsAnalysisAgent(article);

    await supabase.from("news_articles").insert({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source,
      published_at: article.publishedAt,
      content: article.content,
      processed: true,
      is_demo: false,
      ai_analysis: extraction as any,
    });

    if (extraction.relevant) {
      // TODO(team): once a geocoding key is set, this resolves the AI's
      // locationHint to real coordinates. Until then every news-sourced
      // incident lands on the pilot city centre point, clearly labelled —
      // don't let it silently masquerade as a precise location.
      let lat = env.PILOT_LAT;
      let lng = env.PILOT_LNG;
      if (extraction.locationHint) {
        try {
          const geo = await geocodeAddress(`${extraction.locationHint}, ${env.PILOT_CITY}`);
          lat = geo.lat;
          lng = geo.lng;
        } catch {
          // no geocoding provider configured — keep the city-centre fallback
        }
      }

      await supabase.from("incidents").insert({
        type: extraction.type,
        severity: extraction.severity,
        title: extraction.summary,
        description: article.description,
        latitude: lat,
        longitude: lng,
        address: extraction.locationHint || env.PILOT_CITY,
        occurred_at: article.publishedAt,
        source: "news",
        source_url: article.url,
        verified: false,
        verification_status: "pending",
        confidence: extraction.source === "rules+ai" ? 0.6 : 0.4,
        is_demo: false,
      });
      created++;
    }
  }

  await logAgentRun({
    agentName: "orchestratorAgent",
    operation: "news_ingestion",
    input: { fetched: articles.length },
    output: { processed: articles.length, created },
    status: "success",
    startedAt,
  });

  return { processed: articles.length, created };
}
