export const maxLoginAttempts = 5;
export const loginLockDurationMs = 15 * 60 * 1000;

type LoginAttemptState = {
  attempts: number;
  lockedUntil: number;
};

function storageKey(scope: "user" | "admin", identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  return `alisveris-login-guard:${scope}:${encodeURIComponent(normalized)}`;
}

function readState(scope: "user" | "admin", identifier: string): LoginAttemptState {
  try {
    return JSON.parse(
      window.localStorage.getItem(storageKey(scope, identifier)) ??
        '{"attempts":0,"lockedUntil":0}',
    ) as LoginAttemptState;
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

export function loginLockMessage(scope: "user" | "admin", identifier: string) {
  const state = readState(scope, identifier);
  const remainingMs = state.lockedUntil - Date.now();
  if (remainingMs <= 0) return "";
  const minutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return `5 səhv giriş cəhdinə görə hesab ${minutes} dəqiqəlik bloklanıb.`;
}

export function registerFailedLogin(scope: "user" | "admin", identifier: string) {
  const key = storageKey(scope, identifier);
  const current = readState(scope, identifier);
  const attempts = current.lockedUntil > Date.now() ? current.attempts : current.attempts + 1;
  const next: LoginAttemptState = {
    attempts,
    lockedUntil: attempts >= maxLoginAttempts ? Date.now() + loginLockDurationMs : 0,
  };
  window.localStorage.setItem(key, JSON.stringify(next));
  if (next.lockedUntil) return loginLockMessage(scope, identifier);
  return `Məlumatlar düzgün deyil. ${maxLoginAttempts - attempts} cəhd qalıb.`;
}

export function clearFailedLogins(scope: "user" | "admin", identifier: string) {
  window.localStorage.removeItem(storageKey(scope, identifier));
}
