"use client";

import Link from "next/link";
import { ArrowRight, Award, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEnrollments } from "@/features/enrollments/hooks/useEnrollments";
import { useMyCertificates } from "@/features/certificates/hooks/useCertificates";

export default function DashboardOverview() {
  const { data: enrollments, isLoading } = useMyEnrollments();
  const { data: certificates } = useMyCertificates();

  const activeEnrollments = enrollments?.filter((e) => e.status === "active") ?? [];
  const completedCourses = enrollments?.filter((e) => e.status === "completed") ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const stats = [
    {
      label: "Active Courses",
      value: activeEnrollments.length,
      icon: BookOpen,
      color: "text-brand-600 bg-brand-100 dark:bg-brand-900/30",
    },
    {
      label: "Completed",
      value: completedCourses.length,
      icon: Award,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Certificates",
      value: certificates?.length ?? 0,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Track your learning progress</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className={`flex size-12 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Enrollments */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Continue Learning</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/my-courses">
              View All <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-3 font-medium text-foreground">No active courses</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enroll in a course to start learning.
            </p>
            <Button asChild className="mt-4">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeEnrollments.slice(0, 5).map((enrollment) => {
              const course = enrollment.course as unknown as {
                id: string;
                title: string;
                slug: string;
                thumbnail_url: string | null;
                level: string | null;
                category?: { name: string };
              };

              return (
                <Link
                  key={enrollment.id}
                  href={`/courses/${course.slug}/learn`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <BookOpen className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {course.category?.name ?? "Course"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {enrollment.progress_percentage}%
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
