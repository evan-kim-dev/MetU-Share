"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useAuthActions } from "@/components/auth/useAuthActions";
import { useReducedMotion } from "@/components/auth/useReducedMotion";
import { EMAIL_RE } from "@/components/auth/email-auth-form-constants";
import type { EmailMode } from "@/components/auth/email-auth-form-types";
import { evaluatePassword } from "@/lib/auth/password-strength";
import {
  getSavedEmail,
  getSaveIdPref,
  persistSavedEmail,
  setSaveIdPref,
} from "@/lib/auth/saved-id";
import type { UserFacingError } from "@/lib/errors/user-message";

export function useEmailAuthForm(onSignedIn?: () => void) {
  const {
    signInWithEmail,
    signUpWithEmail,
    resendConfirmation,
    resetPassword,
  } = useAuthActions();
  const reduceMotion = useReducedMotion();
  const emailId = useId();
  const passwordId = useId();

  const [mode, setMode] = useState<EmailMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<UserFacingError | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [saveId, setSaveIdState] = useState(true);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const preferSave = getSaveIdPref();
    setSaveIdState(preferSave);
    if (preferSave) {
      const saved = getSavedEmail();
      if (saved) setEmail(saved);
    }
  }, []);

  const strength = evaluatePassword(password);
  const emailReady = EMAIL_RE.test(email.trim());
  const emailInvalid =
    emailTouched && email.trim().length > 0 && !emailReady;
  const passwordInvalid =
    passwordTouched &&
    password.length > 0 &&
    (mode === "signup"
      ? !strength.meetsSignupPolicy
      : !strength.meetsLoginPolicy);
  const canSubmit =
    emailReady &&
    !busy &&
    (mode === "signup"
      ? strength.meetsSignupPolicy
      : strength.meetsLoginPolicy);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setInterval(() => {
      setResendCooldown((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [resendCooldown]);

  const focusFirstError = useCallback(() => {
    if (emailInvalid || !email.trim()) {
      emailRef.current?.focus();
      return;
    }
    if (
      passwordInvalid ||
      (mode === "signup"
        ? !strength.meetsSignupPolicy
        : !strength.meetsLoginPolicy)
    ) {
      passwordRef.current?.focus();
    }
  }, [
    emailInvalid,
    passwordInvalid,
    email,
    mode,
    strength.meetsSignupPolicy,
    strength.meetsLoginPolicy,
  ]);

  const scrollFieldIntoView = (el: HTMLElement | null) => {
    if (!el || typeof el.scrollIntoView !== "function") return;
    el.scrollIntoView({
      block: "center",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!canSubmit) {
      focusFirstError();
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);

    if (mode === "login") {
      const result = await signInWithEmail(email, password);
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        focusFirstError();
        return;
      }
      setSaveIdPref(saveId);
      if (saveId) persistSavedEmail(email);
      onSignedIn?.();
      return;
    }

    const result = await signUpWithEmail(email, password);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      if (result.error.action === "switch-to-login") {
        setMode("login");
      }
      focusFirstError();
      return;
    }
    if (result.status === "confirm-email") {
      setConfirmEmail(result.email);
      setResendCooldown(60);
      setBusy(false);
      return;
    }
    onSignedIn?.();
  };

  const handleResend = async () => {
    if (!confirmEmail || resendCooldown > 0 || busy) return;
    setBusy(true);
    setError(null);
    const result = await resendConfirmation(confirmEmail);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setResendCooldown(60);
  };

  const switchMode = (next: EmailMode) => {
    setMode(next);
    setError(null);
    setInfo(null);
    setConfirmEmail(null);
    setPasswordTouched(false);
  };

  const handleFindPassword = async () => {
    setError(null);
    setInfo(null);
    setEmailTouched(true);
    if (!EMAIL_RE.test(email.trim())) {
      setInfo("비밀번호 재설정 메일을 받을 아이디(이메일)를 먼저 입력해 주세요.");
      emailRef.current?.focus();
      return;
    }
    setBusy(true);
    const result = await resetPassword(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInfo(
      `${email.trim()} 로 비밀번호 재설정 메일을 보냈어요. 메일의 링크를 확인해 주세요.`
    );
  };

  const resetConfirmFlow = () => {
    setConfirmEmail(null);
    setEmail("");
    setPassword("");
    setMode("signup");
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    scrollFieldIntoView(emailRef.current);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    scrollFieldIntoView(passwordRef.current);
  };

  return {
    emailId,
    passwordId,
    mode,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    busy,
    error,
    info,
    emailInvalid,
    passwordInvalid,
    canSubmit,
    confirmEmail,
    resendCooldown,
    saveId,
    setSaveIdState,
    emailRef,
    passwordRef,
    strength,
    handleSubmit,
    handleResend,
    switchMode,
    handleFindPassword,
    resetConfirmFlow,
    handleEmailBlur,
    handlePasswordBlur,
  };
}