"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface WishlistItem {
  id: string;
  course_id: string;
  course: {
    title: string;
    slug: string;
    thumbnail_url: string | null;
    price: number;
    discount_price: number | null;
    level: string | null;
    instructor_name: string;
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("favorites")
      .select(
        "id, course_id, course:courses(id, title, slug, thumbnail_url, price, discount_price, level, instructor:instructors!inner(user:users(name)))"
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems(
          (data ?? []).map((f) => {
            const course = f.course as unknown as {
              title: string;
              slug: string;
              thumbnail_url: string | null;
              price: number;
              discount_price: number | null;
              level: string | null;
              instructor: { user: { name: string } }[];
            };
            return {
              id: f.id,
              course_id: f.course_id,
              course: {
                title: course.title,
                slug: course.slug,
                thumbnail_url: course.thumbnail_url,
                price: course.price,
                discount_price: course.discount_price,
                level: course.level,
                instructor_name:
                  (course.instructor?.[0] as unknown as { user: { name: string } })?.user?.name ??
                  "Unknown",
              },
            };
          })
        );
        setLoading(false);
      });
  }, []);

  const handleRemove = async (id: string) => {
    setRemoving(id);
    const supabase = createClient();
    await supabase.from("favorites").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setRemoving(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Wishlist</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Heart className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-3 font-medium text-foreground">Your wishlist is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">Save courses you are interested in.</p>
          <Button asChild className="mt-4">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const price = item.course.discount_price ?? item.course.price;
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <Link
                  href={`/courses/${item.course.slug}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.course.thumbnail_url ? (
                      <img
                        src={item.course.thumbnail_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <Heart className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{item.course.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.course.instructor_name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        ${price.toFixed(2)}
                      </span>
                      {item.course.level && (
                        <span className="text-xs capitalize text-muted-foreground">
                          {item.course.level}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  loading={removing === item.id}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
