"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ds";
import { PARSE_INTENT_TEXT_MAX } from "@/lib/onboarding/parse-intent";
import type { OnboardingForm } from "@/lib/onboarding/types";

export function ConfirmPlanNlFill({
  form,
  freeText,
  onFreeTextChange,
  onChange,
}: {
  form: OnboardingForm;
  freeText: string;
  onFreeTextChange: (value: string) => void;
  onChange: (patch: Partial<OnboardingForm>) => void;
}) {
  const [parsing, setParsing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fillFromNl = async () => {
    const text = freeText.trim();
    if (!text || parsing) return;
    setParsing(true);
    setNotice(null);
    try {
      const res = await fetch("/api/onboarding/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, form }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        form?: OnboardingForm;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.form) {
        setNotice("채우기에 실패했어요. 직접 골라 주세요.");
        return;
      }
      const { budget: _keep, ...rest } = data.form;
      onChange(rest);
      setNotice(data.message ?? "아래를 채워 두었어요.");
    } catch {
      setNotice("채우기에 실패했어요. 직접 골라 주세요.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-mu-label font-semibold text-mu-fg">
        AI에게 한 줄로 말해 주세요
      </span>
      <div className="flex gap-2">
        <input
          type="text"
          value={freeText}
          onChange={(e) =>
            onFreeTextChange(e.target.value.slice(0, PARSE_INTENT_TEXT_MAX))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void fillFromNl();
            }
          }}
          placeholder="예: 오사카 3박 2인, 맛집 위주로"
          maxLength={PARSE_INTENT_TEXT_MAX}
          disabled={parsing}
          aria-label="여행 한 줄 입력"
          className="mu-focus min-h-tap min-w-0 flex-1 rounded-mu-lg border border-mu-line bg-mu-card px-4 text-mu-body text-mu-fg placeholder:text-mu-fg-3"
        />
        <Button
          type="button"
          variant="primary"
          size="md"
          className="shrink-0 rounded-mu-lg px-3"
          disabled={!freeText.trim() || parsing}
          loading={parsing}
          onClick={() => {
            void fillFromNl();
          }}
          aria-label="AI로 채우기"
        >
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" aria-hidden />
            채우기
          </span>
        </Button>
      </div>
      {notice ? (
        <p className="text-mu-caption text-mu-fg-2" role="status">
          {notice}
        </p>
      ) : (
        <p className="text-mu-caption text-mu-fg-3">
          Enter 또는 채우기를 누르면 아래 항목을 채워 드려요.
        </p>
      )}
    </div>
  );
}
