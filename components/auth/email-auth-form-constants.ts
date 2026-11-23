import type { PasswordStrengthLevel } from "@/lib/auth/password-strength";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const STRENGTH_BAR: Record<
  Exclude<PasswordStrengthLevel, "empty">,
  string
> = {
  danger: "bg-mu-err",
  weak: "bg-mu-warn",
  fair: "bg-mu-accent",
  strong: "bg-mu-ok",
};

export const STRENGTH_TEXT: Record<
  Exclude<PasswordStrengthLevel, "empty">,
  string
> = {
  danger: "text-mu-err",
  weak: "text-mu-warn",
  fair: "text-mu-accent",
  strong: "text-mu-ok",
};

export const linkBtnClass =
  "px-1 text-xs font-semibold text-ink-caption underline-offset-2 hover:text-ink-body hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50";