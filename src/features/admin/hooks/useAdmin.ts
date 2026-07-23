"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/features/admin/services/admin.service";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getAdminStats(),
    staleTime: 60_000,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminService.getAdminUsers(),
    staleTime: 30_000,
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminCourses() {
  return useQuery({
    queryKey: ["admin", "courses"],
    queryFn: () => adminService.getAdminCourses(),
    staleTime: 30_000,
  });
}

export function useUpdateCourseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, status }: { courseId: string; status: string }) =>
      adminService.updateCourseStatus(courseId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}

export function useToggleFeaturedCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, featured }: { courseId: string; featured: boolean }) =>
      adminService.toggleFeaturedCourse(courseId, featured),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminService.getAdminCategories(),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; icon?: string; description?: string }) =>
      adminService.createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: { name?: string; slug?: string; icon?: string | null; description?: string | null } }) =>
      adminService.updateCategory(categoryId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => adminService.deleteCategory(categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["admin", "recent-activity"],
    queryFn: () => adminService.getRecentActivity(),
    staleTime: 30_000,
  });
}
