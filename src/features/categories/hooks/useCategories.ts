"use client";

import { useQuery } from "@tanstack/react-query";
import type { CategoryWithCount } from "@/features/categories/types";

async function fetchCategories(): Promise<CategoryWithCount[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}
