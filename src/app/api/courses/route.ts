import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const categorySlug = searchParams.get("category");
  const level = searchParams.get("level");
  const price = searchParams.get("price");
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("courses")
    .select(
      "id, title, slug, subtitle, thumbnail_url, price, discount_price, level, language, status, created_at, instructor_id, category_id",
      { count: "exact" }
    )
    .eq("status", "published");

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (level) query = query.eq("level", level);
  if (price === "free") query = query.eq("price", 0);
  else if (price === "paid") query = query.gt("price", 0);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data: courses, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!courses || courses.length === 0) {
    return NextResponse.json({ data: [], total: 0, page, limit, totalPages: 0 });
  }

  const courseIds = courses.map((c) => c.id);
  const instructorIds = [...new Set(courses.map((c) => c.instructor_id))];
  const categoryIds = [...new Set(courses.map((c) => c.category_id))];

  const [instructorsRes, categoriesRes, reviewsRes, enrollmentsRes, sectionsRes] =
    await Promise.all([
      supabase
        .from("instructors")
        .select("id, user_id, user:user_id(name, avatar_url)")
        .in("id", instructorIds),
      supabase.from("categories").select("id, name, slug").in("id", categoryIds),
      supabase.from("reviews").select("course_id, rating").in("course_id", courseIds),
      supabase.from("enrollments").select("course_id").in("course_id", courseIds),
      supabase
        .from("course_sections")
        .select("course_id, lessons(count)")
        .in("course_id", courseIds),
    ]);

  const instructorMap = new Map(
    (instructorsRes.data ?? []).map((i) => [
      i.id,
      {
        name: (i.user as unknown as { name: string })?.name ?? "Unknown",
        avatar: (i.user as unknown as { avatar_url: string | null })?.avatar_url ?? null,
      },
    ])
  );

  const categoryMap = new Map(
    (categoriesRes.data ?? []).map((c) => [c.id, { name: c.name, slug: c.slug }])
  );

  const reviewMap: Record<string, { count: number; total: number }> = {};
  for (const r of reviewsRes.data ?? []) {
    if (!reviewMap[r.course_id]) reviewMap[r.course_id] = { count: 0, total: 0 };
    reviewMap[r.course_id]!.count += 1;
    reviewMap[r.course_id]!.total += r.rating;
  }

  const enrollmentCountMap: Record<string, number> = {};
  for (const e of enrollmentsRes.data ?? []) {
    enrollmentCountMap[e.course_id] = (enrollmentCountMap[e.course_id] ?? 0) + 1;
  }

  const lessonCountMap: Record<string, number> = {};
  for (const section of (sectionsRes.data ?? []) as unknown as {
    course_id: string;
    lessons: { count: number }[];
  }[]) {
    lessonCountMap[section.course_id] =
      (lessonCountMap[section.course_id] ?? 0) +
      (section.lessons?.reduce((s, l) => s + (l.count ?? 0), 0) ?? 0);
  }

  const data = courses.map((c) => {
    const ins = instructorMap.get(c.instructor_id);
    const cat = categoryMap.get(c.category_id);
    const rev = reviewMap[c.id];
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      subtitle: c.subtitle,
      thumbnail_url: c.thumbnail_url,
      price: c.price,
      discount_price: c.discount_price,
      level: c.level,
      language: c.language,
      status: c.status,
      instructor_name: ins?.name ?? "Unknown",
      instructor_avatar: ins?.avatar ?? null,
      category_name: cat?.name ?? "Uncategorized",
      category_slug: cat?.slug ?? "",
      rating: rev ? Math.round((rev.total / rev.count) * 10) / 10 : null,
      review_count: rev?.count ?? 0,
      enrollment_count: enrollmentCountMap[c.id] ?? 0,
      lesson_count: lessonCountMap[c.id] ?? 0,
      duration_total: 0,
    };
  });

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
