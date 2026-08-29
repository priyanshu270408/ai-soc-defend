// ============================================================
// AI Kavach — Six-Signal Threat Scoring Engine
// Prototype heuristic — not a scientifically validated detection model.
// ============================================================

export interface ScoringSignals {
  identity: number;       // 0-1: unusual login time/location/device
  access: number;         // 0-1: access to resources outside normal pattern
  privilege: number;      // 0-1: use of elevated permissions atypically
  network: number;        // 0-1: unusual connections/traffic patterns
  dataTransfer: number;   // 0-1: volume/direction/destination deviation
  historicalDeviation: number; // 0-1: how far this week differs from user's own history
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Weights sum to 1.0
const WEIGHTS: Record<keyof ScoringSignals, number> = {
  identity: 0.15,
  access: 0.20,
  privilege: 0.15,
  network: 0.20,
  dataTransfer: 0.20,
  historicalDeviation: 0.10,
};

export interface ScoringResult {
  score: number;          // 0-100
  level: RiskLevel;
  breakdown: Record<keyof ScoringSignals, number>; // weighted contribution
}

/**
 * Compute the combined risk score from six normalised signals.
 *
 * combined_score = round(100 * Σ(weight_i * signal_i))
 *
 * Tiers: 0–29 LOW · 30–54 MEDIUM · 55–79 HIGH · 80–100 CRITICAL
 */
export function computeRiskScore(signals: ScoringSignals): ScoringResult {
  const breakdown = {} as Record<keyof ScoringSignals, number>;
  let raw = 0;

  for (const key of Object.keys(WEIGHTS) as (keyof ScoringSignals)[]) {
    const weighted = WEIGHTS[key] * clamp(signals[key], 0, 1);
    breakdown[key] = Math.round(weighted * 100);
    raw += weighted;
  }

  const score = Math.round(raw * 100);

  return {
    score: clamp(score, 0, 100),
    level: scoreToLevel(score),
    breakdown,
  };
}

export function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 55) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export function levelToColor(level: RiskLevel): string {
  switch (level) {
    case "CRITICAL": return "var(--color-severity-critical)";
    case "HIGH": return "var(--color-severity-high)";
    case "MEDIUM": return "var(--color-severity-medium)";
    case "LOW": return "var(--color-severity-low)";
  }
}

export function riskScoreColor(score: number): string {
  if (score >= 80) return "var(--color-severity-critical)";
  if (score >= 55) return "var(--color-severity-high)";
  if (score >= 30) return "var(--color-severity-medium)";
  return "var(--color-severity-low)";
}

/**
 * Build the structured input payload for the Grok AI analysis call.
 */
export function buildAIAnalysisInput(
  syntheticUserId: string,
  windowStart: string,
  windowEnd: string,
  signals: ScoringSignals,
  eventSummary: string[],
): Record<string, unknown> {
  return {
    synthetic_user_id: syntheticUserId,
    window: `${windowStart}/${windowEnd}`,
    identity_anomaly: signals.identity,
    access_anomaly: signals.access,
    privilege_anomaly: signals.privilege,
    network_anomaly: signals.network,
    data_transfer_anomaly: signals.dataTransfer,
    historical_deviation: signals.historicalDeviation,
    event_summary: eventSummary,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Weights export for reference
export const SCORING_WEIGHTS = WEIGHTS;
