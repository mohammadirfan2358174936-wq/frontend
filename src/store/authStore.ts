import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, getToken, setToken, unwrap } from "@/services/apiClient";
import { authApi } from "@/services/eventApi";
import type { AuthRegisterRequest, AuthResponse, User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "anonymous";
  error: string | null;

  login: (email: string, password: string) => Promise<User>;
  register: (input: AuthRegisterRequest) => Promise<User>;
  loadMe: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

function absorb(auth: AuthResponse): Pick<AuthState, "user" | "token"> {
  setToken(auth.accessToken);
  return { user: auth.user, token: auth.accessToken };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: getToken(),
      status: getToken() ? "loading" : "anonymous",
      error: null,

      async login(email, password) {
        set({ status: "loading", error: null });
        try {
          const auth = await authApi.login({ email, password });
          set({ ...absorb(auth), status: "authenticated", error: null });
          return auth.user;
        } catch (error) {
          set({ status: "anonymous", error: messageOf(error) });
          throw error;
        }
      },

      async register(input) {
        set({ status: "loading", error: null });
        try {
          const auth = await authApi.register(input);
          set({ ...absorb(auth), status: "authenticated", error: null });
          return auth.user;
        } catch (error) {
          set({ status: "anonymous", error: messageOf(error) });
          throw error;
        }
      },

      async loadMe() {
        const token = getToken();
        if (!token) {
          set({ status: "anonymous", user: null });
          return;
        }
        try {
          const user = await unwrap<User>(apiClient.get("/auth/me"));
          set({ user, status: "authenticated", error: null });
        } catch {
          setToken(null);
          set({ user: null, token: null, status: "anonymous" });
        }
      },

      logout() {
        setToken(null);
        set({ user: null, token: null, status: "anonymous", error: null });
      },

      clearError() {
        set({ error: null });
      },
    }),
    {
      name: "eventora-auth",
      // Only the identity is persisted; the JWT lives in its own key so the
      // axios interceptor can read it synchronously without a store cycle.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

function messageOf(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

/** Convenience selectors. */
export const selectIsAuthenticated = (state: AuthState) => state.status === "authenticated";
export const selectRole = (state: AuthState) => state.user?.role ?? null;
export const selectIsOrganizer = (state: AuthState) =>
  state.user?.role === "ORGANIZER" || state.user?.role === "ADMIN";
export const selectIsAdmin = (state: AuthState) => state.user?.role === "ADMIN";
