import { apiFetch, refreshAccessToken } from "@/lib/api/fetcher";
import type { AuthResponse, Role } from "@/lib/types";

interface AuthCredentials {
  email: string;
  password: string;
}

interface RegisterData extends AuthCredentials {
  name: string;
  role: Role;
  // обов'язковий для role = "admin"
  adminCode?: string;
}

export function loginUser(data: AuthCredentials) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: data.email, password: data.password }),
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
      role: data.role,
      ...(data.role === "admin" ? { adminCode: data.adminCode } : {}),
    }),
    skipAuth: true,
  });
}

export function refreshSession() {
  return refreshAccessToken();
}

// Бекенд вимагає Bearer-токен для logout, тому skipAuth тут не ставимо.
// token — щоб завершити сесію, яку ще не збережено в сторі.
export function logoutUser(token?: string) {
  return apiFetch("/auth/logout", {
    method: "POST",
    ...(token ? { token, retry: false } : {}),
  });
}
