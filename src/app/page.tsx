"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseGrid } from "@/features/courses/components/CourseGrid";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useFeaturedCourses } from "@/features/courses/hooks/useCourses";

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description: "Learn from industry professionals with real-world experience",
  },
  {
    icon: Zap,
    title: "Project-Based Learning",
    description: "Build production-ready projects that showcase your skills",
  },
  {
    icon: Shield,
    title: "Lifetime Access",
    description: "Learn at your own pace with lifetime access to all content",
  },
  {
    icon: GraduationCap,
    title: "Certificates",
    description: "Earn verified certificates to boost your career",
  },
];

export default function HomePage() {
  const { data: categories } = useCategories();
  const { data: featuredCourses, isLoading } = useFeaturedCourses(6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/30 px-4 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Master Modern <span className="text-brand-600">Technology</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Hands-on courses in web development, mobile apps, AI, and backend systems. Learn by
            building real projects.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base">
              <Link href="/courses">
                Explore Courses
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      {categories && categories.length > 0 && (
        <section className="px-4 py-8">
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-brand-600 hover:text-white hover:border-brand-600"
              >
                <span className="size-4" dangerouslySetInnerHTML={{ __html: cat.icon ?? "" }} />
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Featured Courses</h2>
            <p className="mt-1 text-muted-foreground">
              Start learning from our most popular courses
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/courses">
              View All <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        <CourseGrid courses={featuredCourses ?? []} isLoading={isLoading} />

        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>
      </section>

      {/* Why CodeU */}
      <section className="border-t border-border bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">Why CodeU?</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Everything you need to advance your career
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-brand-600/30"
                >
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to level up?</h2>
          <p className="mt-2 text-muted-foreground">
            Join thousands of learners and start building your future today.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
