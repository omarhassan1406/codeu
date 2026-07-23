"use client";

import { useState } from "react";
import { ChevronDown, ClipboardList, FileText, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CurriculumLesson {
  id: string;
  title: string;
  type: string;
  duration_seconds: number | null;
  is_free_preview: boolean;
  sort_order: number;
}

interface CurriculumSection {
  id: string;
  title: string;
  sort_order: number;
  lessons: CurriculumLesson[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function CurriculumAccordion({ sections }: { sections: CurriculumSection[] }) {
  const [openSection, setOpenSection] = useState<string | null>(sections[0]?.id ?? null);

  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const totalDuration = sections.reduce(
    (sum, s) => sum + s.lessons.reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0),
    0
  );

  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="font-semibold text-foreground">Course Curriculum</span>
        <span className="text-sm text-muted-foreground">
          {totalLessons} lessons &middot; {formatDuration(totalDuration)}
        </span>
      </div>

      {sections.map((section) => {
        const isOpen = openSection === section.id;

        return (
          <div key={section.id} className="border-b border-border last:border-b-0">
            <button
              onClick={() => setOpenSection(isOpen ? null : section.id)}
              className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
                <div>
                  <span className="font-medium text-foreground">{section.title}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {section.lessons.length} lesson
                    {section.lessons.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-border">
                {section.lessons.map((lesson) => {
                  const Icon =
                    lesson.type === "document"
                      ? FileText
                      : lesson.type === "quiz"
                        ? ClipboardList
                        : Play;

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between px-5 py-2.5 pl-12 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">{lesson.title}</span>
                        {lesson.is_free_preview && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Free
                          </Badge>
                        )}
                      </div>
                      {lesson.duration_seconds && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDuration(lesson.duration_seconds)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
