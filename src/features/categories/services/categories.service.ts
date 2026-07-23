import type { CategoryWithCount } from "@/features/categories/types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function getCategories(): Promise<CategoryWithCount[]> {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  return res.json();
}
