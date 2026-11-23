"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronRight, Globe, Wallet } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useCurrencyOptions } from "@/lib/fx/currency-list";
import {
  disablePush,
  enablePush,
  getPushSupport,
  isPushSubscribed,
} from "@/lib/push/client";

interface ProfileAppSettingsProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
}

export function ProfileAppSettings({
  currency,
  onCurrencyChange,
}: ProfileAppSettingsProps) {
  const currencyOptions = useCurrencyOptions();
  const [pushBusy, setPushBusy] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [pushReady, setPushReady] = useState(false);
  const pushSupport = getPushSupport();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!pushSupport.supported) {
        if (!cancelled) {
          setPushOn(false);
          setPushReady(true);
        }
        return;
      }
      const on = await isPushSubscribed();
      if (!cancelled) {
        setPushOn(on);
        setPushReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pushSupport.supported]);

  const handlePushToggle = async (next: boolean) => {
    if (!pushSupport.supported || pushBusy) return;
    setPushBusy(true);
    setPushMsg(null);
    const result = next ? await enablePush() : await disablePush();
    setPushBusy(false);
    if (result.ok) {
      setPushOn(next);
      setPushMsg(next ? "브라우저 푸시가 켜졌어요." : "알림을 꺼 두었어요.");
    } else {
      setPushMsg(
        next
          ? "푸시를 켜지 못했어요. 브라우저 권한을 확인해 주세요."
          : "알림을 끄지 못했어요."
      );
    }
  };

  return (
    <section className="rounded-xl2 bg-mu-card p-6 shadow-soft">
      <h3 className="mb-4 text-xl font-semibold text-mu-fg">앱 설정</h3>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-membership">
              <Wallet className="h-4 w-4 text-mu-fg-2" />
            </span>
            <div className="min-w-0">
              <p className="whitespace-nowrap text-sm font-semibold tracking-wide text-mu-fg">
                기본 통화
              </p>
              <p className="whitespace-nowrap text-sm text-mu-fg-2">
                예산 표시 단위
              </p>
            </div>
          </div>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="max-w-[10.5rem] shrink-0 rounded-lg border border-mu-line bg-mu-bg px-3 py-2 text-sm text-mu-fg focus:border-mu-accent focus:outline-none"
          >
            {!currencyOptions.some((o) => o.code === currency) ? (
              <option value={currency}>{currency}</option>
            ) : null}
            {currencyOptions.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="flex items-center justify-between border-t border-membership py-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-membership">
              <Globe className="h-4 w-4 text-mu-fg-2" />
            </span>
            <span className="text-sm font-semibold tracking-wide text-mu-fg">
              언어
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-mu-fg-2">
            한국어
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>

        <div className="flex flex-col gap-2 border-t border-membership py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-membership">
                <Bell className="h-4 w-4 text-mu-fg-2" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-wide text-mu-fg">
                  알림
                </p>
                <p className="text-sm text-mu-fg-2">
                  {pushSupport.supported
                    ? "결제·정산 푸시 알림"
                    : "이 브라우저는 푸시를 지원하지 않아요"}
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={pushOn}
              onChange={(next) => {
                void handlePushToggle(next);
              }}
              label="알림 설정"
              disabled={!pushSupport.supported || pushBusy || !pushReady}
            />
          </div>
          {pushMsg ? (
            <p className="pl-11 text-xs text-mu-fg-3" role="status">
              {pushMsg}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
