import { action } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// AI Kavach — Server-Side Grok AI Analysis
// All AI calls happen here, server-side only.
// GROK_API_KEY is read from environment — never exposed to client.
// ============================================================

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a defensive cybersecurity analyst assistant embedded in a
Security Operations Center prototype called AI Kavach. You will receive structured,
already-sanitized behavioural and network telemetry deltas (no raw personal data).
Your job is ONLY to:
1. Assess whether the pattern is anomalous and how severe it is.
2. Explain, in plain language, which factors drove the assessment.
3. Suggest legitimate defensive investigation steps an analyst could take
   (e.g. "review access logs for resource X", "confirm with the user's
   supervisor", "check for concurrent sessions").

You must NEVER: provide exploit code, malware, credential-theft techniques,
persistence mechanisms, or any offensive attack instructions, even if asked.
You must NEVER assert that a specific person is guilty of wrongdoing — you
are scoring anomalous behaviour for human review only, not making accusations.

Respond ONLY with a JSON object matching exactly this schema, no extra text:
{"risk_level":"LOW|MEDIUM|HIGH|CRITICAL","risk_score":0-100,"summary":"...","indicators":["..."],"confidence":0-100,"recommended_investigation":["..."]}`;

export const analyzeThreat = action({
  args: {
    syntheticUserId: v.string(),
    window: v.string(),
    identityAnomaly: v.number(),
    accessAnomaly: v.number(),
    privilegeAnomaly: v.number(),
    networkAnomaly: v.number(),
    dataTransferAnomaly: v.number(),
    historicalDeviation: v.number(),
    eventSummary: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
      // No API key configured — return fallback response
      return {
        risk_level: "MEDIUM" as const,
        risk_score: 45,
        summary:
          "AI analysis unavailable — Grok API key not configured. Showing rule-based risk score only.",
        indicators: args.eventSummary,
        confidence: 0,
        recommended_investigation: [
          "Configure GROK_API_KEY environment variable for AI analysis",
          "Review rule-based score indicators manually",
          "Check contributing events for anomalies",
        ],
        _fallback: true,
      };
    }

    const userPayload = {
      synthetic_user_id: args.syntheticUserId,
      window: args.window,
      identity_anomaly: args.identityAnomaly,
      access_anomaly: args.accessAnomaly,
      privilege_anomaly: args.privilegeAnomaly,
      network_anomaly: args.networkAnomaly,
      data_transfer_anomaly: args.dataTransferAnomaly,
      historical_deviation: args.historicalDeviation,
      event_summary: args.eventSummary,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(GROK_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-3",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: JSON.stringify(userPayload) },
          ],
          response_format: { type: "json_object" },
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("Empty response from Grok API");
      }

      // Parse the JSON response
      const parsed = JSON.parse(content);

      // Validate required fields
      if (
        !parsed.risk_level ||
        typeof parsed.risk_score !== "number" ||
        !parsed.summary
      ) {
        throw new Error("Invalid response schema from Grok");
      }

      return {
        risk_level: parsed.risk_level,
        risk_score: parsed.risk_score,
        summary: parsed.summary,
        indicators: parsed.indicators || args.eventSummary,
        confidence: parsed.confidence || 50,
        recommended_investigation: parsed.recommended_investigation || [],
        _fallback: false,
      };
    } catch (error) {
      // Timeout, rate limit, or parse error — fall back to rule-based
      const isAbort =
        error instanceof DOMException && error.name === "AbortError";

      return {
        risk_level: "MEDIUM" as const,
        risk_score: 40,
        summary: isAbort
          ? "AI analysis timed out after 10 seconds. Showing rule-based risk score only."
          : `AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}. Showing rule-based risk score only.`,
        indicators: args.eventSummary,
        confidence: 0,
        recommended_investigation: [
          "Review rule-based score indicators manually",
          "Check contributing events for anomalies",
          "Consider retrying AI analysis later",
        ],
        _fallback: true,
      };
    }
  },
});
