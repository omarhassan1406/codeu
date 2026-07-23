export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "single_choice" | "true_false";
  points: number;
  sort_order: number;
  answers: {
    id: string;
    answer_text: string;
    is_correct: boolean;
  }[];
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  questions: QuizQuestion[];
}

export interface QuizResult {
  quiz_id: string;
  score: number;
  passed: boolean;
  total_points: number;
  earned_points: number;
}
