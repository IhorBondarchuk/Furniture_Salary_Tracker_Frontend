import { apiFetch } from "@/lib/api/fetcher";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface Credentials {
  login: string;
  password: string;
}

// Повідомлення бекенду (англійською) → ключ перекладу
const AUTH_ERRORS: Record<string, keyof Dictionary["auth"]["server"]> = {
  "Wrong login or password": "wrongCredentials",
  "Too many login attempts, try again later": "tooManyAttempts",
};

export function translateAuthError(t: Dictionary, message?: string) {
  const key = message ? AUTH_ERRORS[message] : undefined;
  return key ? t.auth.server[key] : message;
}

export function loginRequest(credentials: Credentials) {
  return apiFetch<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
