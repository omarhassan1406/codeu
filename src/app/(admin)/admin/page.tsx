"use client";

import { DollarSign, Users, BookOpen, Star, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats, useRecentActivity } from "@/features/admin/hooks/useAdmin";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: activity } = useRecentActivity();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Revenue", value: `$${(stats?.total_revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
    { label: "Total Students", value: stats?.total_students ?? 0, icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { label: "Total Instructors", value: stats?.total_instructors ?? 0, icon: Users, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
    { label: "Active Courses", value: stats?.active_courses ?? 0, icon: BookOpen, color: "text-brand-600 bg-brand-100 dark:bg-brand-900/30" },
    { label: "Pending Drafts", value: stats?.pending_courses ?? 0, icon: BookOpen, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
    { label: "Total Enrollments", value: stats?.total_enrollments ?? 0, icon: Activity, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
    { label: "Total Reviews", value: stats?.total_reviews ?? 0, icon: Star, color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30" },
    { label: "Total Courses", value: stats?.total_courses ?? 0, icon: BookOpen, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide overview and metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
              <div className={`flex size-12 items-center justify-center rounded-lg ${card.color}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        {!activity || activity.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No recent activity.</div>
        ) : (
          <div className="divide-y divide-border">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-6 py-3">
                <div className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${
                  a.type === "enrollment" ? "bg-blue-100 text-blue-600" :
                  a.type === "review" ? "bg-amber-100 text-amber-600" :
                  "bg-green-100 text-green-600"
                }`}>
                  {a.user_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{a.user_name}</span> {a.message}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
