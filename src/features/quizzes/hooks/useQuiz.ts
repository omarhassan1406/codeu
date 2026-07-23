"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { quizService } from "@/features/quizzes/services/quiz.service";

export function useQuizByLesson(lessonId: string) {
  return useQuery({
    queryKey: ["quiz", lessonId],
    queryFn: () => quizService.getQuizByLesson(lessonId),
    enabled: !!lessonId,
    staleTime: 60_000,
  });
}

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: Record<string, string[]> }) =>
      quizService.submitQuiz(quizId, answers),
  });
}

export function useQuizResult(quizId: string) {
  return useQuery({
    queryKey: ["quiz-result", quizId],
    queryFn: () => quizService.getQuizResult(quizId),
    enabled: !!quizId,
  });
}
