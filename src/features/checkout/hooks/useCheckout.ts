"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutService } from "@/features/checkout/services/checkout.service";
import type { PaymentDetails } from "@/features/checkout/types";

export function useCourseForCheckout(slug: string) {
  return useQuery({
    queryKey: ["checkout", slug],
    queryFn: () => checkoutService.getCourseForCheckout(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useProcessCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      paymentDetails,
      promoCode,
    }: {
      courseId: string;
      paymentDetails: PaymentDetails;
      promoCode?: string;
    }) => checkoutService.processCheckout(courseId, paymentDetails, promoCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
