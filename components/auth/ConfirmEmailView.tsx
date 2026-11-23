import { Loader2 } from "lucide-react";
import { AuthMessage } from "@/components/auth/AuthMessage";
import type { UserFacingError } from "@/lib/errors/user-message";

type ConfirmEmailViewProps = {
  confirmEmail: string;
  error: UserFacingError | null;
  resendCooldown: number;
  busy: boolean;
  formPad: string;
  className: string;
  onResend: () => void;
  onUseOtherEmail: () => void;
};

export function ConfirmEmailView({
  confirmEmail,
  error,
  resendCooldown,
  busy,
  formPad,
  className,
  onResend,
  onUseOtherEmail,
}: ConfirmEmailViewProps) {
  return (
    <div
      role="status"
      className={[
        "flex flex-col gap-2.5 rounded-2xl border border-line-soft bg-surface-white/95 shadow-sm backdrop-blur-sm",
        formPad,
        className,
      ].join(" ")}
    >
      <div className="text-left">
        <p className="text-sm font-bold text-ink-heading">확인 메일을 보냈어요</p>
        <p className="mt-1.5 text-sm leading-5 text-ink-body">
          {confirmEmail} 로 보낸 메일의 &apos;이메일 확인&apos;을 누르면 가입이
          끝나요. 메일이 안 보이면 스팸함도 확인해 주세요.
        </p>
      </div>
      {error ? (
        <AuthMessage kind="error">{error.message}</AuthMessage>
      ) : null}
      <button
        type="button"
        disabled={resendCooldown > 0 || busy}
        aria-busy={busy}
        onClick={onResend}
        className="relative flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-surface-white disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {resendCooldown > 0
          ? `다시 보내기 (${resendCooldown}초)`
          : "확인 메일 다시 보내기"}
      </button>
      <button
        type="button"
        onClick={onUseOtherEmail}
        className="min-h-11 w-full rounded-xl border border-line-soft bg-surface-white text-sm font-semibold text-ink-body"
      >
        다른 이메일로 가입
      </button>
    </div>
  );
}