import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, icon, description, created_at, courses(count)")
    .order("name");

  if (!data) return NextResponse.json([]);

  const result = data.map((cat) => {
    const coursesRel = cat.courses as unknown as { count: number }[] | undefined;
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      created_at: cat.created_at,
      courseCount: coursesRel?.[0]?.count ?? 0,
    };
  });

  return NextResponse.json(result);
}
