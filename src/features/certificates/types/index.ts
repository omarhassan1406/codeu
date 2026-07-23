export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_code: string;
  pdf_url: string | null;
  issued_at: string;
  course: {
    title: string;
    slug: string;
  };
}
