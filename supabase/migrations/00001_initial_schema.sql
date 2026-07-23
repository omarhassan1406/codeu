-- ============================================================================
-- CodeU Academy — Initial Schema Migration
-- Extensions, Enums, Tables, Triggers, RLS Policies, Indexes
-- ============================================================================

-- 1. Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Custom ENUM Types
-- ============================================================================
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE lesson_type AS ENUM ('video', 'document', 'quiz');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'cancelled');

-- 3. Tables
-- ============================================================================

-- 3.1 Users (extended profile linked to auth.users)
CREATE TABLE users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  name        text NOT NULL DEFAULT '',
  avatar_url  text,
  role        user_role NOT NULL DEFAULT 'student',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3.2 Instructors
CREATE TABLE instructors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio           text,
  headline      text,
  website       text,
  social_links  jsonb DEFAULT '{}'::jsonb,
  rating        numeric(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_students integer DEFAULT 0 CHECK (total_students >= 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_instructor_per_user UNIQUE (user_id)
);

-- 3.3 Categories
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL,
  icon        text,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_category_slug UNIQUE (slug)
);

-- 3.4 Courses
CREATE TABLE courses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id     uuid NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  category_id       uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title             text NOT NULL,
  slug              text NOT NULL,
  subtitle          text,
  description       text,
  thumbnail_url     text,
  preview_video_url text,
  price             numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  discount_price    numeric(10,2) CHECK (discount_price >= 0),
  level             text CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language          text NOT NULL DEFAULT 'en',
  status            course_status NOT NULL DEFAULT 'draft',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_course_slug UNIQUE (slug)
);

-- 3.5 Course Sections
CREATE TABLE course_sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3.6 Lessons (video_url = Bunny Stream / Vimeo / Mux — never Supabase Storage)
CREATE TABLE lessons (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id       uuid NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title            text NOT NULL,
  slug             text NOT NULL,
  type             lesson_type NOT NULL DEFAULT 'video',
  video_url        text,
  duration_seconds integer CHECK (duration_seconds >= 0),
  is_free_preview  boolean NOT NULL DEFAULT false,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 3.7 Lesson Files
CREATE TABLE lesson_files (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title     text NOT NULL,
  file_url  text NOT NULL,
  file_size bigint,
  file_type text
);

-- 3.8 Enrollments
CREATE TABLE enrollments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id           uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status              enrollment_status NOT NULL DEFAULT 'active',
  progress_percentage numeric(5,2) NOT NULL DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_enrollment UNIQUE (user_id, course_id)
);

-- 3.9 Quizzes
CREATE TABLE quizzes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title         text NOT NULL,
  passing_score integer DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 3.10 Quiz Questions
CREATE TABLE quiz_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'single_choice', 'true_false')),
  points        integer NOT NULL DEFAULT 1 CHECK (points > 0),
  sort_order    integer NOT NULL DEFAULT 0
);

-- 3.11 Quiz Answers
CREATE TABLE quiz_answers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  is_correct  boolean NOT NULL DEFAULT false
);

-- 3.12 Exam Results
CREATE TABLE exam_results (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id     uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score       numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  passed      boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_exam_attempt UNIQUE (user_id, quiz_id)
);

-- 3.13 Certificates
CREATE TABLE certificates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id         uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_code  text NOT NULL,
  pdf_url           text,
  issued_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_certificate_code UNIQUE (certificate_code),
  CONSTRAINT unique_certificate_per_course UNIQUE (user_id, course_id)
);

-- 3.14 Favorites
CREATE TABLE favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_favorite UNIQUE (user_id, course_id)
);

-- 3.15 Notifications
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  message     text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  link        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3.16 Reviews
CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating      smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_review UNIQUE (user_id, course_id)
);

-- 4. Database Triggers & Functions
-- ============================================================================

-- 4.1 Auto-populate public.users when a new auth.user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4.2 Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON instructors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_sections_updated_at
  BEFORE UPDATE ON course_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exam_results_updated_at
  BEFORE UPDATE ON exam_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Row Level Security (RLS)
-- ============================================================================

