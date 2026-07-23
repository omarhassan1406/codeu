"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function SuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");
  const courseSlug = searchParams.get("course_slug");
  const amount = searchParams.get("amount");

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="size-10 text-green-600" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome aboard! Your course has been added to your library.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-foreground">{transactionId ?? "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium text-foreground">${amount ?? "0.00"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="size-4" /> Completed
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href={courseSlug ? `/courses/${courseSlug}/learn` : "/dashboard/my-courses"}>
            Start Learning
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-20 text-center"><Skeleton className="mx-auto h-8 w-48" /><Skeleton className="mx-auto mt-4 h-48 w-full rounded-xl" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
