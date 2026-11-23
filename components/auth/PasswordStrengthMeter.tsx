import { Check } from "lucide-react";
import {
  STRENGTH_BAR,
  STRENGTH_TEXT,
} from "@/components/auth/email-auth-form-constants";
import type { evaluatePassword } from "@/lib/auth/password-strength";

type StrengthResult = ReturnType<typeof evaluatePassword>;

type PasswordStrengthMeterProps = {
  passwordId: string;
  password: string;
  strength: StrengthResult;
};

export function PasswordStrengthMeter({
  passwordId,
  password,
  strength,
}: PasswordStrengthMeterProps) {
  if (password.length === 0 || strength.level === "empty") {
    return null;
  }

  const level = strength.level;

  return (
    <>
      <div
        id={`${passwordId}-strength`}
        className="flex flex-col gap-1.5"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-caption">보안 강도</span>
          <span
            className={["text-xs font-bold", STRENGTH_TEXT[level]].join(" ")}
          >
            {strength.label}
          </span>
        </div>
        <div
          className="grid grid-cols-4 gap-1"
          role="meter"
          aria-label="비밀번호 보안 강도"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={strength.score}
          aria-valuetext={strength.label}
        >
          {([1, 2, 3, 4] as const).map((step) => (
            <span
              key={step}
              className={[
                "h-1.5 rounded-full transition-colors duration-mu-fast",
                strength.score >= step
                  ? STRENGTH_BAR[level]
                  : "bg-mu-sunken",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      <ul
        className="grid grid-cols-2 gap-x-2 gap-y-1"
        aria-label="비밀번호 규칙"
      >
        {strength.rules.map((rule) => (
          <li
            key={rule.id}
            className={[
              "flex items-center gap-1.5 text-xs",
              rule.ok
                ? "font-semibold text-mu-ok"
                : "text-ink-caption",
            ].join(" ")}
          >
            {rule.ok ? (
              <Check
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={2.5}
                aria-hidden
              />
            ) : (
              <span
                className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-mu-line"
                aria-hidden
              />
            )}
            {rule.label}
          </li>
        ))}
      </ul>
    </>
  );
}