import { createClient } from "@/lib/supabase/client";
import type { InstructorStats, InstructorCourseRow, RecentEnrollment } from "@/features/instructors/types";


export const instructorService = {
  async getInstructorId(): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: instructor } = await supabase
      .from("instructors")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!instructor) throw new Error("Not an instructor");
    return instructor.id;
  },

  async getInstructorStats(): Promise<InstructorStats> {
    const supabase = createClient();
    const instructorId = await this.getInstructorId();

    const { data: instructor } = await supabase
      .from("instructors")
      .select("rating, total_students")
      .eq("id", instructorId)
      .single();

    const { data: courses } = await supabase
      .from("courses")
      .select("id, price, discount_price, status")
      .eq("instructor_id", instructorId);

    const published = courses?.filter((c) => c.status === "published") ?? [];
    const courseIds = courses?.map((c) => c.id) ?? [];

    let totalEarnings = 0;
    if (courseIds.length > 0) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds)
        .in("status", ["active", "completed"]);

      const enrollmentCourseIds = [...new Set(enrollments?.map((e) => e.course_id) ?? [])];
      for (const c of courses ?? []) {
        if (enrollmentCourseIds.includes(c.id)) {
          totalEarnings += c.discount_price ?? c.price;
        }
      }
    }

    const { count: reviewCount } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .in("course_id", courseIds);

    return {
      total_courses: courses?.length ?? 0,
      published_courses: published.length,
      total_students: instructor?.total_students ?? 0,
      total_earnings: totalEarnings,
      average_rating: instructor?.rating ?? 0,
      total_reviews: reviewCount ?? 0,
    };
  },

  async getInstructorCourses(): Promise<InstructorCourseRow[]> {
    const supabase = createClient();
    const instructorId = await this.getInstructorId();

    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, slug, thumbnail_url, price, discount_price, level, status, category:categories(name), created_at, updated_at")
      .eq("instructor_id", instructorId)
      .order("created_at", { ascending: false });

    if (!courses) return [];

    const rows: InstructorCourseRow[] = [];
    for (const c of courses) {
      const cat = (c.category as unknown as { name: string } | null);

      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("course_id", c.id);

      const { count: lessonCount } = await supabase
        .from("course_sections")
        .select("id, lessons(id)", { count: "exact", head: true })
        .eq("course_id", c.id);

      rows.push({
        id: c.id,
        title: c.title,
        slug: c.slug,
        thumbnail_url: c.thumbnail_url,
        price: c.price,
        discount_price: c.discount_price,
        level: c.level,
        status: c.status,
        category_name: cat?.name ?? "",
        enrollment_count: enrollmentCount ?? 0,
        lesson_count: lessonCount ?? 0,
        created_at: c.created_at,
        updated_at: c.updated_at,
      });
    }
    return rows;
  },

  async getRecentEnrollments(): Promise<RecentEnrollment[]> {
    const supabase = createClient();
    const instructorId = await this.getInstructorId();

    const { data: courseIds } = await supabase
      .from("courses")
      .select("id, title, slug")
      .eq("instructor_id", instructorId);

    if (!courseIds || courseIds.length === 0) return [];

    const ids = courseIds.map((c) => c.id);
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, course_id, created_at, user:user_id(name, avatar_url)")
      .in("course_id", ids)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!enrollments) return [];

    return enrollments.map((e) => {
      const course = courseIds.find((c) => c.id === e.course_id);
      const user = e.user as unknown as { name: string; avatar_url: string | null } | null;
      return {
        id: e.id,
        course_title: course?.title ?? "",
        course_slug: course?.slug ?? "",
        student_name: user?.name ?? "Unknown",
        student_avatar: user?.avatar_url ?? null,
        enrolled_at: e.created_at,
      };
    });
  },

  async createCourse(data: {
    category_id: string;
    title: string;
    slug: string;
    subtitle?: string;
    description?: string;
    thumbnail_url?: string;
    preview_video_url?: string;
    price: number;
    discount_price?: number | null;
    level?: string;
    status?: string;
  }) {
    const supabase = createClient();
    const instructorId = await this.getInstructorId();

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        instructor_id: instructorId,
        category_id: data.category_id,
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle ?? null,
        description: data.description ?? null,
        thumbnail_url: data.thumbnail_url ?? null,
        preview_video_url: data.preview_video_url ?? null,
        price: data.price,
        discount_price: data.discount_price ?? null,
        level: data.level ?? null,
        status: data.status ?? "draft",
      })
      .select("id")
      .single();

    if (error) throw error;
    return course;
  },

  async updateCourse(courseId: string, data: Record<string, unknown>) {
    const supabase = createClient();
    const { error } = await supabase.from("courses").update(data).eq("id", courseId);
    if (error) throw error;
  },

  async deleteCourse(courseId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) throw error;
  },

  async createSection(courseId: string, title: string, sortOrder: number) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("course_sections")
      .insert({ course_id: courseId, title, sort_order: sortOrder })
      .select("id, title, sort_order")
      .single();
    if (error) throw error;
    return data;
  },

  async updateSection(sectionId: string, data: { title?: string; sort_order?: number }) {
    const supabase = createClient();
    const { error } = await supabase.from("course_sections").update(data).eq("id", sectionId);
    if (error) throw error;
  },

  async deleteSection(sectionId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("course_sections").delete().eq("id", sectionId);
    if (error) throw error;
  },

  async createLesson(data: {
    section_id: string;
    title: string;
    slug: string;
    type: string;
    video_url?: string | null;
    duration_seconds?: number | null;
    is_free_preview?: boolean;
    sort_order: number;
  }) {
    const supabase = createClient();
    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        section_id: data.section_id,
        title: data.title,
        slug: data.slug,
        type: data.type,
        video_url: data.video_url ?? null,
        duration_seconds: data.duration_seconds ?? null,
        is_free_preview: data.is_free_preview ?? false,
        sort_order: data.sort_order,
      })
      .select("id")
      .single();
    if (error) throw error;
    return lesson;
  },

  async updateLesson(lessonId: string, data: Record<string, unknown>) {
    const supabase = createClient();
    const { error } = await supabase.from("lessons").update(data).eq("id", lessonId);
    if (error) throw error;
  },

  async deleteLesson(lessonId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) throw error;
  },

  async saveQuizWithQuestions(data: {
    lesson_id: string;
    title: string;
    passing_score: number;
    questions: {
      question_text: string;
      question_type: "multiple_choice" | "single_choice" | "true_false";
      points: number;
      sort_order: number;
      answers: { answer_text: string; is_correct: boolean }[];
    }[];
  }) {
    const supabase = createClient();

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        lesson_id: data.lesson_id,
        title: data.title,
        passing_score: data.passing_score,
      })
      .select("id")
      .single();

    if (quizError) throw quizError;

    for (let qi = 0; qi < data.questions.length; qi++) {
      const q = data.questions[qi]!;
      const { data: question, error: qError } = await supabase
        .from("quiz_questions")
        .insert({
          quiz_id: quiz.id,
          question_text: q.question_text,
          question_type: q.question_type,
          points: q.points,
          sort_order: q.sort_order,
        })
        .select("id")
        .single();

      if (qError) throw qError;

      if (q.answers.length > 0) {
        const { error: aError } = await supabase.from("quiz_answers").insert(
          q.answers.map((a) => ({
            question_id: question.id,
            answer_text: a.answer_text,
            is_correct: a.is_correct,
          }))
        );
        if (aError) throw aError;
      }
    }

    return quiz;
  },

  async getCourseFull(courseId: string) {
    const supabase = createClient();

    const { data: course } = await supabase
      .from("courses")
      .select("*, category:categories(name, slug)")
      .eq("id", courseId)
      .single();

    if (!course) return null;

    const { data: sections } = await supabase
      .from("course_sections")
      .select("*, lessons(id, title, slug, type, video_url, duration_seconds, is_free_preview, sort_order)")
      .eq("course_id", courseId)
      .order("sort_order")
      .order("lessons.sort_order");

    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("*, questions:quiz_questions(*, answers:quiz_answers(*))")
      .in("lesson_id", sections?.flatMap((s) => s.lessons.map((l: { id: string }) => l.id)) ?? []);

    return { course, sections: sections ?? [], quizzes: quizzes ?? [] };
  },
};
