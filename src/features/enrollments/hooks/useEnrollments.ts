"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentService } from "@/features/enrollments/services/enrollment.service";

export function useMyEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentService.getMyEnrollments(),
    staleTime: 30_000,
  });
}

export function useEnrollment(courseId: string) {
  return useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () => enrollmentService.getEnrollment(courseId),
    enabled: !!courseId,
    staleTime: 30_000,
  });
}

export function useEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => enrollmentService.enroll(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useLessonProgress(courseId: string) {
  return useQuery({
    queryKey: ["lesson-progress", courseId],
    queryFn: () => enrollmentService.getCompletedLessons(courseId),
    enabled: !!courseId,
    staleTime: 10_000,
  });
}

export function useMarkLessonComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      lessonId,
      totalLessons,
    }: {
      courseId: string;
      lessonId: string;
      totalLessons: number;
    }) => enrollmentService.markLessonComplete(courseId, lessonId, totalLessons),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["lesson-progress", variables.courseId] });
      qc.invalidateQueries({ queryKey: ["enrollment", variables.courseId] });
      qc.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
