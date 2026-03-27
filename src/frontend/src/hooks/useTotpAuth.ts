import { generateBase32Secret, validateTotp } from "@/lib/totp";
import { useCallback, useState } from "react";

const STORAGE_KEY = "totp_secret";
const SESSION_KEY = "totp_verified";

export type TotpStatus = "not_setup" | "setup_pending_verify" | "verified";

export interface TotpAuthState {
  status: TotpStatus;
  secret: string | null;
  setupTotp: () => void;
  verifyCode: (code: string) => Promise<boolean>;
  resetTotp: () => void;
}

function getInitialStatus(): TotpStatus {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return "not_setup";
  if (sessionStorage.getItem(SESSION_KEY) === "true") return "verified";
  return "setup_pending_verify";
}

export function useTotpAuth(): TotpAuthState {
  const [status, setStatus] = useState<TotpStatus>(getInitialStatus);
  const [secret, setSecret] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  const setupTotp = useCallback(() => {
    const newSecret = generateBase32Secret();
    localStorage.setItem(STORAGE_KEY, newSecret);
    sessionStorage.removeItem(SESSION_KEY);
    setSecret(newSecret);
    setStatus("setup_pending_verify");
  }, []);

  const verifyCode = useCallback(async (code: string): Promise<boolean> => {
    const storedSecret = localStorage.getItem(STORAGE_KEY);
    if (!storedSecret) return false;
    try {
      const valid = await validateTotp(code, storedSecret);
      if (valid) {
        sessionStorage.setItem(SESSION_KEY, "true");
        setStatus("verified");
        return true;
      }
    } catch {
      // invalid
    }
    return false;
  }, []);

  const resetTotp = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  }, []);

  return { status, secret, setupTotp, verifyCode, resetTotp };
}
