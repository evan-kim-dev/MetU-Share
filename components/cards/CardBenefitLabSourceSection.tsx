"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ds";
import { CardBenefitLabCardItem } from "@/components/cards/CardBenefitLabCardItem";
import { ORGANIZATIONS } from "@/components/cards/card-benefit-lab.constants";
import { demoCards } from "@/components/cards/card-benefit-lab.helpers";
import type { CardSnapshot } from "@/lib/cards/types";
import { cn } from "@/lib/design/tokens";

export function CardBenefitLabSourceSection({
  source,
  setSource,
  setError,
  setCards,
  cards,
  org,
  setOrg,
  loginId,
  setLoginId,
  password,
  setPassword,
  connectAccount,
  connecting,
  connectMsg,
  connectedId,
  setConnectedId,
  month,
  setMonth,
  fetchCodef,
  busy,
  error,
}: {
  source: "demo" | "codef";
  setSource: (s: "demo" | "codef") => void;
  setError: (e: string | null) => void;
  setCards: (cards: CardSnapshot[]) => void;
  cards: CardSnapshot[];
  org: string;
  setOrg: (v: string) => void;
  loginId: string;
  setLoginId: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  connectAccount: () => Promise<void>;
  connecting: boolean;
  connectMsg: { ok: boolean; text: string } | null;
  connectedId: string;
  setConnectedId: (v: string) => void;
  month: string;
  setMonth: (v: string) => void;
  fetchCodef: () => Promise<void>;
  busy: boolean;
  error: string | null;
}) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby="lab-source">
      <h2 id="lab-source" className="text-mu-heading text-mu-fg">
        1. 카드 데이터
      </h2>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="데이터 출처">
        {(["demo", "codef"] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={source === s}
            onClick={() => {
              setSource(s);
              setError(null);
              if (s === "demo") setCards(demoCards());
            }}
            className={cn(
              "mu-focus min-h-tap rounded-mu-md border px-3 text-mu-label font-bold",
              source === s
                ? "border-mu-accent bg-mu-accent-soft text-mu-accent"
                : "border-mu-line bg-mu-card text-mu-fg-2"
            )}
          >
            {s === "demo" ? "예시 데이터" : "CODEF 실제 조회"}
          </button>
        ))}
      </div>

      {source === "codef" ? (
        <div className="flex flex-col gap-2 rounded-mu-xl border border-mu-line bg-mu-card p-4">
          <label className="flex flex-col gap-1 text-mu-label text-mu-fg-2">
            카드사
            <select
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            >
              {ORGANIZATIONS.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label} ({o.code})
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2 rounded-mu-md bg-mu-sunken p-3">
            <p className="text-mu-label font-bold text-mu-fg">카드사 계정 연결 (처음 한 번)</p>
            <p className="text-mu-caption text-mu-fg-3">
              카드사 홈페이지 아이디·비밀번호를 직접 입력해요. 비밀번호는 서버에서 CODEF 공개키로 바로 암호화해 보내고, 저장하거나 기록하지 않아요.
            </p>
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="카드사 아이디"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-label="카드사 아이디"
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="카드사 비밀번호"
              autoComplete="new-password"
              aria-label="카드사 비밀번호"
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            />
            <Button
              variant="secondary"
              onClick={() => void connectAccount()}
              loading={connecting}
              disabled={!loginId.trim() || !password}
            >
              connectedId 만들기
            </Button>
            {connectMsg ? (
              <p
                role={connectMsg.ok ? "status" : "alert"}
                className={cn("text-mu-caption", connectMsg.ok ? "text-mu-ok" : "text-mu-err")}
              >
                {connectMsg.text}
              </p>
            ) : null}
          </div>

          <label className="flex flex-col gap-1 text-mu-label text-mu-fg-2">
            connectedId
            <input
              value={connectedId}
              onChange={(e) => setConnectedId(e.target.value)}
              placeholder="CODEF 계정등록으로 받은 값"
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            />
          </label>
          <label className="flex flex-col gap-1 text-mu-label text-mu-fg-2">
            조회 월 (선택, YYYYMM)
            <input
              value={month}
              onChange={(e) =>
                setMonth(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              inputMode="numeric"
              placeholder="비우면 이번 달"
              className="mu-focus min-h-tap rounded-mu-md border border-mu-line bg-mu-card px-3 text-mu-body text-mu-fg"
            />
          </label>
          <p className="text-mu-caption text-mu-fg-3">
            이미 받은 connectedId 가 있으면 위 연결 없이 바로 넣어도 돼요.
          </p>
          <Button onClick={() => void fetchCodef()} loading={busy} disabled={!connectedId.trim()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            실적·혜택 조회
          </Button>
          {error ? (
            <p role="alert" className="text-mu-caption text-mu-err">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {cards.map((c) => (
          <CardBenefitLabCardItem key={c.id} card={c} />
        ))}
      </ul>
    </section>
  );
}