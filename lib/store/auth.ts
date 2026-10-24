import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthResponse, UserPayload } from "@/lib/types";

interface AuthState {
  user: UserPayload | null;
  token: string | null;
  // true після першої спроби відновити сесію (або входу/виходу); не зберігається
  initialized: boolean;
  setAuth: (data: AuthResponse) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      initialized: false,
      setAuth: (data) => set({ user: data.user, token: data.accessToken, initialized: true }),
      setToken: (token) => set({ token }),
      clearAuth: () => set({ user: null, token: null, initialized: true }),
    }),
    {
      name: "workbench-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            },
      ),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const authStore = useAuthStore;
