import type { TravelStyle } from "@/lib/onboarding/types";

export const DEST_PRESETS = [
  "오사카",
  "도쿄",
  "후쿠오카",
  "방콕",
  "다낭",
  "제주",
] as const;

export const STYLE_OPTIONS: Array<{ value: TravelStyle; label: string }> = [
  { value: "healing", label: "힐링" },
  { value: "sightseeing", label: "관광" },
  { value: "food", label: "맛집" },
  { value: "shopping", label: "쇼핑" },
  { value: "activity", label: "액티비티" },
  { value: "culture", label: "문화" },
  { value: "nature", label: "자연" },
  { value: "hotplace", label: "핫플" },
];
