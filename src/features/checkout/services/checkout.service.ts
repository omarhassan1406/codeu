import { createClient } from "@/lib/supabase/client";
import type { CheckoutItem, CheckoutResult, PaymentDetails, PromoCode } from "@/features/checkout/types";

const MOCK_PROMO_CODES: Record<string, PromoCode> = {
  SAVE10: { code: "SAVE10", discount_percent: 10 },
  SAVE20: { code: "SAVE20", discount_percent: 20 },
  FREECODEU: { code: "FREECODEU", discount_percent: 100 },
};

function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function validatePaymentDetails(_details: PaymentDetails): { valid: boolean; error?: string } {
  void _details;
  return { valid: true };
}

async function authorizePayment(_amount: number): Promise<{ authorized: boolean; transactionId: string }> {
  void _amount;
  await new Promise((r) => setTimeout(r, 1000));
  return { authorized: true, transactionId: generateTransactionId() };
}

export const checkoutService = {
  validatePromoCode(code: string): PromoCode | null {
    const normalized = code.trim().toUpperCase();
    return MOCK_PROMO_CODES[normalized] ?? null;
  },

  async processCheckout(
    courseId: string,
    paymentDetails: PaymentDetails,
    promoCode?: string
  ): Promise<CheckoutResult> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: course } = await supabase
      .from("courses")
      .select("price, discount_price")
      .eq("id", courseId)
      .single();

    if (!course) throw new Error("Course not found");

    let amount = course.discount_price ?? course.price;

    if (promoCode) {
      const code = this.validatePromoCode(promoCode);
      if (code) {
        amount = amount - (amount * code.discount_percent) / 100;
      }
    }

    const validation = validatePaymentDetails(paymentDetails);
    if (!validation.valid) throw new Error(validation.error ?? "Invalid payment details");

    const { authorized, transactionId } = await authorizePayment(amount);
    if (!authorized) throw new Error("Payment authorization failed");

    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: "active",
      })
      .select("id")
      .single();

    if (error) throw error;

    return {
      success: true,
      transaction_id: transactionId,
      enrollment_id: enrollment.id,
      amount_paid: amount,
    };
  },

  async getCourseForCheckout(slug: string): Promise<CheckoutItem | null> {
    const supabase = createClient();

    const { data: course } = await supabase
      .from("courses")
      .select("id, title, slug, thumbnail_url, price, discount_price, instructor_id")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (!course) return null;

    const { data: instructor } = await supabase
      .from("instructors")
      .select("user:user_id(name, avatar_url)")
      .eq("id", course.instructor_id)
      .single();

    const user = instructor?.user as unknown as { name: string; avatar_url: string | null } | null;

    return {
      courseId: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail_url: course.thumbnail_url,
      price: course.price,
      discount_price: course.discount_price,
      instructor_name: user?.name ?? "Instructor",
      instructor_avatar: user?.avatar_url ?? null,
    };
  },
};
