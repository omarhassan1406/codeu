"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, Globe, Play, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseBySlug } from "@/features/courses/hooks/useCourses";
import { CurriculumAccordion } from "@/features/courses/components/CurriculumAccordion";
import { InstructorCard } from "@/features/courses/components/InstructorCard";

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading } = useCourseBySlug(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Skeleton className="mb-4 h-8 w-64" />
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Course not found</h1>
        <p className="text-muted-foreground">
          The course you are looking for does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  const totalDuration = course.sections.reduce(
    (sum, s) => sum + s.lessons.reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0),
    0
  );
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const price = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price !== null;
  const durationHours = Math.floor(totalDuration / 3600);
  const durationMins = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/courses" className="hover:text-foreground">
          Courses
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{course.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Hero */}
          <div>
            {course.thumbnail_url && (
              <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-muted">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="size-full object-cover"
                />
                {course.preview_video_url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex size-16 items-center justify-center rounded-full bg-white/90 text-brand-600 transition-transform hover:scale-105">
                      <Play className="ml-0.5 size-7 fill-current" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <Badge variant="secondary" className="mb-3">
              {course.category.name}
            </Badge>

            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{course.title}</h1>

            {course.subtitle && (
              <p className="mt-2 text-lg text-muted-foreground">{course.subtitle}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {course.review_summary.total_reviews > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {course.review_summary.average_rating.toFixed(1)}
                  <span className="text-xs">({course.review_summary.total_reviews})</span>
                </span>
              )}

              <span className="flex items-center gap-1">
                <Users className="size-4" />
                {course.enrollment_count} enrolled
              </span>

              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {durationHours > 0 ? `${durationHours}h ` : ""}
                {durationMins}m
              </span>

              {course.level && (
                <Badge className={levelColors[course.level] ?? ""}>{course.level}</Badge>
              )}

              <span className="flex items-center gap-1">
                <Globe className="size-4" />
                {course.language.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div>
              <h2 className="mb-3 text-xl font-semibold text-foreground">About this course</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>
          )}

          {/* Curriculum */}
          <div>
            <CurriculumAccordion sections={course.sections} />
          </div>

          {/* Instructor */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Your Instructor</h2>
            <InstructorCard
              name={course.instructor.name}
              avatar_url={course.instructor.avatar_url}
              bio={course.instructor.bio}
              headline={course.instructor.headline}
              rating={course.instructor.rating}
              total_students={course.instructor.total_students}
            />
          </div>

          {/* Reviews */}
          {course.review_summary.total_reviews > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">Student Reviews</h2>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-foreground">
                    {course.review_summary.average_rating.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < Math.round(course.review_summary.average_rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="mt-1 text-sm text-muted-foreground">
                    {course.review_summary.total_reviews} reviews
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = course.review_summary.distribution[star] ?? 0;
                    const pct =
                      course.review_summary.total_reviews > 0
                        ? (count / course.review_summary.total_reviews) * 100
                        : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-right text-muted-foreground">{star}</span>
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Checkout Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">${price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  ${course.price.toFixed(2)}
                </span>
              )}
            </div>

            <Button className="w-full text-base" size="lg">
              Enroll Now
            </Button>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Play className="size-4" />
                {totalLessons} lessons
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                {durationHours > 0 ? `${durationHours}h ` : ""}
                {durationMins}m of video
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-4" />
                Full lifetime access
              </div>
              <div className="flex items-center gap-2">
                <Star className="size-4" />
                Certificate of completion
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
