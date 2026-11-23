import type { TripRecommendation } from "@/lib/ai/types";

export interface RecommendResultProps {
  plan: TripRecommendation;
  /** true면 폴백을 먼저 보여주고 뒤에서 AI 보강 */
  enrich?: boolean;
  /**
   * true면 FX 배지에 VERIFY 예시(+2.5%)를 명시 적용.
   * 1초 데모·샘플 직행용. 일반 온보딩은 수수료 미설정(0).
   */
  demoFxExample?: boolean;
}
