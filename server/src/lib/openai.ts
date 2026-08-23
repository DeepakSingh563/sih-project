import OpenAI from "openai";
import { env, isOpenAIConfigured } from "../config/env";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

/**
 * Ask the model for a JSON object matching a shape you describe in the
 * prompt. Returns null on any failure (missing key, network error, bad
 * JSON) so callers can always fall back to rule-based logic — per SPEC.md:
 * "rule-based fallback when AI fails; do not blindly trust AI."
 */
export async function askForJson<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T | null> {
  if (!isOpenAIConfigured) return null;
  try {
    const res = await getClient().chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    const text = res.choices[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("[openai] request failed, falling back to rules:", err);
    return null;
  }
}
