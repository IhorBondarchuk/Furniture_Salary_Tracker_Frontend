import { apiFetch, refreshAccessToken } from "@/lib/api/fetcher";
import type { AuthResponse, Role } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface AuthCredentials {
  email: string;
  password: string;
  // роль має збігатися з роллю акаунта; adminCode обов'язковий для "admin"
  role: Role;
  adminCode?: string;
}

interface RegisterData extends AuthCredentials {
  name: string;
}

// Повідомлення бекенду (англійською) → ключ перекладу
const AUTH_ERRORS: Record<string, keyof Dictionary["auth"]["server"]> = {
  "Email or password is wrong": "wrongCredentials",
  "Email already in use": "emailInUse",
  "Invalid admin code": "invalidAdminCode",
  "This account is not an admin": "notAdmin",
  "This is an admin account": "isAdmin",
};

export function translateAuthError(t: Dictionary, message?: string) {
  const key = message ? AUTH_ERRORS[message] : undefined;
  return key ? t.auth.server[key] : message;
}

function roleFields(data: AuthCredentials) {
  return data.role === "admin" ? { role: data.role, adminCode: data.adminCode } : { role: data.role };
}

export function loginUser(data: AuthCredentials) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: data.email, password: data.password, ...roleFields(data) }),
    skipAuth: true,
  });
}

export function registerUser(data: RegisterData) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      ...roleFields(data),
    }),
    skipAuth: true,
  });
}

export function refreshSession() {
  return refreshAccessToken();
}

// Бекенд вимагає Bearer-токен для logout, тому skipAuth тут не ставимо.
export function logoutUser() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}
