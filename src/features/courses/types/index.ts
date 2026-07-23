export interface CourseCardData {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  price: number;
  discount_price: number | null;
  level: string | null;
  language: string;
  status: string;
  instructor_name: string;
  instructor_avatar: string | null;
  category_name: string;
  category_slug: string;
  rating: number | null;
  review_count: number;
  enrollment_count: number;
  lesson_count: number;
  duration_total: number;
}

export interface CourseDetailData {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  price: number;
  discount_price: number | null;
  level: string | null;
  language: string;
  status: string;
  instructor: {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
    headline: string | null;
    rating: number;
    total_students: number;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  sections: {
    id: string;
    title: string;
    sort_order: number;
    lessons: {
      id: string;
      title: string;
      slug: string;
      type: string;
      duration_seconds: number | null;
      is_free_preview: boolean;
      sort_order: number;
    }[];
  }[];
  review_summary: {
    average_rating: number;
    total_reviews: number;
    distribution: Record<number, number>;
  };
  enrollment_count: number;
}

export interface CourseFiltersData {
  categorySlug?: string;
  level?: string;
  price?: "free" | "paid";
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
