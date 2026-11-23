import type { ExpenseDraftInput } from "@/lib/ledger/draft";
import { todayIsoDate } from "@/lib/shared/dates";

import type { EntryIntent } from "./ledger-shell-types";

export function readEntryIntent(params: URLSearchParams): EntryIntent | null {
  const add = params.get("add");
  if (
    add === "manual" ||
    add === "receipt" ||
    add === "voice" ||
    add === "cash"
  ) {
    return add;
  }
  if (params.get("settings") === "fx") return "settings-fx";
  return null;
}

export function newManualDraft(): ExpenseDraftInput {
  return {
    source: "manual",
    origin: "manual",
    merchant: "",
    amount: null,
    currency: "KRW",
    spentOn: todayIsoDate(),
    category: "기타",
    paymentMethod: "card",
    kind: "approval",
  };
}