"use client";

import { useCallback, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/features/auth/services/auth.service";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
} from "@/features/auth/schemas/auth.schema";

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    authService
      .getSession()
      .then((session) => {
        if (session) {
          store.setSession(session);
          store.setUser(session.user);
        }
      })
      .finally(() => store.setLoading(false));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { user } = await authService.signIn(input);
    const session = await authService.getSession();
    if (session) store.setSession(session);
    store.setUser({
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? null,
      avatarUrl: null,
    });
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await authService.signUp(input);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    await authService.signOut();
    store.reset();
  }, []);

  const resetPassword = useCallback(async (input: ForgotPasswordInput) => {
    await authService.resetPassword(input);
  }, []);

  return {
    user: store.user,
    session: store.session,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
  };
}
