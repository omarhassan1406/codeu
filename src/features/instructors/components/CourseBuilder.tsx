"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronRight, PlusIcon, Trash2, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useCreateCourse, useUpdateCourse, useCurriculumMutation, useCourseFull } from "@/features/instructors/hooks/useInstructor";
import { QuizBuilder, type QuizFormData } from "@/features/instructors/components/QuizBuilder";

const basicInfoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  subtitle: z.string().optional(),
  category_id: z.string().min(1, "Category is required"),
  level: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or more"),
  discount_price: z.number().optional().nullable(),
  thumbnail_url: z.string().optional(),
  preview_video_url: z.string().optional(),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;

interface LessonState {
  id: string;
  title: string;
  slug: string;
  type: "video" | "document" | "quiz";
  video_url: string;
  duration_seconds: number;
  is_free_preview: boolean;
  quiz: QuizFormData | null;
}

interface SectionState {
  id: string;
  title: string;
  lessons: LessonState[];
}

let idCounter = 0;
function uid() {
  return `cb_${++idCounter}_${Date.now()}`;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

const steps = ["Basic Info", "Curriculum", "Quizzes", "Settings"];

interface CourseBuilderProps {
  courseId?: string;
  isEdit?: boolean;
}

export function CourseBuilder({ courseId, isEdit }: CourseBuilderProps) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const { data: courseFull, isLoading: loadingCourse } = useCourseFull(courseId ?? "");
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const curriculum = useCurriculumMutation();

  const [step, setStep] = useState(0);
  const [sections, setSections] = useState<SectionState[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [quizBuilderFor, setQuizBuilderFor] = useState<string | null>(null);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const effectiveCourseId = courseId ?? createdCourseId;

  const form = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: useMemo(() => {
      if (isEdit && courseFull?.course) {
        const c = courseFull.course;
        return {
          title: c.title,
          slug: c.slug,
          subtitle: c.subtitle ?? "",
          category_id: c.category_id,
          level: c.level ?? "",
          price: c.price,
          discount_price: c.discount_price,
          thumbnail_url: c.thumbnail_url ?? "",
          preview_video_url: c.preview_video_url ?? "",
        };
      }
      return {
        title: "",
        slug: "",
        subtitle: "",
        category_id: "",
        level: "",
        price: 0,
        discount_price: null,
        thumbnail_url: "",
        preview_video_url: "",
      };
    }, [isEdit, courseFull]),
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;

  if (isEdit && loadingCourse) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isEdit && !courseFull) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <BookOpen className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Course not found</h2>
        <Button asChild>
          <a href="/instructor/courses">Back to Courses</a>
        </Button>
      </div>
    );
  }

  const handleBasicInfoSubmit = async (data: BasicInfoData) => {
    try {
      if (isEdit && courseId) {
        await updateCourse.mutateAsync({ courseId, data: data as unknown as Record<string, unknown> });
        toast.success("Basic info saved");
        setStep(1);
      } else {
        const course = await createCourse.mutateAsync(data);
        setCreatedCourseId(course.id);
        toast.success("Course created! Now add your curriculum.");
        setStep(1);
      }
    } catch {
      toast.error("Failed to save basic info");
    }
  };

  const addSection = () => {
    setSections((prev) => [...prev, { id: uid(), title: "", lessons: [] }]);
  };

  const updateSection = (secId: string, title: string) => {
    setSections((prev) => prev.map((s) => (s.id === secId ? { ...s, title } : s)));
  };

  const removeSection = (secId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== secId));
  };

  const addLesson = (secId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === secId
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  id: uid(),
                  title: "",
                  slug: "",
                  type: "video" as const,
                  video_url: "",
                  duration_seconds: 0,
                  is_free_preview: false,
                  quiz: null,
                },
              ],
            }
          : s
      )
    );
  };

  const updateLesson = (lessonId: string, field: string, value: unknown) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, [field]: value } : l)),
      }))
    );
  };

  const removeLesson = (lessonId: string) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        lessons: s.lessons.filter((l) => l.id !== lessonId),
      }))
    );
  };

  const saveCurriculum = async () => {
    if (!effectiveCourseId) return;
    try {
      for (let si = 0; si < sections.length; si++) {
        const s = sections[si]!;
        if (!s.title.trim()) continue;

        const newSection = await curriculum.createSection.mutateAsync({
          courseId: effectiveCourseId,
          title: s.title,
          sortOrder: si + 1,
        });

        for (let li = 0; li < s.lessons.length; li++) {
          const l = s.lessons[li]!;
          if (!l.title.trim()) continue;

          await curriculum.createLesson.mutateAsync({
            section_id: newSection.id,
            title: l.title,
            slug: l.slug || slugify(l.title),
            type: l.type,
            video_url: l.video_url || null,
            duration_seconds: l.duration_seconds || null,
            is_free_preview: l.is_free_preview,
            sort_order: li + 1,
          });
        }
      }

      toast.success("Curriculum saved");
      setStep(2);
    } catch {
      toast.error("Failed to save curriculum");
    }
  };

  const handleSaveQuiz = async (lessonId: string, quiz: QuizFormData) => {
    if (!effectiveCourseId) return;
    try {
      await curriculum.saveQuiz.mutateAsync({
        lesson_id: lessonId,
        title: quiz.title,
        passing_score: quiz.passing_score,
        questions: quiz.questions.map((q, qi) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          points: q.points,
          sort_order: qi + 1,
          answers: q.answers.map((a) => ({
            answer_text: a.answer_text,
            is_correct: a.is_correct,
          })),
        })),
      });
      setQuizBuilderFor(null);
      toast.success("Quiz saved");
    } catch {
      toast.error("Failed to save quiz");
    }
  };

  const handlePublish = async () => {
    if (!effectiveCourseId) return;
    try {
      await updateCourse.mutateAsync({ courseId: effectiveCourseId, data: { status } });
      toast.success(`Course ${status === "published" ? "published" : "saved as draft"}!`);
      router.push("/instructor/courses");
    } catch {
      toast.error("Failed to update course status");
    }
  };

  const quizLessons = sections.flatMap((s) =>
    s.lessons.filter((l) => l.type === "quiz" && l.title.trim()).map((l) => ({ ...l, sectionTitle: s.title }))
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                  i < step
                    ? "bg-brand-600 text-white"
                    : i === step
                    ? "border-2 border-brand-600 text-brand-600"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  i <= step ? "text-foreground" : "text-muted-foreground"
                } hidden sm:inline`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-8 sm:w-16 ${
                    i < step ? "bg-brand-600" : "bg-border"
                  } hidden sm:block`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <form onSubmit={handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            <p className="mb-6 text-sm text-muted-foreground">Provide the core details for your course.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g. Full-Stack Next.js 16 Masterclass"
                  onChange={(e) => {
                    setValue("title", e.target.value);
                    if (!isEdit) setValue("slug", slugify(e.target.value));
                  }}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...register("slug")} placeholder="full-stack-nextjs-16-masterclass" />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle (optional)</Label>
                <Input id="subtitle" {...register("subtitle")} placeholder="A short tagline for your course" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select value={watch("category_id")} onValueChange={(v) => setValue("category_id", v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories ?? []).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={watch("level")} onValueChange={(v) => setValue("level", v ?? undefined)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="all">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" min={0} step={0.01} {...register("price", { valueAsNumber: true })} />
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_price">Discount Price ($) (optional)</Label>
                  <Input id="discount_price" type="number" min={0} step={0.01} {...register("discount_price", { valueAsNumber: true })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
                <Input id="thumbnail_url" {...register("thumbnail_url")} placeholder="https://images.example.com/course-thumbnail.jpg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview_video_url">Preview Video URL (optional)</Label>
                <Input id="preview_video_url" {...register("preview_video_url")} placeholder="https://vimeo.com/123456789" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={createCourse.isPending || updateCourse.isPending}>
              {isEdit ? "Save & Continue" : "Create Course & Continue"}
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Curriculum</h2>
                <p className="text-sm text-muted-foreground">Build your course structure with sections and lessons.</p>
              </div>
              <Button variant="outline" onClick={addSection}>
                <PlusIcon className="size-4" /> Add Section
              </Button>
            </div>

            {sections.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No sections yet. Add your first section to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((sec, si) => (
                  <div key={sec.id} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Input
                        value={sec.title}
                        onChange={(e) => updateSection(sec.id, e.target.value)}
                        placeholder={`Section ${si + 1} title`}
                        className="flex-1 font-medium"
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeSection(sec.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    {sec.lessons.map((lesson, li) => (
                      <div key={lesson.id} className="mb-2 rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={lesson.title}
                                onChange={(e) => {
                                  updateLesson(lesson.id, "title", e.target.value);
                                  updateLesson(lesson.id, "slug", slugify(e.target.value));
                                }}
                                placeholder={`Lesson ${li + 1} title`}
                                className="flex-1"
                              />
                              <Select value={lesson.type} onValueChange={(v) => updateLesson(lesson.id, "type", v)}>
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="document">Document</SelectItem>
                                  <SelectItem value="quiz">Quiz</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {lesson.type === "video" && (
                              <div className="grid gap-2 sm:grid-cols-2">
                                <Input
                                  value={lesson.video_url}
                                  onChange={(e) => updateLesson(lesson.id, "video_url", e.target.value)}
                                  placeholder="Video URL"
                                />
                                <Input
                                  type="number"
                                  value={lesson.duration_seconds || ""}
                                  onChange={(e) => updateLesson(lesson.id, "duration_seconds", Number(e.target.value))}
                                  placeholder="Duration (seconds)"
                                />
                              </div>
                            )}

                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              <input
                                type="checkbox"
                                checked={lesson.is_free_preview}
                                onChange={(e) => updateLesson(lesson.id, "is_free_preview", e.target.checked)}
                                className="size-4 accent-brand-600"
                              />
                              Free preview
                            </label>
                          </div>

                          <Button size="sm" variant="ghost" onClick={() => removeLesson(lesson.id)} className="text-red-500 hover:text-red-600">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button size="sm" variant="ghost" onClick={() => addLesson(sec.id)} className="mt-2">
                      <PlusIcon className="size-4" /> Add Lesson
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={saveCurriculum} loading={curriculum.createSection.isPending}>
              Save Curriculum & Continue <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Quiz Builder</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create quizzes for quiz-type lessons. Select a lesson below to add or edit its quiz.
            </p>

            {quizLessons.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No quiz-type lessons found. Go back to the Curriculum tab and mark some lessons as &quot;Quiz&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizLessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.sectionTitle}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setQuizBuilderFor(lesson.id)}>
                        {lesson.quiz ? "Edit Quiz" : "Add Quiz"}
                      </Button>
                    </div>

                    {quizBuilderFor === lesson.id && (
                      <div className="mt-4 border-t border-border pt-4">
                        <QuizBuilder
                          lessonTitle={lesson.title}
                          initialQuiz={lesson.quiz}
                          onSave={(quiz) => handleSaveQuiz(lesson.id, quiz)}
                          onCancel={() => setQuizBuilderFor(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>
              Continue to Settings <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Settings & Publish</h2>
            <p className="mb-6 text-sm text-muted-foreground">Set your course visibility and publish when ready.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Course Status</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus("draft")}
                    className={`flex-1 rounded-lg border p-4 text-left transition-colors ${
                      status === "draft"
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-medium text-foreground">Draft</p>
                    <p className="text-xs text-muted-foreground">Only you can see this course.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("published")}
                    className={`flex-1 rounded-lg border p-4 text-left transition-colors ${
                      status === "published"
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-medium text-foreground">Published</p>
                    <p className="text-xs text-muted-foreground">Students can discover and enroll.</p>
                  </button>
                </div>
              </div>

              {effectiveCourseId && origin && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    Course URL: {origin}/courses/{watch("slug")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handlePublish} loading={updateCourse.isPending}>
              {status === "published" ? "Publish Course" : "Save as Draft"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