-- 5.0 Helper functions for role checks (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'instructor'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_course_instructor(course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.instructors i ON i.id = c.instructor_id
    WHERE c.id = course_id AND i.user_id = auth.uid()
  );
$$;

-- 5.1 users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any user" ON users
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (public.is_admin());

-- 5.2 instructors
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view instructors" ON instructors
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create instructor profile" ON instructors
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM instructors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can create instructor profiles" ON instructors
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Instructors can update own profile" ON instructors
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update any instructor" ON instructors
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete instructors" ON instructors
  FOR DELETE USING (public.is_admin());

-- 5.3 categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (public.is_admin());

-- 5.4 courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Instructors can view own courses" ON courses
  FOR SELECT USING (
    public.is_instructor()
    AND instructor_id IN (SELECT id FROM instructors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all courses" ON courses
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Instructors can create courses" ON courses
  FOR INSERT WITH CHECK (
    public.is_instructor()
    AND instructor_id IN (SELECT id FROM instructors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can create courses" ON courses
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Instructors can update own courses" ON courses
  FOR UPDATE USING (
    public.is_instructor()
    AND instructor_id IN (SELECT id FROM instructors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update any course" ON courses
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Instructors can delete own courses" ON courses
  FOR DELETE USING (
    public.is_instructor()
    AND instructor_id IN (SELECT id FROM instructors WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete any course" ON courses
  FOR DELETE USING (public.is_admin());

-- 5.5 course_sections
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sections of published courses" ON course_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND status = 'published')
  );

CREATE POLICY "Instructors can view own course sections" ON course_sections
  FOR SELECT USING (public.is_course_instructor(course_id));

CREATE POLICY "Admins can view all sections" ON course_sections
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Instructors can manage own course sections" ON course_sections
  FOR INSERT WITH CHECK (public.is_course_instructor(course_id));

CREATE POLICY "Instructors can update own course sections" ON course_sections
  FOR UPDATE USING (public.is_course_instructor(course_id));

CREATE POLICY "Instructors can delete own course sections" ON course_sections
  FOR DELETE USING (public.is_course_instructor(course_id));

CREATE POLICY "Admins can manage all sections" ON course_sections
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all sections" ON course_sections
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all sections" ON course_sections
  FOR DELETE USING (public.is_admin());

-- 5.6 lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons of published courses" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_sections cs
      JOIN courses c ON c.id = cs.course_id
      WHERE cs.id = section_id AND c.status = 'published'
    )
  );

CREATE POLICY "Instructors can view own course lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_sections cs
      WHERE cs.id = section_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can view all lessons" ON lessons
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Instructors can manage own course lessons" ON lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM course_sections cs
      WHERE cs.id = section_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can update own course lessons" ON lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM course_sections cs
      WHERE cs.id = section_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can delete own course lessons" ON lessons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM course_sections cs
      WHERE cs.id = section_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can manage all lessons" ON lessons
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all lessons" ON lessons
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all lessons" ON lessons
  FOR DELETE USING (public.is_admin());

-- 5.7 lesson_files
ALTER TABLE lesson_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view files of published course lessons" ON lesson_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      JOIN courses c ON c.id = cs.course_id
      WHERE l.id = lesson_id AND c.status = 'published'
    )
  );

CREATE POLICY "Instructors can view own course files" ON lesson_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE l.id = lesson_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can view all files" ON lesson_files
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Instructors can manage own course files" ON lesson_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE l.id = lesson_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can update own course files" ON lesson_files
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE l.id = lesson_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can delete own course files" ON lesson_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE l.id = lesson_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can manage all files" ON lesson_files
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all files" ON lesson_files
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all files" ON lesson_files
  FOR DELETE USING (public.is_admin());

-- 5.8 enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view enrollments in own courses" ON enrollments
  FOR SELECT USING (public.is_course_instructor(course_id));

CREATE POLICY "Admins can view all enrollments" ON enrollments
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Students can enroll themselves" ON enrollments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = enrollments.course_id)
  );

CREATE POLICY "Students can update own enrollment progress" ON enrollments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" ON enrollments
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all enrollments" ON enrollments
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete enrollments" ON enrollments
  FOR DELETE USING (public.is_admin());

-- 5.9 quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students can view quizzes" ON quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN course_sections cs ON cs.course_id = e.course_id
      JOIN lessons l ON l.section_id = cs.id
      WHERE e.user_id = auth.uid() AND l.id = quizzes.lesson_id AND e.status = 'active'
    )
  );

CREATE POLICY "Instructors can view own course quizzes" ON quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE l.id = lesson_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can view all quizzes" ON quizzes
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Instructors can manage own course quizzes" ON quizzes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE l.id = lesson_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can update own course quizzes" ON quizzes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE l.id = lesson_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can delete own course quizzes" ON quizzes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE l.id = lesson_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can manage all quizzes" ON quizzes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all quizzes" ON quizzes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all quizzes" ON quizzes
  FOR DELETE USING (public.is_admin());

-- 5.10 quiz_questions
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students can view quiz questions" ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      JOIN enrollments e ON e.course_id = cs.course_id
      WHERE q.id = quiz_id AND e.user_id = auth.uid() AND e.status = 'active'
    )
  );

