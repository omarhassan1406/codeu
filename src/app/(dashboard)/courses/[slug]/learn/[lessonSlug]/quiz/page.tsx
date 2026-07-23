"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseBySlug } from "@/features/courses/hooks/useCourses";
import { useQuizByLesson, useSubmitQuiz } from "@/features/quizzes/hooks/useQuiz";

export default function QuizPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>();
  const { data: course } = useCourseBySlug(slug);

  const allLessons =
    course?.sections.flatMap((s) => s.lessons.map((l) => ({ ...l, sectionTitle: s.title }))) ?? [];
  const currentLesson = allLessons.find((l) => l.slug === lessonSlug);
  const lessonId = currentLesson?.id ?? "";

  const { data: quiz, isLoading } = useQuizByLesson(lessonId);
  const submitQuiz = useSubmitQuiz();

  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    total_points: number;
    earned_points: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-6 h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="mb-4 h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!quiz || !currentLesson) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Quiz not found</h2>
        <Button asChild>
          <Link href={`/courses/${slug}/learn/${lessonSlug}`}>Back to Lesson</Link>
        </Button>
      </div>
    );
  }

  const questions = quiz.questions ?? [];
  const totalQuestions = questions.length;

  const handleAnswer = (questionId: string, answerId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.question_type === "single_choice" || question.question_type === "true_false") {
      setAnswers((prev) => ({ ...prev, [questionId]: [answerId] }));
    } else {
      const current = answers[questionId] ?? [];
      const updated = current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId];
      setAnswers((prev) => ({ ...prev, [questionId]: updated }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers: Record<string, string[]> = {};
      for (const q of questions) {
        const userAnswers = answers[q.id];
        if (userAnswers && userAnswers.length > 0) {
          formattedAnswers[q.id] = userAnswers;
        }
      }
      const res = await submitQuiz.mutateAsync({
        quizId: quiz.id,
        answers: formattedAnswers,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = questions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  const answeredCount = questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;

  // Result view
  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          {result.passed ? (
            <CheckCircle className="mx-auto size-16 text-green-500" />
          ) : (
            <XCircle className="mx-auto size-16 text-red-500" />
          )}

          <h2 className="mt-4 text-2xl font-bold text-foreground">
            {result.passed ? "Congratulations!" : "Try Again"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {result.passed ? "You passed the quiz!" : "You did not meet the passing score."}
          </p>

          <div className="mt-6 flex items-center justify-center gap-8">
            <div>
              <p className="text-3xl font-bold text-foreground">{result.score}%</p>
              <p className="text-sm text-muted-foreground">Your Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">
                {result.earned_points}/{result.total_points}
              </p>
              <p className="text-sm text-muted-foreground">Points</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            {result.passed ? (
              <Button asChild>
                <Link href={`/courses/${slug}/learn/${lessonSlug}`}>Back to Lesson</Link>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrentQuestion(0);
                }}
              >
                Retry Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Single-question view
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">This quiz has no questions.</p>
        <Button asChild>
          <Link href={`/courses/${slug}/learn/${lessonSlug}`}>Back to Lesson</Link>
        </Button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/courses/${slug}/learn/${lessonSlug}`}>
            <ArrowLeft className="size-4" />
            Back to Lesson
          </Link>
        </Button>
        <h1 className="mt-3 text-xl font-bold text-foreground">{quiz.title}</h1>
      </div>

      {/* Progress */}
      <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <span>
          {answeredCount}/{totalQuestions} answered
        </span>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-xl border border-border bg-card p-6">
        <Badge variant="secondary" className="mb-3 text-xs capitalize">
          {question.question_type.replace("_", " ")}
        </Badge>
        <h2 className="text-lg font-semibold text-foreground">{question.question_text}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {question.points} point{question.points !== 1 ? "s" : ""}
        </p>

        <div className="mt-4 space-y-3">
          {(question.answers ?? []).map((answer) => {
            const isSelected = (answers[question.id] ?? []).includes(answer.id);
            return (
              <button
                key={answer.id}
                onClick={() => handleAnswer(question.id, answer.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  isSelected
                    ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300"
                    : "border-border bg-background hover:border-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-muted-foreground"
                  )}
                >
                  {isSelected && <div className="size-2.5 rounded-full bg-white" />}
                </div>
                <span>{answer.answer_text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion((p) => p - 1)}
        >
          Previous
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            size="sm"
            onClick={() => setCurrentQuestion((p) => p + 1)}
            disabled={!answers[question.id] || answers[question.id]?.length === 0}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            loading={submitting}
          >
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
