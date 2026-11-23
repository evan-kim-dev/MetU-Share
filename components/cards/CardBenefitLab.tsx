"use client";

import { useMemo, useState } from "react";
import { FlaskConical } from "lucide-react";
import { CardBenefitLabBudgetSection } from "@/components/cards/CardBenefitLabBudgetSection";
import { CardBenefitLabPlanSection } from "@/components/cards/CardBenefitLabPlanSection";
import { CardBenefitLabSourceSection } from "@/components/cards/CardBenefitLabSourceSection";
import { DEFAULT_BUDGET } from "@/components/cards/card-benefit-lab.constants";
import { demoCards } from "@/components/cards/card-benefit-lab.helpers";
import { planCardSpend } from "@/lib/cards/plan";
import { SPEND_CATEGORIES, type CardSnapshot, type SpendBudget } from "@/lib/cards/types";

export function CardBenefitLab() {
  const [source, setSource] = useState<"demo" | "codef">("demo");
  const [cards, setCards] = useState<CardSnapshot[]>(demoCards);
  const [budget, setBudget] = useState<Required<SpendBudget>>(DEFAULT_BUDGET);
  const [org, setOrg] = useState("0309");
  const [connectedId, setConnectedId] = useState("");
  const [month, setMonth] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function connectAccount() {
    setConnecting(true);
    setConnectMsg(null);
    try {
      const res = await fetch("/api/cards/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization: org, loginId: loginId.trim(), password }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        connectedId?: string;
        error?: string;
        code?: string;
        message?: string;
      };
      if (!res.ok || !json.connectedId) {
        setConnectMsg({
          ok: false,
          text:
            json.error === "unauthorized"
              ? "로그인한 뒤에 연결할 수 있어요."
              : json.error === "codef-not-configured"
                ? "서버에 CODEF 키가 없어요 (.env.local 의 CODEF_CLIENT_ID·SECRET)."
                : json.error === "codef-public-key-missing"
                  ? "서버에 CODEF 공개키가 없어요 (.env.local 의 CODEF_PUBLIC_KEY)."
                  : `${json.message ?? "연결에 실패했어요"}${json.code ? ` (${json.code})` : ""}`,
        });
        return;
      }
      setConnectedId(json.connectedId);
      setConnectMsg({
        ok: true,
        text: "연결됐어요. connectedId 를 아래 칸에 넣었어요. 저장되지 않으니 필요하면 따로 적어 두세요.",
      });
    } finally {
      // 성공·실패와 상관없이 비밀번호는 화면 상태에서 바로 지워요.
      setPassword("");
      setConnecting(false);
    }
  }

  const plan = useMemo(() => planCardSpend(cards, budget), [cards, budget]);
  const total = SPEND_CATEGORIES.reduce((s, c) => s + budget[c], 0);

  async function fetchCodef() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cards/benefits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: org,
          connectedId: connectedId.trim(),
          ...(month.trim() ? { startDate: month.trim() } : {}),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        cards?: CardSnapshot[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !json.cards) {
        setError(
          json.error === "codef-not-configured"
            ? "서버에 CODEF 키가 없어요. 예시 데이터로 시험해 주세요."
            : json.error === "unauthorized"
              ? "로그인한 뒤에 조회할 수 있어요."
              : json.message ?? `조회에 실패했어요 (${json.error ?? res.status})`
        );
        return;
      }
      setCards(json.cards);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mu-root flex min-h-0 flex-1 flex-col overflow-y-auto pb-10">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-mu-line bg-mu-card px-4">
        <FlaskConical className="h-5 w-5 text-mu-accent" strokeWidth={1.75} aria-hidden />
        <h1 className="text-mu-heading text-mu-fg">카드 혜택 계획 · 테스트</h1>
      </header>

      <div className="flex flex-col gap-6 px-4 pt-4">
        <p className="rounded-mu-md bg-mu-warn-soft px-3 py-2 text-mu-caption text-mu-warn">
          임시 테스트 화면이에요. 예시 데이터는 가상의 카드예요. CODEF 조회는 로그인과 서버 키가 필요해요.
        </p>

        <CardBenefitLabSourceSection
          source={source}
          setSource={setSource}
          setError={setError}
          setCards={setCards}
          cards={cards}
          org={org}
          setOrg={setOrg}
          loginId={loginId}
          setLoginId={setLoginId}
          password={password}
          setPassword={setPassword}
          connectAccount={connectAccount}
          connecting={connecting}
          connectMsg={connectMsg}
          connectedId={connectedId}
          setConnectedId={setConnectedId}
          month={month}
          setMonth={setMonth}
          fetchCodef={fetchCodef}
          busy={busy}
          error={error}
        />

        <CardBenefitLabBudgetSection
          budget={budget}
          setBudget={setBudget}
          total={total}
        />

        <CardBenefitLabPlanSection plan={plan} cards={cards} />
      </div>
    </div>
  );
}