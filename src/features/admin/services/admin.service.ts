import { createClient } from "@/lib/supabase/client";
import type { AdminStats, AdminUserRow, AdminCourseRow, AdminCategoryRow, RecentActivity } from "@/features/admin/types";

export const adminService = {
  async getAdminStats(): Promise<AdminStats> {
    const supabase = createClient();

    const [
      { count: totalStudents },
      { count: totalInstructors },
      { count: totalCourses },
      { count: publishedCourses },
      { count: totalEnrollments },
      { count: totalReviews },
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "instructor"),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("enrollments").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
    ]);

    const { count: draftCourses } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft");

    const { data: payments } = await supabase
      .from("enrollments")
      .select("course_id")
      .in("status", ["active", "completed"]);

    const courseIds = [...new Set(payments?.map((e) => e.course_id) ?? [])];

    let totalRevenue = 0;
    if (courseIds.length > 0) {
      const { data: pricedCourses } = await supabase
        .from("courses")
        .select("price, discount_price")
        .in("id", courseIds);
      for (const c of pricedCourses ?? []) {
        totalRevenue += c.discount_price ?? c.price;
      }
    }

    return {
      total_revenue: totalRevenue,
      total_students: totalStudents ?? 0,
      total_instructors: totalInstructors ?? 0,
      total_courses: totalCourses ?? 0,
      active_courses: publishedCourses ?? 0,
      pending_courses: draftCourses ?? 0,
      total_enrollments: totalEnrollments ?? 0,
      total_reviews: totalReviews ?? 0,
    };
  },

  async getAdminUsers(): Promise<AdminUserRow[]> {
    const supabase = createClient();

    const { data: users } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, role, created_at")
      .order("created_at", { ascending: false });

    if (!users) return [];

    const rows: AdminUserRow[] = [];
    for (const u of users) {
      const { count: courseCount } = await supabase
        .from("instructors")
        .select("id", { count: "exact", head: true })
        .eq("user_id", u.id);

      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", u.id);

      rows.push({
        id: u.id,
        email: u.email,
        name: u.name,
        avatar_url: u.avatar_url,
        role: u.role,
        created_at: u.created_at,
        course_count: courseCount ?? 0,
        enrollment_count: enrollmentCount ?? 0,
        last_sign_in: null,
      });
    }
    return rows;
  },

  async updateUserRole(userId: string, role: string) {
    const supabase = createClient();
    const { error } = await supabase.from("users").update({ role }).eq("id", userId);
    if (error) throw error;
  },

  async getAdminCourses(): Promise<AdminCourseRow[]> {
    const supabase = createClient();

    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, slug, price, discount_price, level, status, created_at, instructor_id, category:categories(name)")
      .order("created_at", { ascending: false });

    if (!courses) return [];

    const rows: AdminCourseRow[] = [];
    for (const c of courses) {
      const cat = c.category as unknown as { name: string } | null;

      const { data: instructor } = await supabase
        .from("instructors")
        .select("user:user_id(name)")
        .eq("id", c.instructor_id)
        .single();

      const user = instructor?.user as unknown as { name: string } | null;

      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("course_id", c.id);

      rows.push({
        id: c.id,
        title: c.title,
        slug: c.slug,
        price: c.price,
        discount_price: c.discount_price,
        level: c.level,
        status: c.status,
        featured: false,
        instructor_name: user?.name ?? "Unknown",
        category_name: cat?.name ?? "",
        enrollment_count: enrollmentCount ?? 0,
        created_at: c.created_at,
      });
    }
    return rows;
  },

  async updateCourseStatus(courseId: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase.from("courses").update({ status }).eq("id", courseId);
    if (error) throw error;
  },

  async toggleFeaturedCourse(courseId: string, featured: boolean) {
    const supabase = createClient();
    const { error } = await supabase.from("courses").update({ featured }).eq("id", courseId);
    if (error) throw error;
  },

  async createCategory(data: { name: string; slug: string; icon?: string; description?: string }) {
    const supabase = createClient();
    const { data: cat, error } = await supabase
      .from("categories")
      .insert({
        name: data.name,
        slug: data.slug,
        icon: data.icon ?? null,
        description: data.description ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return cat;
  },

  async updateCategory(categoryId: string, data: { name?: string; slug?: string; icon?: string | null; description?: string | null }) {
    const supabase = createClient();
    const { error } = await supabase.from("categories").update(data).eq("id", categoryId);
    if (error) throw error;
  },

  async deleteCategory(categoryId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) throw error;
  },

  async getAdminCategories(): Promise<AdminCategoryRow[]> {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, icon, description, created_at, courses(count)")
      .order("name");

    if (!data) return [];

    return data.map((cat) => {
      const coursesRel = cat.courses as unknown as { count: number }[] | null;
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        course_count: coursesRel?.[0]?.count ?? 0,
        created_at: cat.created_at,
      };
    });
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    const supabase = createClient();
    const activity: RecentActivity[] = [];

    const { data: recentEnrollments } = await supabase
      .from("enrollments")
      .select("id, created_at, user:user_id(name)")
      .order("created_at", { ascending: false })
      .limit(5);

    for (const e of recentEnrollments ?? []) {
      const user = e.user as unknown as { name: string } | null;
      activity.push({
        id: `enroll-${e.id}`,
        type: "enrollment",
        message: "enrolled in a course",
        user_name: user?.name ?? "Unknown",
        created_at: e.created_at,
      });
    }

    const { data: recentReviews } = await supabase
      .from("reviews")
      .select("id, created_at, user:user_id(name)")
      .order("created_at", { ascending: false })
      .limit(5);

    for (const r of recentReviews ?? []) {
      const user = r.user as unknown as { name: string } | null;
      activity.push({
        id: `review-${r.id}`,
        type: "review",
        message: "left a review",
        user_name: user?.name ?? "Unknown",
        created_at: r.created_at,
      });
    }

    activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return activity.slice(0, 10);
  },
};
