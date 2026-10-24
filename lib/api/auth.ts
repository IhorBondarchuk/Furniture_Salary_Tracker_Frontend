import { apiFetch, refreshAccessToken } from "@/lib/api/fetcher";
import type { AuthResponse } from "@/lib/types";

interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

export function loginUser(data: AuthCredentials) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: data.email, password: data.password }),
    skipAuth: true,
  });
}

export function registerUser(data: AuthCredentials) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
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
