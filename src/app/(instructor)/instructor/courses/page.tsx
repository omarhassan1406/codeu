"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Edit, Trash2, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorCourses, useUpdateCourse, useDeleteCourse } from "@/features/instructors/hooks/useInstructor";
import type { InstructorCourseRow } from "@/features/instructors/types";

const statusFilters = ["All", "draft", "published", "archived"] as const;

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" }> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
};

export default function InstructorCoursesPage() {
  const { data: courses, isLoading } = useInstructorCourses();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = (courses ?? []).filter((c) => {
    if (activeFilter !== "All" && c.status !== activeFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleToggleStatus = async (course: InstructorCourseRow) => {
    const nextStatus = course.status === "published" ? "draft" : "published";
    await updateCourse.mutateAsync({ courseId: course.id, data: { status: nextStatus } });
  };

  const handleDelete = async (courseId: string) => {
    await deleteCourse.mutateAsync(courseId);
    setConfirmDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground">Manage your course catalog</p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusIcon className="size-4" />
            Create New Course
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-brand-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "All" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-3 font-medium text-foreground">No courses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || activeFilter !== "All"
              ? "Try adjusting your filters."
              : "Create your first course to get started."}
          </p>
          {!search && activeFilter === "All" && (
            <Button asChild className="mt-4">
              <Link href="/instructor/courses/new">Create Course</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Course</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Category</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Level</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Students</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr key={course.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <BookOpen className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/instructor/courses/${course.id}/edit`}
                          className="font-medium text-foreground hover:text-brand-600 truncate block"
                        >
                          {course.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          ${course.discount_price ?? course.price} &middot; {course.lesson_count} lessons
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {course.category_name}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-muted-foreground capitalize">
                      {course.level ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {course.enrollment_count}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge[course.status]?.variant ?? "secondary"}>
                      {statusBadge[course.status]?.label ?? course.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDelete === course.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(course.id)}
                          disabled={deleteCourse.isPending}
                        >
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/instructor/courses/${course.id}/edit`}>
                            <Edit className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(course)}
                          disabled={updateCourse.isPending}
                          title={course.status === "published" ? "Set to Draft" : "Publish"}
                        >
                          {course.status === "published" ? "Draft" : "Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDelete(course.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


