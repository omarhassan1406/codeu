"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Play,
  ClipboardList,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCourseBySlug } from "@/features/courses/hooks/useCourses";
import {
  useLessonProgress,
  useMarkLessonComplete,
} from "@/features/enrollments/hooks/useEnrollments";
import { useState } from "react";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function LearnPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>();
  const router = useRouter();
  const { data: course, isLoading } = useCourseBySlug(slug);
  const { data: completedLessonIds = [] } = useLessonProgress(course?.id ?? "");
  const markComplete = useMarkLessonComplete();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const allLessons =
    course?.sections.flatMap((s) =>
      s.lessons.map((l) => ({ ...l, sectionTitle: s.title, sectionId: s.id }))
    ) ?? [];

  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const currentLesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 p-6">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="mt-4 h-8 w-2/3" />
        </div>
        <div className="hidden w-80 border-l border-border p-4 lg:block">
          <Skeleton className="h-6 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="mt-3 h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <h2 className="text-xl font-bold text-foreground">Lesson not found</h2>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  const handleMarkComplete = async () => {
    if (!course || !currentLesson || isCompleted) return;
    await markComplete.mutateAsync({
      courseId: course.id,
      lessonId: currentLesson.id,
      totalLessons,
    });
  };

  const handleNext = () => {
    if (nextLesson) {
      const nextPath =
        nextLesson.type === "quiz"
          ? `/courses/${slug}/learn/${lessonSlug}/quiz`
          : `/courses/${slug}/learn/${nextLesson.slug}`;
      router.push(nextPath);
    }
  };

  const lessonIcon =
    currentLesson.type === "document"
      ? FileText
      : currentLesson.type === "quiz"
        ? ClipboardList
        : Play;

  const LessonIcon = lessonIcon;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 right-4 z-40 flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg lg:hidden"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Top bar */}
          <div className="mb-4 flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${slug}`}>
                <ChevronLeft className="size-4" />
                Back to course
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              Lesson {currentIndex + 1} of {totalLessons}
            </span>
          </div>

          {/* Video / Document / Quiz placeholder */}
          {currentLesson.type === "video" && (
            <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-black">
              {currentLesson.video_url ? (
                <iframe
                  src={currentLesson.video_url.replace("/video/", "/video/")}
                  className="size-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={currentLesson.title}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-3 text-white">
                  <Play className="size-12 text-white/50" />
                  <p className="text-white/70">Video placeholder</p>
                </div>
              )}
            </div>
          )}

          {currentLesson.type === "document" && (
            <div className="mb-6 flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
              <div className="flex flex-col items-center gap-3 text-center">
                <FileText className="size-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">Document Lesson</p>
                <p className="text-sm text-muted-foreground">
                  Document content would be rendered here.
                </p>
              </div>
            </div>
          )}

          {currentLesson.type === "quiz" && (
            <div className="mb-6 flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
              <div className="flex flex-col items-center gap-3 text-center">
                <ClipboardList className="size-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">Quiz Lesson</p>
                <p className="text-sm text-muted-foreground">This lesson contains a quiz.</p>
                <Button asChild>
                  <Link href={`/courses/${slug}/learn/${lessonSlug}/quiz`}>Start Quiz</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Lesson info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <LessonIcon className="size-5 text-brand-600" />
              <Badge variant="secondary" className="text-xs capitalize">
                {currentLesson.type}
              </Badge>
              {currentLesson.duration_seconds && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {formatDuration(currentLesson.duration_seconds)}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{currentLesson.title}</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-border pt-6">
            {prevLesson && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/courses/${slug}/learn/${prevLesson.slug}`}>
                  <ChevronLeft className="size-4" />
                  Previous
                </Link>
              </Button>
            )}

            <div className="flex-1" />

            {!isCompleted && currentLesson.type !== "quiz" && (
              <Button size="sm" onClick={handleMarkComplete} loading={markComplete.isPending}>
                <CheckCircle className="size-4" />
                Mark as Complete
              </Button>
            )}

            {isCompleted && (
              <Badge variant="secondary" className="gap-1 text-green-600">
                <CheckCircle className="size-3.5" />
                Completed
              </Badge>
            )}

            {currentLesson.type === "quiz" && (
              <Button size="sm" asChild>
                <Link href={`/courses/${slug}/learn/${lessonSlug}/quiz`}>Start Quiz</Link>
              </Button>
            )}

            {nextLesson && (isCompleted || currentLesson.type !== "video") && (
              <Button size="sm" onClick={handleNext}>
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}

            {!nextLesson && isCompleted && (
              <Button size="sm" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar curriculum */}
      <aside
        className={cn(
          "w-80 shrink-0 border-l border-border bg-background overflow-y-auto transition-all",
          sidebarOpen ? "block" : "hidden lg:hidden"
        )}
      >
        <div className="p-4">
          <h3 className="font-semibold text-foreground">{course.title}</h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span>{progressPct}%</span>
          </div>
        </div>

        <div className="border-t border-border">
          {course.sections.map((section) => (
            <div key={section.id}>
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                {section.title}
                <span className="ml-1">
                  ({section.lessons.filter((l) => completedLessonIds.includes(l.id)).length}/
                  {section.lessons.length})
                </span>
              </div>
              {section.lessons.map((lesson) => {
                const isActive = lesson.slug === lessonSlug;
                const done = completedLessonIds.includes(lesson.id);
                const Icon =
                  lesson.type === "document"
                    ? FileText
                    : lesson.type === "quiz"
                      ? ClipboardList
                      : Play;

                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${slug}/learn/${lesson.slug}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50",
                      isActive &&
                        "bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300",
                      done && !isActive && "text-muted-foreground"
                    )}
                  >
                    {done ? (
                      <CheckCircle className="size-4 shrink-0 text-green-500" />
                    ) : (
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{lesson.title}</span>
                    {lesson.duration_seconds && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDuration(lesson.duration_seconds)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
