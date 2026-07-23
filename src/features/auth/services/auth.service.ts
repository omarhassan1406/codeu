import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { LoginInput, RegisterInput, ForgotPasswordInput } from "../schemas/auth.schema";
import type { AuthUser, AuthSession } from "../types";

function mapUser(raw: User): AuthUser {
  return {
    id: raw.id,
    email: raw.email ?? "",
    name: raw.user_metadata?.name ?? null,
    avatarUrl: raw.user_metadata?.avatar_url ?? raw.app_metadata?.avatar_url ?? null,
  };
}

export const authService = {
  async signIn(input: LoginInput) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(input);
    if (error) throw error;
    return data;
  },

  async signUp(input: RegisterInput) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { name: input.name } },
    });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(input: ForgotPasswordInput) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  async getSession(): Promise<AuthSession | null> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return {
      user: mapUser(data.session.user),
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at ?? null,
    };
  },

  async getUser(): Promise<AuthUser | null> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return mapUser(data.user);
  },
};
