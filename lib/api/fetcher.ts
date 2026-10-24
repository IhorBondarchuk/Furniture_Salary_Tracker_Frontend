import { authStore } from "@/lib/store/auth";
import type { AuthResponse, UserPayload } from "@/lib/types";

export interface ApiOptions extends RequestInit {
  retry?: boolean;
  skipAuth?: boolean;
  token?: string | null;
}

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://furniture-salary-tracker-beckend.onrender.com/api"
).replace(/\/+$/, "");

let refreshPromise: Promise<string> | null = null;

async function requestNewAccessToken() {
  const tokenBeforeRefresh = authStore.getState().token;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Session refresh failed");
    }

    // /auth/refresh повертає лише accessToken, користувача беремо з /auth/current
    const { accessToken } = (await response.json()) as Pick<AuthResponse, "accessToken">;
    const userResponse = await fetch(`${API_BASE}/auth/current`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Session refresh failed");
    }

    const user = (await userResponse.json()) as UserPayload;
    authStore.getState().setAuth({ accessToken, user });
    return accessToken;
  } catch (error) {
    // Не скидаємо сесію, якщо користувач встиг увійти, поки refresh був у процесі.
    if (authStore.getState().token === tokenBeforeRefresh) {
      authStore.getState().clearAuth();
    }
    throw error;
  }
}

// Усі одночасні виклики чекають на один запит, щоб ротація refresh-токена не ламала сесію.
export function refreshAccessToken() {
  refreshPromise ??= requestNewAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

function parseBody(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(endpoint: string, options: ApiOptions = {}) {
  const token = options.token ?? authStore.getState().token;
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  } as Record<string, string>;

  if (!options.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    });
  } catch {
    // fetch падає лише без відповіді: сервер вимкнений, немає мережі або CORS
    throw new Error("Сервер недоступний. Перевірте з'єднання та спробуйте ще раз.");
  }

  if (response.status === 401 && !options.skipAuth && options.retry !== false) {
    const nextToken = await refreshAccessToken();
    return apiFetch<T>(endpoint, { ...options, retry: false, token: nextToken });
  }

  const data = parseBody(await response.text());

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || "Network error");
  }

  return data as T;
}
