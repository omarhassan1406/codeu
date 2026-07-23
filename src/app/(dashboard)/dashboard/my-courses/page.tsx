"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEnrollments } from "@/features/enrollments/hooks/useEnrollments";

const tabs = [
  { value: "all", label: "All Courses" },
  { value: "active", label: "In Progress" },
  { value: "completed", label: "Completed" },
] as const;

export default function MyCoursesPage() {
  const { data: enrollments, isLoading } = useMyEnrollments();
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered = (enrollments ?? []).filter((e) => {
    if (activeTab === "all") return true;
    return e.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Courses</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-brand-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-3 font-medium text-foreground">No courses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "all"
              ? "You are not enrolled in any courses yet."
              : `No ${activeTab} courses.`}
          </p>
          <Button asChild className="mt-4">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((enrollment) => {
            const course = enrollment.course as unknown as {
              id: string;
              title: string;
              slug: string;
              thumbnail_url: string | null;
              level: string | null;
              category?: { name: string };
            };
            const isCompleted = enrollment.status === "completed";

            return (
              <Link
                key={enrollment.id}
                href={`/courses/${course.slug}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <BookOpen className="size-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">{course.title}</h3>
                    {isCompleted && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Completed
                      </Badge>
                    )}
                    {course.level && (
                      <Badge variant="secondary" className="text-xs shrink-0 capitalize">
                        {course.level}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {course.category?.name ?? "Course"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 max-w-xs overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? "bg-green-500" : "bg-brand-600"
                        }`}
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {enrollment.progress_percentage}%
                    </span>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
