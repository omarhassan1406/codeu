"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  CourseCardData,
  CourseDetailData,
  CourseFiltersData,
  PaginatedResult,
} from "@/features/courses/types";

function buildQueryString(filters: CourseFiltersData): string {
  const params = new URLSearchParams();
  if (filters.categorySlug) params.set("category", filters.categorySlug);
  if (filters.level) params.set("level", filters.level);
  if (filters.price) params.set("price", filters.price);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
}

export function useCourses(filters: CourseFiltersData = {}) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async (): Promise<PaginatedResult<CourseCardData>> => {
      const qs = buildQueryString(filters);
      const res = await fetch(`/api/courses${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async (): Promise<CourseDetailData | null> => {
      const res = await fetch(`/api/courses/${slug}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedCourses(limit = 6) {
  return useQuery({
    queryKey: ["courses", "featured", limit],
    queryFn: async (): Promise<CourseCardData[]> => {
      const res = await fetch(`/api/courses?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch featured courses");
      const data: PaginatedResult<CourseCardData> = await res.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
