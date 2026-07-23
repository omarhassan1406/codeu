import { createClient } from "@/lib/supabase/client";

export const quizService = {
  async getQuizByLesson(lessonId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("quizzes")
      .select(
        `id, lesson_id, title, passing_score,
         questions:quiz_questions(
           id, question_text, question_type, points, sort_order,
           answers:quiz_answers(id, answer_text, is_correct)
         )`
      )
      .eq("lesson_id", lessonId)
      .order("questions.sort_order")
      .single();
    return data as unknown as {
      id: string;
      lesson_id: string;
      title: string;
      passing_score: number;
      questions: {
        id: string;
        question_text: string;
        question_type: string;
        points: number;
        sort_order: number;
        answers: { id: string; answer_text: string; is_correct: boolean }[];
      }[];
    } | null;
  },

  async submitQuiz(quizId: string, answers: Record<string, string[]>) {
    const supabase = createClient();
    const { data: quiz } = await supabase
      .from("quizzes")
      .select(
        `passing_score,
         questions:quiz_questions(
           id, points,
           answers:quiz_answers(id, is_correct)
         )`
      )
      .eq("id", quizId)
      .single();

    if (!quiz) throw new Error("Quiz not found");

    let earned = 0;
    let total = 0;

    for (const question of quiz.questions as unknown as {
      id: string;
      points: number;
      answers: { id: string; is_correct: boolean }[];
    }[]) {
      total += question.points;
      const userAnswer = answers[question.id];
      if (!userAnswer || userAnswer.length === 0) continue;

      const correctIds = question.answers.filter((a) => a.is_correct).map((a) => a.id);

      const isCorrect =
        userAnswer.length === correctIds.length &&
        userAnswer.every((id) => correctIds.includes(id)) &&
        correctIds.every((id) => userAnswer.includes(id));

      if (isCorrect) earned += question.points;
    }

    const score = total > 0 ? Math.round((earned / total) * 100) : 0;
    const passed = score >= quiz.passing_score;

    const { error } = await supabase.from("exam_results").upsert(
      {
        quiz_id: quizId,
        score,
        passed,
      },
      { onConflict: "user_id, quiz_id" }
    );

    if (error) throw error;

    return {
      quiz_id: quizId,
      score,
      passed,
      total_points: total,
      earned_points: earned,
    };
  },

  async getQuizResult(quizId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("exam_results").select("*").eq("quiz_id", quizId).single();
    return data;
  },
};
