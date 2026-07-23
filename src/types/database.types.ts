// ============================================================================
// CodeU Academy — Database TypeScript Interfaces
// Auto-generated from supabase/migrations/00001_initial_schema.sql
// ============================================================================

export type UserRole = "student" | "instructor" | "admin";
export type CourseStatus = "draft" | "published" | "archived";
export type LessonType = "video" | "document" | "quiz";
export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Instructor {
  id: string;
  user_id: string;
  bio: string | null;
  headline: string | null;
  website: string | null;
  social_links: Record<string, string>;
  rating: number;
  total_students: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  category_id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  price: number;
  discount_price: number | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  language: string;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  slug: string;
  type: LessonType;
  video_url: string | null;
  duration_seconds: number | null;
  is_free_preview: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LessonFile {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "single_choice" | "true_false";
  points: number;
  sort_order: number;
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
}

export interface ExamResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_code: string;
  pdf_url: string | null;
  issued_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

// Insert types (omit auto-generated fields)
export type UserInsert = Omit<User, "created_at" | "updated_at">;
export type InstructorInsert = Omit<
  Instructor,
  "id" | "rating" | "total_students" | "created_at" | "updated_at"
>;
export type CategoryInsert = Omit<Category, "id" | "created_at">;
export type CourseInsert = Omit<Course, "id" | "created_at" | "updated_at">;
export type CourseSectionInsert = Omit<CourseSection, "id" | "created_at" | "updated_at">;
export type LessonInsert = Omit<Lesson, "id" | "created_at" | "updated_at">;
export type LessonFileInsert = Omit<LessonFile, "id">;
export type EnrollmentInsert = Omit<
  Enrollment,
  "id" | "progress_percentage" | "created_at" | "updated_at"
>;
export type QuizInsert = Omit<Quiz, "id" | "created_at" | "updated_at">;
export type QuizQuestionInsert = Omit<QuizQuestion, "id">;
export type QuizAnswerInsert = Omit<QuizAnswer, "id">;
export type ExamResultInsert = Omit<ExamResult, "id" | "created_at" | "updated_at">;
export type CertificateInsert = Omit<Certificate, "id" | "issued_at">;
export type FavoriteInsert = Omit<Favorite, "id" | "created_at">;
export type NotificationInsert = Omit<Notification, "id" | "created_at" | "updated_at">;
export type ReviewInsert = Omit<Review, "id" | "created_at" | "updated_at">;

// Update types (all fields optional)
export type UserUpdate = Partial<UserInsert>;
export type InstructorUpdate = Partial<Omit<InstructorInsert, "user_id">>;
export type CategoryUpdate = Partial<CategoryInsert>;
export type CourseUpdate = Partial<CourseInsert>;
export type CourseSectionUpdate = Partial<CourseSectionInsert>;
export type LessonUpdate = Partial<LessonInsert>;
export type LessonFileUpdate = Partial<LessonFileInsert>;
export type EnrollmentUpdate = Partial<Omit<EnrollmentInsert, "user_id" | "course_id">>;
export type QuizUpdate = Partial<QuizInsert>;
export type QuizQuestionUpdate = Partial<QuizQuestionInsert>;
export type QuizAnswerUpdate = Partial<QuizAnswerInsert>;
export type ExamResultUpdate = Partial<Omit<ExamResultInsert, "user_id" | "quiz_id">>;
export type CertificateUpdate = Partial<Omit<CertificateInsert, "user_id" | "course_id">>;
export type NotificationUpdate = Partial<NotificationInsert>;
export type ReviewUpdate = Partial<Omit<ReviewInsert, "user_id" | "course_id">>;

// Relationship helper types
export interface CourseWithRelations extends Course {
  instructor: Instructor;
  category: Category;
  sections: CourseSectionWithLessons[];
}

export interface CourseSectionWithLessons extends CourseSection {
  lessons: Lesson[];
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestionWithAnswers[];
}

export interface QuizQuestionWithAnswers extends QuizQuestion {
  answers: QuizAnswer[];
}

export interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

export interface ReviewWithUser extends Review {
  user: Pick<User, "id" | "name" | "avatar_url">;
}
