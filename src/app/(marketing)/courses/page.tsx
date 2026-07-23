"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CourseGrid } from "@/features/courses/components/CourseGrid";
import { CourseFilters } from "@/features/courses/components/CourseFilters";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useCourses } from "@/features/courses/hooks/useCourses";
import type { CourseFiltersData } from "@/features/courses/types";

function CoursesContent() {
  const searchParams = useSearchParams();
  const { data: categories } = useCategories();

  const [filters, setFilters] = useState<CourseFiltersData>({
    categorySlug: searchParams.get("category") ?? undefined,
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useCourses(filters);

  const categoryOptions = (categories ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Courses</h1>
        <p className="mt-1 text-muted-foreground">
          {data ? `${data.total} courses available` : "Browse our catalog"}
        </p>
      </div>

      <div className="mb-8">
        <CourseFilters filters={filters} categories={categoryOptions} onFilterChange={setFilters} />
      </div>

      <CourseGrid courses={data?.data ?? []} isLoading={isLoading} />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
          >
            Previous
          </Button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === data.totalPages || Math.abs(p - (filters.page ?? 1)) <= 1
            )
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-1">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-muted-foreground">&hellip;</span>
                )}
                <Button
                  variant={p === filters.page ? "default" : "outline"}
                  size="sm"
                  className="min-w-[36px]"
                  onClick={() => setFilters({ ...filters, page: p })}
                >
                  {p}
                </Button>
              </span>
            ))}

          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === data.totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense>
      <CoursesContent />
    </Suspense>
  );
}
