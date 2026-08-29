// AI Analysis types — server-side AI integration stub
// The actual Edge Function lives outside this codebase (Supabase Edge Function)
// This file only defines the response type used by the client wrapper in src/lib/ai-analysis.ts

export type AIAnalysisResponse = {
  explanation: string;
  confidence: number;
  riskScore: number;
  recommendedSteps: string[];
  threatActors: string[];
  mitigations: string[];
};
