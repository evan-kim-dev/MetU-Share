export type ChatMsg = { id: string; role: "buddy" | "user"; text: string };

export type EasterEggContextValue = {
  showToast: (message: string) => void;
  summonBuddy: (greeting?: string) => void;
};

export const TOAST_MS = 2500;

export const QUICK_CHIPS = [
  { id: "chat", label: "뭐 도와줄 수 있어?" },
  { id: "budget", label: "예산 조언" },
  { id: "idea", label: "아이디어 좀" },
  { id: "metu", label: "Met U?" },
] as const;
