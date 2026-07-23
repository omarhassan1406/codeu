import { createClient } from "@/lib/supabase/client";

export const enrollmentService = {
  async getMyEnrollments() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select("*, course:courses(id, title, slug, thumbnail_url, level, category:categories(name))")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getEnrollment(courseId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("course_id", courseId)
      .single();
    return data;
  },

  async enroll(courseId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .insert({ course_id: courseId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markLessonComplete(courseId: string, lessonId: string, totalLessons: number) {
    const supabase = createClient();
    const enrollment = await this.getEnrollment(courseId);
    if (!enrollment) throw new Error("Not enrolled");

    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("lesson_id", lessonId)
      .eq("user_id", enrollment.user_id)
      .single();

    if (!existing) {
      await supabase.from("lesson_progress").insert({
        lesson_id: lessonId,
        user_id: enrollment.user_id,
        course_id: courseId,
        completed: true,
      });
    }

    const { count } = await supabase
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", enrollment.user_id)
      .eq("course_id", courseId)
      .eq("completed", true);

    const progress = Math.round(((count ?? 0) / totalLessons) * 100);
    const status = progress >= 100 ? "completed" : "active";

    const { data: updated, error } = await supabase
      .from("enrollments")
      .update({ progress_percentage: progress, status })
      .eq("id", enrollment.id)
      .select()
      .single();

    if (error) throw error;
    return { enrollment: updated, completedLessonIds: [lessonId], progress };
  },

  async getCompletedLessons(courseId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("course_id", courseId)
      .eq("completed", true);
    return (data ?? []).map((lp) => lp.lesson_id);
  },
};
