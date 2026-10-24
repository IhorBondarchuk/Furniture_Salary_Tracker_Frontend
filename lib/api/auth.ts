import { apiFetch, refreshAccessToken } from "@/lib/api/fetcher";
import type { AuthResponse, Role } from "@/lib/types";

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

const AUTH_ERRORS: Record<string, string> = {
  "Email or password is wrong": "Невірна електронна пошта або пароль",
  "Email already in use": "Ця електронна пошта вже зареєстрована",
  "Invalid admin code": "Невірний код адміністратора",
  "This account is not an admin": "Цей обліковий запис не має прав адміністратора",
  "This is an admin account": "Це обліковий запис адміністратора — оберіть роль «Адміністратор»",
};

export function translateAuthError(message?: string) {
  return (message && AUTH_ERRORS[message]) || message;
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
