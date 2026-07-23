"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/features/auth/types";
import { authService } from "@/features/auth/services/auth.service";

const profileSchema = z.object({
  name: z.string().min(2).max(100),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    authService.getUser().then((u) => {
      setUser(u);
      if (u) profileForm.setValue("name", u.name ?? "");
      setLoading(false);
    });
  }, []);

  const handleProfileUpdate = async (data: ProfileInput) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { name: data.name },
      });
      if (error) throw error;
      setUser((prev) => (prev ? { ...prev, name: data.name } : prev));
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (data: PasswordInput) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (error) throw error;
      toast.success("Password updated");
      passwordForm.reset();
    } catch {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full max-w-lg rounded-xl" />
      </div>
    );
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Profile */}
      <div className="max-w-lg space-y-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Profile</h2>

        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user?.avatarUrl ?? undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            <Camera className="size-4" />
            Change Photo
          </Button>
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...profileForm.register("name")} />
            {profileForm.formState.errors.name && (
              <p className="text-xs text-destructive">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <Button type="submit" loading={saving}>
            <Save className="size-4" />
            Save Changes
          </Button>
        </form>
      </div>

      {/* Password */}
      <div className="max-w-lg space-y-6 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Change Password</h2>

        <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...passwordForm.register("currentPassword")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-xs text-destructive">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...passwordForm.register("confirmPassword")}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" loading={saving}>
            <Save className="size-4" />
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
