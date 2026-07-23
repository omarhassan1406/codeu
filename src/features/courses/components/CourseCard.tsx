"use client";

import Link from "next/link";
import { Clock, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CourseCardData } from "@/features/courses/types";

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const price = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price !== null;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="size-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Clock className="size-8" />
          </div>
        )}
        {course.level && (
          <Badge className={`absolute top-2 left-2 ${levelColors[course.level] ?? ""}`}>
            {course.level}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge variant="secondary" className="w-fit text-xs">
          {course.category_name}
        </Badge>

        <h3 className="font-semibold leading-tight text-foreground line-clamp-2 group-hover:text-brand-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-muted-foreground">{course.instructor_name}</p>

        <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
          {course.rating !== null && (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)} ({course.review_count})
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {course.enrollment_count}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">${price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${course.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
