import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, title, slug, subtitle, description, thumbnail_url, preview_video_url, price, discount_price, level, language, status, instructor_id, category_id, created_at, updated_at"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!course) {
    return NextResponse.json(null, { status: 404 });
  }

  const [instructorRes, categoryRes, sectionsRes, reviewsRes, enrollmentsRes] = await Promise.all([
    supabase
      .from("instructors")
      .select("id, bio, headline, rating, total_students, user:user_id(name, avatar_url)")
      .eq("id", course.instructor_id)
      .single(),
    supabase.from("categories").select("id, name, slug").eq("id", course.category_id).single(),
    supabase
      .from("course_sections")
      .select(
        "id, title, sort_order, lessons(id, title, slug, type, video_url, duration_seconds, is_free_preview, sort_order)"
      )
      .eq("course_id", course.id)
      .order("sort_order")
      .order("lessons.sort_order"),
    supabase.from("reviews").select("rating").eq("course_id", course.id),
    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course.id),
  ]);

  const reviews = reviewsRes.data ?? [];
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

  const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  for (const r of reviews) {
    distribution[String(r.rating)] = (distribution[String(r.rating)] ?? 0) + 1;
  }

  const instructorUser = instructorRes.data?.user as
    { name: string; avatar_url: string | null } | undefined;

  return NextResponse.json({
    id: course.id,
    title: course.title,
    slug: course.slug,
    subtitle: course.subtitle,
    description: course.description,
    thumbnail_url: course.thumbnail_url,
    preview_video_url: course.preview_video_url,
    price: course.price,
    discount_price: course.discount_price,
    level: course.level,
    language: course.language,
    status: course.status,
    created_at: course.created_at,
    instructor: {
      id: instructorRes.data?.id ?? "",
      name: instructorUser?.name ?? "Unknown",
      avatar_url: instructorUser?.avatar_url ?? null,
      bio: instructorRes.data?.bio ?? null,
      headline: instructorRes.data?.headline ?? null,
      rating: instructorRes.data?.rating ?? 0,
      total_students: instructorRes.data?.total_students ?? 0,
    },
    category: {
      id: categoryRes.data?.id ?? "",
      name: categoryRes.data?.name ?? "",
      slug: categoryRes.data?.slug ?? "",
    },
    sections: (sectionsRes.data ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      sort_order: s.sort_order,
      lessons: (s.lessons ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        type: l.type,
        duration_seconds: l.duration_seconds,
        is_free_preview: l.is_free_preview,
        sort_order: l.sort_order,
      })),
    })),
    review_summary: {
      average_rating: averageRating,
      total_reviews: totalReviews,
      distribution,
    },
    enrollment_count: enrollmentsRes.count ?? 0,
  });
}
