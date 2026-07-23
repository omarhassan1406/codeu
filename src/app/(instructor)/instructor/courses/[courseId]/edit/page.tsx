"use client";

import { useParams } from "next/navigation";
import { CourseBuilder } from "@/features/instructors/components/CourseBuilder";

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
        <p className="text-muted-foreground">Update your course content and settings.</p>
      </div>
      <CourseBuilder courseId={courseId} isEdit />
    </div>
  );
}
