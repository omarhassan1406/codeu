"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificateService } from "@/features/certificates/services/certificate.service";

export function useMyCertificates() {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: () => certificateService.getMyCertificates(),
    staleTime: 60_000,
  });
}

export function useIssueCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => certificateService.issueCertificate(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}

export function useVerifyCertificate() {
  return useMutation({
    mutationFn: (code: string) => certificateService.verifyCode(code),
  });
}
