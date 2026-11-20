import type { AiMode } from "@/lib/ai/contracts";
import type { GeminiModelKind } from "@/lib/ai/gemini";

export type InsightModeConfig = {
  temperature: number;
  maxTokens: number;
  /** Cap vs route maxDuration − 15s */
  timeoutMs: number;
  cacheTtlSec: number;
  model: GeminiModelKind;
  json: boolean;
};

/**
 * 해커톤/데모: 모든 모드를 main(고가 모델)로 통일.
 * OPENAI_MODEL_MAIN / OPENAI_MODEL_FAST 로 실제 모델명을 바꿔요.
 */
export const INSIGHT_MODES: Record<AiMode, InsightModeConfig> = {
  budget: { temperature: 0.45, maxTokens: 4000, timeoutMs: 75_000, cacheTtlSec: 900, model: "main", json: false },
  party: { temperature: 0.45, maxTokens: 4000, timeoutMs: 75_000, cacheTtlSec: 900, model: "main", json: false },
  weather: { temperature: 0.5, maxTokens: 6000, timeoutMs: 75_000, cacheTtlSec: 900, model: "main", json: true },
  factbomb: { temperature: 0.85, maxTokens: 3500, timeoutMs: 75_000, cacheTtlSec: 300, model: "main", json: false },
  tips: { temperature: 0.6, maxTokens: 8000, timeoutMs: 75_000, cacheTtlSec: 600, model: "main", json: true },
  style: { temperature: 0.55, maxTokens: 3500, timeoutMs: 75_000, cacheTtlSec: 600, model: "main", json: false },
  schedule: { temperature: 0.6, maxTokens: 5000, timeoutMs: 75_000, cacheTtlSec: 600, model: "main", json: false },
  plan: { temperature: 0.55, maxTokens: 24000, timeoutMs: 105_000, cacheTtlSec: 600, model: "main", json: true },
  deals: { temperature: 0.55, maxTokens: 8000, timeoutMs: 75_000, cacheTtlSec: 600, model: "main", json: true },
  summary: { temperature: 0.55, maxTokens: 4000, timeoutMs: 75_000, cacheTtlSec: 600, model: "main", json: false },
  deal: { temperature: 0.65, maxTokens: 8000, timeoutMs: 75_000, cacheTtlSec: 600, model: "main", json: true },
  buddy: { temperature: 1.0, maxTokens: 4000, timeoutMs: 75_000, cacheTtlSec: 0, model: "main", json: false },
  itinerary: { temperature: 0.4, maxTokens: 8000, timeoutMs: 75_000, cacheTtlSec: 600, model: "main", json: true },
  itinerary_patch: { temperature: 0.3, maxTokens: 3000, timeoutMs: 45_000, cacheTtlSec: 0, model: "main", json: true },
  expense_parse: { temperature: 0.2, maxTokens: 2000, timeoutMs: 30_000, cacheTtlSec: 0, model: "main", json: true },
  expense_text: { temperature: 0.2, maxTokens: 2000, timeoutMs: 30_000, cacheTtlSec: 0, model: "main", json: true },
  receipt_vision: { temperature: 0.2, maxTokens: 4000, timeoutMs: 75_000, cacheTtlSec: 0, model: "main", json: true },
};

export function assertModeTimeouts(routeMaxDurationSec: number): boolean {
  const capMs = (routeMaxDurationSec - 15) * 1000;
  return Object.values(INSIGHT_MODES).every((m) => m.timeoutMs <= capMs || m.timeoutMs <= 105_000);
}
