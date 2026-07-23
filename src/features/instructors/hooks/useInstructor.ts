"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instructorService } from "@/features/instructors/services/instructor.service";

export function useInstructorStats() {
  return useQuery({
    queryKey: ["instructor", "stats"],
    queryFn: () => instructorService.getInstructorStats(),
    staleTime: 60_000,
  });
}

export function useInstructorCourses() {
  return useQuery({
    queryKey: ["instructor", "courses"],
    queryFn: () => instructorService.getInstructorCourses(),
    staleTime: 30_000,
  });
}

export function useRecentEnrollments() {
  return useQuery({
    queryKey: ["instructor", "recent-enrollments"],
    queryFn: () => instructorService.getRecentEnrollments(),
    staleTime: 30_000,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof instructorService.createCourse>[0]) =>
      instructorService.createCourse(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] });
      qc.invalidateQueries({ queryKey: ["instructor", "stats"] });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Record<string, unknown> }) =>
      instructorService.updateCourse(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] });
      qc.invalidateQueries({ queryKey: ["instructor", "stats"] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => instructorService.deleteCourse(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] });
      qc.invalidateQueries({ queryKey: ["instructor", "stats"] });
    },
  });
}

export function useCurriculumMutation() {
  const qc = useQueryClient();
  return {
    createSection: useMutation({
      mutationFn: ({ courseId, title, sortOrder }: { courseId: string; title: string; sortOrder: number }) =>
        instructorService.createSection(courseId, title, sortOrder),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor", "courses"] }),
    }),
    updateSection: useMutation({
      mutationFn: ({ sectionId, data }: { sectionId: string; data: { title?: string; sort_order?: number } }) =>
        instructorService.updateSection(sectionId, data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor", "courses"] }),
    }),
    deleteSection: useMutation({
      mutationFn: (sectionId: string) => instructorService.deleteSection(sectionId),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor", "courses"] }),
    }),
    createLesson: useMutation({
      mutationFn: (data: Parameters<typeof instructorService.createLesson>[0]) =>
        instructorService.createLesson(data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor", "courses"] }),
    }),
    updateLesson: useMutation({
      mutationFn: ({ lessonId, data }: { lessonId: string; data: Record<string, unknown> }) =>
        instructorService.updateLesson(lessonId, data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor", "courses"] }),
    }),
    deleteLesson: useMutation({
      mutationFn: (lessonId: string) => instructorService.deleteLesson(lessonId),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor", "courses"] }),
    }),
    saveQuiz: useMutation({
      mutationFn: (data: Parameters<typeof instructorService.saveQuizWithQuestions>[0]) =>
        instructorService.saveQuizWithQuestions(data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["instructor", "courses"] }),
    }),
  };
}

export function useCourseFull(courseId: string) {
  return useQuery({
    queryKey: ["instructor", "course-full", courseId],
    queryFn: () => instructorService.getCourseFull(courseId),
    enabled: !!courseId,
    staleTime: 30_000,
  });
}
