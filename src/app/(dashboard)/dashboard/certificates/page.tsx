"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, CheckCircle, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMyCertificates,
  useVerifyCertificate,
} from "@/features/certificates/hooks/useCertificates";

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useMyCertificates();
  const verifyCert = useVerifyCertificate();
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    certificate_code: string;
    issued_at: string;
    course: { title: string };
    user: { name: string };
  } | null>(null);
  const [verifyError, setVerifyError] = useState(false);

  const handleVerify = async () => {
    if (!verifyCode.trim()) return;
    setVerifyError(false);
    setVerifyResult(null);
    try {
      const result = await verifyCert.mutateAsync(verifyCode.trim());
      if (result) {
        setVerifyResult(result);
      } else {
        setVerifyError(true);
      }
    } catch {
      setVerifyError(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full max-w-md rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
        <p className="text-muted-foreground">View and verify your earned certificates</p>
      </div>

      {/* Verify */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 font-semibold text-foreground">Verify a Certificate</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Enter certificate code (e.g. CERT-...)"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleVerify} loading={verifyCert.isPending}>
            <Search className="size-4" />
            Verify
          </Button>
        </div>
        {verifyResult && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="size-4" />
            Valid certificate &mdash; {verifyResult.course.title} &mdash; {verifyResult.user.name}
          </div>
        )}
        {verifyError && (
          <p className="mt-3 text-sm text-destructive">
            Certificate not found. Please check the code and try again.
          </p>
        )}
      </div>

      {/* Certificate Grid */}
      {certificates && certificates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <Award className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{cert.course.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Issued {new Date(cert.issued_at).toLocaleDateString()}
              </p>
              <Badge variant="secondary" className="mt-2 w-fit text-xs font-mono">
                {cert.certificate_code}
              </Badge>
              <div className="mt-4 flex items-center gap-2">
                {cert.pdf_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" />
                      View PDF
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Award className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-3 font-medium text-foreground">No certificates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete a course to earn your first certificate.
          </p>
          <Button asChild className="mt-4">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
