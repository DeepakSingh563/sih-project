import { getSupabaseAdmin } from "../lib/supabaseAdmin";

/**
 * Every agent run gets logged to ai_agent_logs — this is what powers the
 * "real, not faked" AI operations dashboard required by SPEC.md #21.
 */
export async function logAgentRun(params: {
  agentName: string;
  operation: string;
  input: unknown;
  output: unknown;
  status: "success" | "error" | "fallback";
  startedAt: number;
}): Promise<void> {
  const executionTimeMs = Date.now() - params.startedAt;
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("ai_agent_logs").insert({
      agent_name: params.agentName,
      operation: params.operation,
      input: params.input as any,
      output: params.output as any,
      status: params.status,
      execution_time_ms: executionTimeMs,
    });
  } catch (err) {
    // Logging failures should never break the actual feature.
    console.error("[agentLogger] failed to write log:", err);
  }
}
