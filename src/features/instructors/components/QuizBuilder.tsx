"use client";

import { useState } from "react";
import { PlusIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface QuizQuestionForm {
  id: string;
  question_text: string;
  question_type: "single_choice" | "multiple_choice" | "true_false";
  points: number;
  answers: { id: string; answer_text: string; is_correct: boolean }[];
}

export interface QuizFormData {
  title: string;
  passing_score: number;
  questions: QuizQuestionForm[];
}

interface QuizBuilderProps {
  lessonTitle: string;
  initialQuiz?: QuizFormData | null;
  onSave: (quiz: QuizFormData) => Promise<void>;
  onCancel: () => void;
}

let idCounter = 0;
function uid() {
  return `qb_${++idCounter}_${Date.now()}`;
}

export function QuizBuilder({ lessonTitle, initialQuiz, onSave, onCancel }: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<QuizFormData>(
    initialQuiz ?? {
      title: `${lessonTitle} Quiz`,
      passing_score: 70,
      questions: [],
    }
  );
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: uid(),
          question_text: "",
          question_type: "single_choice",
          points: 1,
          answers: [
            { id: uid(), answer_text: "", is_correct: false },
            { id: uid(), answer_text: "", is_correct: false },
          ],
        },
      ],
    }));
  };

  const removeQuestion = (qId: string) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }));
  };

  const updateQuestion = (qId: string, field: string, value: unknown) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId ? { ...q, [field]: value } : q
      ),
    }));
  };

  const addAnswer = (qId: string) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? { ...q, answers: [...q.answers, { id: uid(), answer_text: "", is_correct: false }] }
          : q
      ),
    }));
  };

  const removeAnswer = (qId: string, aId: string) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? { ...q, answers: q.answers.filter((a) => a.id !== aId) }
          : q
      ),
    }));
  };

  const updateAnswer = (qId: string, aId: string, field: string, value: unknown) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === aId ? { ...a, [field]: value } : a
              ),
            }
          : q
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(quiz);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Quiz: {quiz.title}</h3>
        <Badge variant="secondary">{quiz.questions.length} questions</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Quiz Title</Label>
          <Input
            value={quiz.title}
            onChange={(e) => setQuiz((p) => ({ ...p, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Passing Score (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={quiz.passing_score}
            onChange={(e) =>
              setQuiz((p) => ({ ...p, passing_score: Number(e.target.value) }))
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Questions</h4>
            <Button size="sm" variant="outline" onClick={addQuestion}>
            <PlusIcon className="size-4" />
            Add Question
          </Button>
        </div>

        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Question {qi + 1}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeQuestion(q.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="mb-3 space-y-2">
              <Input
                placeholder="Question text"
                value={q.question_text}
                onChange={(e) => updateQuestion(q.id, "question_text", e.target.value)}
              />
            </div>

            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select
                  value={q.question_type}
                  onValueChange={(v) =>
                    updateQuestion(q.id, "question_type", v)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Points</Label>
                <Input
                  type="number"
                  min={1}
                  value={q.points}
                  onChange={(e) =>
                    updateQuestion(q.id, "points", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Answers</span>
                          <Button size="sm" variant="ghost" onClick={() => addAnswer(q.id)}>
                          <PlusIcon className="size-3" />
                  Add
                </Button>
              </div>
              {q.answers.map((a, ai) => (
                <div key={a.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Answer ${ai + 1}`}
                    value={a.answer_text}
                    onChange={(e) =>
                      updateAnswer(q.id, a.id, "answer_text", e.target.value)
                    }
                    className="flex-1"
                  />
                  <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={a.is_correct}
                      onChange={(e) =>
                        updateAnswer(q.id, a.id, "is_correct", e.target.checked)
                      }
                      className="size-4 accent-brand-600"
                    />
                    Correct
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAnswer(q.id, a.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {quiz.questions.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No questions yet. Click &quot;Add Question&quot; to get started.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          Save Quiz
        </Button>
      </div>
    </div>
  );
}


