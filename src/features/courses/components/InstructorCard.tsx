"use client";

import { Award, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface InstructorCardProps {
  name: string;
  avatar_url: string | null;
  bio: string | null;
  headline: string | null;
  rating: number;
  total_students: number;
}

export function InstructorCard({
  name,
  avatar_url,
  bio,
  headline,
  rating,
  total_students,
}: InstructorCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-start gap-4">
        <Avatar className="size-14">
          <AvatarImage src={avatar_url ?? undefined} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">{name}</h4>
          {headline && <p className="text-sm text-muted-foreground line-clamp-1">{headline}</p>}
        </div>
      </div>

      {bio && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">{bio}</p>
      )}

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="size-4" />
          {total_students.toLocaleString()} students
        </span>
        <span className="flex items-center gap-1">
          <Award className="size-4" />
          Instructor
        </span>
      </div>
    </div>
  );
}
