"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CourseFiltersData } from "@/features/courses/types";

interface CourseFiltersProps {
  filters: CourseFiltersData;
  categories: { slug: string; name: string }[];
  onFilterChange: (filters: CourseFiltersData) => void;
}

const levels = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const prices = [
  { value: "", label: "All Prices" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function CourseFilters({ filters, categories, onFilterChange }: CourseFiltersProps) {
  const update = (key: keyof CourseFiltersData, value: string | undefined) => {
    onFilterChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={filters.search ?? ""}
          onChange={(e) => update("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <select
        value={filters.categorySlug ?? ""}
        onChange={(e) => update("categorySlug", e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={filters.level ?? ""}
        onChange={(e) => update("level", e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
      >
        {levels.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      <select
        value={filters.price ?? ""}
        onChange={(e) => update("price", e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
      >
        {prices.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {(filters.search || filters.categorySlug || filters.level || filters.price) && (
        <Button variant="ghost" size="sm" onClick={() => onFilterChange({ page: 1 })}>
          Clear
        </Button>
      )}
    </div>
  );
}
