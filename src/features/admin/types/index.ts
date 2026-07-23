export interface AdminStats {
  total_revenue: number;
  total_students: number;
  total_instructors: number;
  total_courses: number;
  active_courses: number;
  pending_courses: number;
  total_enrollments: number;
  total_reviews: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  course_count: number;
  enrollment_count: number;
  last_sign_in: string | null;
}

export interface AdminCourseRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount_price: number | null;
  level: string | null;
  status: string;
  featured: boolean;
  instructor_name: string;
  category_name: string;
  enrollment_count: number;
  created_at: string;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  course_count: number;
  created_at: string;
}

export interface RecentActivity {
  id: string;
  type: "enrollment" | "review" | "course_published";
  message: string;
  user_name: string;
  created_at: string;
}
