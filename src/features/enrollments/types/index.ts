export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: "active" | "completed" | "cancelled";
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentWithCourse extends Enrollment {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    level: string | null;
    category_name: string;
    instructor_name: string;
    total_lessons: number;
    completed_lessons: number;
  };
}

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}
