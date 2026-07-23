"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Wallet, Check, Tag, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseForCheckout, useProcessCheckout } from "@/features/checkout/hooks/useCheckout";
import { checkoutService } from "@/features/checkout/services/checkout.service";
import type { PaymentDetails } from "@/features/checkout/types";

export default function CheckoutPage() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const router = useRouter();
  const { data: course, isLoading } = useCourseForCheckout(courseSlug);
  const processCheckout = useProcessCheckout();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_percent: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "digital_wallet">("credit_card");
  const [cardDetails, setCardDetails] = useState({ cardNumber: "", cardName: "", expiry: "", cvv: "" });

  const handleApplyPromo = () => {
    const result = checkoutService.validatePromoCode(promoCode);
    if (result) {
      setAppliedPromo(result);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
      setAppliedPromo(null);
    }
  };

  const originalPrice = course?.discount_price ?? course?.price ?? 0;
  const discountAmount = appliedPromo ? (originalPrice * appliedPromo.discount_percent) / 100 : 0;
  const finalPrice = originalPrice - discountAmount;

  const handlePurchase = async () => {
    if (!course) return;

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      ...(paymentMethod === "credit_card" && {
        cardNumber: cardDetails.cardNumber,
        cardName: cardDetails.cardName,
        expiry: cardDetails.expiry,
        cvv: cardDetails.cvv,
      }),
      ...(paymentMethod === "digital_wallet" && {
        walletProvider: "digital_wallet",
      }),
    };

    try {
      const result = await processCheckout.mutateAsync({
        courseId: course.courseId,
        paymentDetails,
        promoCode: appliedPromo?.code,
      });

      router.push(`/checkout/success?transaction_id=${result.transaction_id}&course_slug=${course.slug}&amount=${result.amount_paid}`);
    } catch {
      // Error handled by sonner toast
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <BookOpen className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Course not found</h2>
        <Button asChild>
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href={`/courses/${course.slug}`}>
          <ArrowLeft className="size-4" /> Back to Course
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase to start learning.</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Promo Code</h2>
            <div className="flex gap-2">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleApplyPromo}>Apply</Button>
            </div>
            {appliedPromo && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <Check className="size-4" /> {appliedPromo.discount_percent}% discount applied!
              </p>
            )}
            {promoError && <p className="mt-2 text-sm text-red-500">{promoError}</p>}
            <p className="mt-2 text-xs text-muted-foreground">Try: SAVE10, SAVE20, FREECODEU</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Payment Method</h2>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("credit_card")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                  paymentMethod === "credit_card"
                    ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <CreditCard className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Credit Card</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, etc.</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("digital_wallet")}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                  paymentMethod === "digital_wallet"
                    ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Wallet className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Digital Wallet</p>
                  <p className="text-xs text-muted-foreground">PayPal, Apple Pay, etc.</p>
                </div>
              </button>
            </div>

            {paymentMethod === "credit_card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails((p) => ({ ...p, cardNumber: e.target.value }))}
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cardholder Name</Label>
                  <Input
                    value={cardDetails.cardName}
                    onChange={(e) => setCardDetails((p) => ({ ...p, cardName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails((p) => ({ ...p, expiry: e.target.value }))}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails((p) => ({ ...p, cvv: e.target.value }))}
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "digital_wallet" && (
              <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                You will be redirected to the payment provider to complete your purchase.
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handlePurchase}
            loading={processCheckout.isPending}
          >
            Pay ${finalPrice.toFixed(2)} & Enroll Now
          </Button>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 sticky top-24">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Order Summary</h2>

            <div className="flex gap-3 mb-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <BookOpen className="size-6" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{course.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="size-3" /> {course.instructor_name}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="text-foreground">${originalPrice.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Tag className="size-3" /> Discount ({appliedPromo.discount_percent}%)
                  </span>
                  <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${finalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
