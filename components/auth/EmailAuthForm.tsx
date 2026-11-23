"use client";

import { Check, Loader2 } from "lucide-react";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { ConfirmEmailView } from "@/components/auth/ConfirmEmailView";
import { linkBtnClass } from "@/components/auth/email-auth-form-constants";
import {
  type EmailAuthFormProps,
} from "@/components/auth/email-auth-form-types";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useEmailAuthForm } from "@/components/auth/useEmailAuthForm";
import {
  persistSavedEmail,
  setSaveIdPref,
} from "@/lib/auth/saved-id";

export type { EmailAuthFormProps } from "@/components/auth/email-auth-form-types";

export function EmailAuthForm({
  variant = "full",
  onSignedIn,
  className = "",
}: EmailAuthFormProps) {
  const form = useEmailAuthForm(onSignedIn);

  const compact = variant === "compact";
  const formPad = compact ? "p-2.5 gap-1.5" : "p-3 gap-2";
  const fieldHeight =
    "min-h-11 rounded-xl border border-line-soft bg-surface-base px-3 text-sm text-ink-heading outline-none placeholder:text-ink-caption focus:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-60";

  if (form.confirmEmail) {
    return (
      <ConfirmEmailView
        confirmEmail={form.confirmEmail}
        error={form.error}
        resendCooldown={form.resendCooldown}
        busy={form.busy}
        formPad={formPad}
        className={className}
        onResend={() => void form.handleResend()}
        onUseOtherEmail={form.resetConfirmFlow}
      />
    );
  }

  return (
    <form
      onSubmit={(e) => void form.handleSubmit(e)}
      className={[
        "flex flex-col rounded-2xl border border-line-soft bg-surface-white/95 shadow-sm backdrop-blur-sm animate-fade-up",
        formPad,
        className,
      ].join(" ")}
      noValidate
    >
      {form.error ? (
        <AuthMessage kind="error">{form.error.message}</AuthMessage>
      ) : null}
      {form.info ? <AuthMessage kind="info">{form.info}</AuthMessage> : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={form.emailId} className="flex flex-col gap-1 text-left">
          <span className="text-xs font-bold text-ink-caption">아이디</span>
          <input
            ref={form.emailRef}
            id={form.emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={form.email}
            onChange={(e) => form.setEmail(e.target.value)}
            onBlur={form.handleEmailBlur}
            disabled={form.busy}
            placeholder="you@example.com"
            aria-invalid={form.emailInvalid}
            aria-describedby={
              form.emailInvalid ? `${form.emailId}-err` : undefined
            }
            className={fieldHeight}
          />
          {form.emailInvalid ? (
            <span id={`${form.emailId}-err`} className="text-xs text-danger">
              이메일 형식을 확인해 주세요.
            </span>
          ) : null}
        </label>

        <div className="flex flex-col gap-1 text-left">
          <label
            htmlFor={form.passwordId}
            className="text-xs font-bold text-ink-caption"
          >
            비밀번호
          </label>
          <div className="relative">
            <input
              ref={form.passwordRef}
              id={form.passwordId}
              type={form.showPassword ? "text" : "password"}
              autoComplete={
                form.mode === "signup" ? "new-password" : "current-password"
              }
              required
              minLength={form.mode === "signup" ? 8 : 6}
              value={form.password}
              onChange={(e) => form.setPassword(e.target.value)}
              onBlur={form.handlePasswordBlur}
              disabled={form.busy}
              placeholder={
                form.mode === "signup"
                  ? "8자 이상, 영문·숫자·특수문자"
                  : "비밀번호"
              }
              aria-invalid={form.passwordInvalid}
              aria-describedby={
                [
                  form.mode === "signup" && form.password.length > 0
                    ? `${form.passwordId}-strength`
                    : null,
                  form.passwordInvalid ? `${form.passwordId}-err` : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              className={`${fieldHeight} w-full pr-14`}
            />
            <button
              type="button"
              onClick={() => form.setShowPassword((v) => !v)}
              aria-pressed={form.showPassword}
              aria-label={
                form.showPassword ? "비밀번호 숨기기" : "비밀번호 표시"
              }
              className="absolute right-0.5 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg px-2 text-xs font-bold text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              {form.showPassword ? "숨기기" : "표시"}
            </button>
          </div>

          <nav
            aria-label="계정 도움말"
            className="flex min-h-9 items-center justify-between gap-2"
          >
            {form.mode === "login" ? (
              <label className="flex min-h-11 cursor-pointer items-center gap-1.5 text-xs font-semibold text-ink-caption">
                <input
                  type="checkbox"
                  checked={form.saveId}
                  disabled={form.busy}
                  onChange={(e) => {
                    const next = e.target.checked;
                    form.setSaveIdState(next);
                    setSaveIdPref(next);
                    if (next && form.email.trim()) persistSavedEmail(form.email);
                  }}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={[
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition",
                    form.saveId
                      ? "border-mu-accent bg-mu-accent text-white"
                      : "border-line-soft bg-surface-white text-transparent",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40",
                    "peer-disabled:opacity-50",
                  ].join(" ")}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                아이디 저장
              </label>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={form.busy}
                onClick={() => void form.handleFindPassword()}
                className={linkBtnClass}
              >
                비밀번호 찾기
              </button>
              <span className="text-xs text-ink-caption" aria-hidden>
                |
              </span>
              <button
                type="button"
                onClick={() =>
                  form.switchMode(form.mode === "login" ? "signup" : "login")
                }
                className={linkBtnClass}
              >
                {form.mode === "login" ? "회원가입" : "로그인"}
              </button>
            </div>
          </nav>

          {form.mode === "signup" ? (
            <PasswordStrengthMeter
              passwordId={form.passwordId}
              password={form.password}
              strength={form.strength}
            />
          ) : null}

          {form.passwordInvalid ? (
            <span id={`${form.passwordId}-err`} className="text-xs text-danger">
              {form.mode === "signup"
                ? "비밀번호 규칙을 모두 채워 주세요."
                : "비밀번호는 6자 이상이에요."}
            </span>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={!form.canSubmit}
          aria-busy={form.busy}
          className="relative mt-0.5 flex min-h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand text-sm font-bold text-surface-white transition-transform active:scale-99 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          {form.busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {form.busy
            ? "확인 중…"
            : form.mode === "signup"
              ? "가입하기"
              : "로그인"}
        </button>
      </div>
    </form>
  );
}