CREATE POLICY "Instructors can view own quiz questions" ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE q.id = quiz_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can view all quiz questions" ON quiz_questions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Instructors can manage own quiz questions" ON quiz_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE q.id = quiz_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can update own quiz questions" ON quiz_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE q.id = quiz_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can delete own quiz questions" ON quiz_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE q.id = quiz_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can manage all quiz questions" ON quiz_questions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all quiz questions" ON quiz_questions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all quiz questions" ON quiz_questions
  FOR DELETE USING (public.is_admin());

-- 5.11 quiz_answers
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled students can view quiz answers" ON quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON q.id = qq.quiz_id
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      JOIN enrollments e ON e.course_id = cs.course_id
      WHERE qq.id = question_id AND e.user_id = auth.uid() AND e.status = 'active'
    )
  );

CREATE POLICY "Instructors can view own quiz answers" ON quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON q.id = qq.quiz_id
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE qq.id = question_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can view all quiz answers" ON quiz_answers
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Instructors can manage own quiz answers" ON quiz_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON q.id = qq.quiz_id
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE qq.id = question_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can update own quiz answers" ON quiz_answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON q.id = qq.quiz_id
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE qq.id = question_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Instructors can delete own quiz answers" ON quiz_answers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON q.id = qq.quiz_id
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE qq.id = question_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can manage all quiz answers" ON quiz_answers
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all quiz answers" ON quiz_answers
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all quiz answers" ON quiz_answers
  FOR DELETE USING (public.is_admin());

-- 5.12 exam_results
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own exam results" ON exam_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view exam results in own courses" ON exam_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN course_sections cs ON cs.id = l.section_id
      WHERE q.id = quiz_id AND public.is_course_instructor(cs.course_id)
    )
  );

CREATE POLICY "Admins can view all exam results" ON exam_results
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Students can submit exam results" ON exam_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update exam results" ON exam_results
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete exam results" ON exam_results
  FOR DELETE USING (public.is_admin());

-- 5.13 certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all certificates" ON certificates
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert certificates" ON certificates
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update certificates" ON certificates
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete certificates" ON certificates
  FOR DELETE USING (public.is_admin());

-- 5.14 favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all favorites" ON favorites
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Students can add favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can remove own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any favorite" ON favorites
  FOR DELETE USING (public.is_admin());

-- 5.15 notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Users can mark own notifications as read" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any notification" ON notifications
  FOR DELETE USING (public.is_admin());

-- 5.16 reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Enrolled students can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE user_id = auth.uid() AND course_id = reviews.course_id AND status = 'active'
    )
  );

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage any review" ON reviews
  FOR DELETE USING (public.is_admin());

-- 6. Performance Indexes
-- ============================================================================

-- Foreign key indexes
CREATE INDEX idx_instructors_user_id ON instructors (user_id);
CREATE INDEX idx_courses_instructor_id ON courses (instructor_id);
CREATE INDEX idx_courses_category_id ON courses (category_id);
CREATE INDEX idx_course_sections_course_id ON course_sections (course_id);
CREATE INDEX idx_lessons_section_id ON lessons (section_id);
CREATE INDEX idx_lesson_files_lesson_id ON lesson_files (lesson_id);
CREATE INDEX idx_enrollments_user_id ON enrollments (user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments (course_id);
CREATE INDEX idx_quizzes_lesson_id ON quizzes (lesson_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers (question_id);
CREATE INDEX idx_exam_results_user_id ON exam_results (user_id);
CREATE INDEX idx_exam_results_quiz_id ON exam_results (quiz_id);
CREATE INDEX idx_certificates_user_id ON certificates (user_id);
CREATE INDEX idx_certificates_course_id ON certificates (course_id);
CREATE INDEX idx_favorites_user_id ON favorites (user_id);
CREATE INDEX idx_favorites_course_id ON favorites (course_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_reviews_user_id ON reviews (user_id);
CREATE INDEX idx_reviews_course_id ON reviews (course_id);

-- Slug indexes (unique already enforced by constraints)
CREATE INDEX idx_courses_slug ON courses (slug);
CREATE INDEX idx_categories_slug ON categories (slug);

-- Frequently queried composite indexes
CREATE INDEX idx_enrollments_user_course ON enrollments (user_id, course_id);
CREATE INDEX idx_favorites_user_course ON favorites (user_id, course_id);

-- Status filter indexes
CREATE INDEX idx_courses_status ON courses (status) WHERE status = 'published';

-- Notification query index
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read) WHERE is_read = false;
