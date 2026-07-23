"use client";

import Link from "next/link";
import { BookOpen, DollarSign, Users, Star, ArrowRight, User, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorStats, useRecentEnrollments } from "@/features/instructors/hooks/useInstructor";

export default function InstructorDashboard() {
  const { data: stats, isLoading: statsLoading } = useInstructorStats();
  const { data: recentEnrollments, isLoading: enrollmentsLoading } = useRecentEnrollments();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const metricCards = [
    {
      label: "Total Earnings",
      value: `$${(stats?.total_earnings ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Enrolled Students",
      value: stats?.total_students ?? 0,
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Active Courses",
      value: stats?.published_courses ?? 0,
      icon: BookOpen,
      color: "text-brand-600 bg-brand-100 dark:bg-brand-900/30",
    },
    {
      label: "Average Rating",
      value: stats?.average_rating ?? 0,
      icon: Star,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
      suffix: stats && stats.total_reviews > 0 ? ` (${stats.total_reviews})` : "",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Your teaching overview</p>
        </div>
          <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusIcon className="size-4" />
            Create New Course
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className={`flex size-12 items-center justify-center rounded-lg ${card.color}`}>
                <Icon className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                  {"suffix" in card ? <span className="text-sm font-normal text-muted-foreground">{card.suffix}</span> : null}
                </p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Enrollments</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/instructor/courses">
              View All <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        {enrollmentsLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : !recentEnrollments || recentEnrollments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-3 font-medium text-foreground">No enrollments yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              When students enroll in your courses, they will appear here.
            </p>
            <Button asChild className="mt-4">
              <Link href="/instructor/courses/new">Create Your First Course</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Course</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {enrollment.student_avatar ? (
                            <img src={enrollment.student_avatar} alt="" className="size-full rounded-full object-cover" />
                          ) : (
                            <User className="size-4" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{enrollment.student_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/instructor/courses`}
                        className="text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {enrollment.course_title}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


