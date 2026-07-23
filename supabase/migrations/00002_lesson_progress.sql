-- Add lesson_progress table for tracking individual lesson completion
CREATE TABLE lesson_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id   uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_course ON lesson_progress (user_id, course_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress (lesson_id);

-- Trigger for updated_at
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own progress" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own progress" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all progress" ON lesson_progress
  FOR ALL USING (public.is_admin());
