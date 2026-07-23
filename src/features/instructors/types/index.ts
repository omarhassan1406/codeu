export interface InstructorStats {
  total_courses: number;
  published_courses: number;
  total_students: number;
  total_earnings: number;
  average_rating: number;
  total_reviews: number;
}

export interface InstructorCourseRow {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  price: number;
  discount_price: number | null;
  level: string | null;
  status: string;
  category_name: string;
  enrollment_count: number;
  lesson_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecentEnrollment {
  id: string;
  course_title: string;
  course_slug: string;
  student_name: string;
  student_avatar: string | null;
  enrolled_at: string;
}
