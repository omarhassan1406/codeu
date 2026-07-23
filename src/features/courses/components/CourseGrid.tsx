"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "./CourseCard";
import type { CourseCardData } from "@/features/courses/types";

export function CourseGrid({
  courses,
  isLoading,
}: {
  courses: CourseCardData[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-border p-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-lg font-medium text-foreground">No courses found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
