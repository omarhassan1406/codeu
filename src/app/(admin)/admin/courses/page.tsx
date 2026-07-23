"use client";

import { useState } from "react";
import { Search, BookOpen, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCourses, useUpdateCourseStatus, useToggleFeaturedCourse } from "@/features/admin/hooks/useAdmin";

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" }> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
};

export default function AdminCoursesPage() {
  const { data: courses, isLoading } = useAdminCourses();
  const updateStatus = useUpdateCourseStatus();
  const toggleFeatured = useToggleFeaturedCourse();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (courses ?? []).filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Moderation</h1>
        <p className="text-muted-foreground">Review and manage all platform courses.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {["all", "draft", "published", "archived"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                statusFilter === f ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Course</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Instructor</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Category</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Students</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Featured</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <BookOpen className="size-5" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">${c.discount_price ?? c.price}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{c.instructor_name}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{c.category_name}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{c.enrollment_count}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadge[c.status]?.variant ?? "secondary"}>
                    {statusBadge[c.status]?.label ?? c.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleFeatured.mutateAsync({ courseId: c.id, featured: !c.featured })}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                      c.featured ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                    }`}
                    disabled={toggleFeatured.isPending}
                  >
                    <Star className="size-4" fill={c.featured ? "currentColor" : "none"} />
                    {c.featured ? "Featured" : "Not Featured"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutateAsync({
                        courseId: c.id,
                        status: c.status === "published" ? "draft" : "published",
                      })}
                      disabled={updateStatus.isPending}
                    >
                      {c.status === "published" ? "Unpublish" : c.status === "archived" ? "Restore" : "Publish"}
                    </Button>
                    {c.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus.mutateAsync({ courseId: c.id, status: "archived" })}
                        className="text-red-500 hover:text-red-600"
                        disabled={updateStatus.isPending}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
