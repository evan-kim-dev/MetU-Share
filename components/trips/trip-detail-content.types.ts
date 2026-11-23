/** 일정·요약은 인페이지. 가계부·정산은 TripJourney(/ledger) 단일 쉘. */
export type DetailTab = "summary" | "schedule";

export type NavTab = DetailTab | "ledger" | "settle" | "photos";

export interface TripDetailContentProps {
  tripId: string;
}