import type { UserFacingError } from "@/lib/errors/user-message";
import type { ConnectErrorState } from "@/lib/onboarding/connect-machine";

export type TokenRes = {
  token: string;
  id: string;
  createdAt?: string;
  revokedCount?: number;
};

export type TokensListRes = {
  tokens: Array<{
    id: string;
    label: string;
    revoked: boolean;
  }>;
};

export type TestRes = { ok?: boolean; duplicate?: boolean };

export function toConnectError(e: UserFacingError): ConnectErrorState {
  return {
    code: e.code,
    message: e.message,
    retryable: e.retryable,
    retryAfterSec: e.retryAfterSec,
    action: e.action,
    operatorHint: e.operatorHint,
  };
}