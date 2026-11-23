import { useAuthStore } from "@/lib/store/auth";
import { getDictionary } from "@/lib/store/locale";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://furniture-salary-tracker-beckend.onrender.com/api"
).replace(/\/+$/, "");

function parseBody(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const token = useAuthStore.getState().token;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    // fetch падає лише без відповіді: сервер вимкнений, немає мережі або CORS
    throw new Error(getDictionary().errors.network);
  }

  // Токен прострочений або недійсний — виходимо; AuthGate переведе на /login
  if (response.status === 401 && token) {
    useAuthStore.getState().clearToken();
  }

  const data = parseBody(await response.text());

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || "Network error");
  }

  return data as T;
}
