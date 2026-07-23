import { create } from "zustand";
import type { AuthUser, AuthSession, AuthState } from "@/features/auth/types";

type AuthStoreActions = {
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
};

type AuthStore = AuthState & AuthStoreActions;

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setSession: (session) => set({ session }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),
}));
