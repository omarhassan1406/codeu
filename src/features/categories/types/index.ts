export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  courseCount: number;
  created_at: string;
}
