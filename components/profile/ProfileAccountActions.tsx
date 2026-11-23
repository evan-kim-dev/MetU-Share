"use client";

interface ProfileAccountActionsProps {
  isDeletingAccount: boolean;
  deleteError: string | null;
  deleteConfirmOpen: boolean;
  onLogout: () => void;
  onOpenDeleteConfirm: () => void;
  onCloseDeleteConfirm: () => void;
  onDeleteAccount: () => void;
}

export function ProfileAccountActions({
  isDeletingAccount,
  deleteError,
  deleteConfirmOpen,
  onLogout,
  onOpenDeleteConfirm,
  onCloseDeleteConfirm,
  onDeleteAccount,
}: ProfileAccountActionsProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onLogout}
          disabled={isDeletingAccount}
          className="w-full rounded-xl2 border border-danger-border py-3.5 text-sm font-semibold tracking-wide text-mu-err transition-colors active:bg-mu-err/5 disabled:opacity-60"
        >
          로그아웃
        </button>
        <button
          type="button"
          onClick={onOpenDeleteConfirm}
          disabled={isDeletingAccount}
          className="w-full rounded-xl2 py-3 text-sm font-semibold tracking-wide text-mu-fg-3 transition-colors active:bg-mu-sunken disabled:opacity-60"
        >
          회원 탈퇴
        </button>
        {deleteError ? (
          <p className="text-center text-xs text-mu-err">{deleteError}</p>
        ) : null}
      </div>

      {deleteConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-heading/40 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={onCloseDeleteConfirm}
        >
          <div
            className="w-full max-w-dialog rounded-xl2 bg-mu-card p-5 shadow-overlay"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="delete-account-title"
              className="text-lg font-extrabold text-mu-fg"
            >
              정말 탈퇴하시겠어요?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-mu-fg-2">
              탈퇴하면 아래 데이터가 모두 삭제되며{" "}
              <span className="font-bold text-mu-err">복구할 수 없어요.</span>
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-mu-fg-3">
              <li>프로필·닉네임·여행 취향</li>
              <li>저장한 여행 계획과 예산·일정</li>
              <li>작성한 게시글·댓글·동행 채팅</li>
              <li>알림 및 계정 로그인 정보</li>
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onCloseDeleteConfirm}
                disabled={isDeletingAccount}
                className="rounded-xl border border-mu-line py-3 text-sm font-bold text-mu-fg-2 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onDeleteAccount}
                disabled={isDeletingAccount}
                className="rounded-xl bg-mu-err py-3 text-sm font-bold text-mu-on-accent disabled:opacity-60"
              >
                {isDeletingAccount ? "탈퇴 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
