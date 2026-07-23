import { createClient } from "@/lib/supabase/client";

function generateCode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CERT-${ts}-${rand}`;
}

export const certificateService = {
  async getMyCertificates() {
    const supabase = createClient();
    const { data } = await supabase
      .from("certificates")
      .select("*, course:courses(title, slug)")
      .order("issued_at", { ascending: false });
    return (data ?? []) as unknown as {
      id: string;
      user_id: string;
      course_id: string;
      certificate_code: string;
      pdf_url: string | null;
      issued_at: string;
      course: { title: string; slug: string };
    }[];
  },

  async issueCertificate(courseId: string) {
    const supabase = createClient();
    const code = generateCode();
    const { data, error } = await supabase
      .from("certificates")
      .insert({ course_id: courseId, certificate_code: code })
      .select("*, course:courses(title, slug)")
      .single();
    if (error) throw error;
    return data as unknown as {
      id: string;
      user_id: string;
      course_id: string;
      certificate_code: string;
      pdf_url: string | null;
      issued_at: string;
      course: { title: string; slug: string };
    };
  },

  async verifyCode(code: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("certificates")
      .select("certificate_code, issued_at, course:courses(title), user:users(name)")
      .eq("certificate_code", code)
      .single();
    return data as unknown as {
      certificate_code: string;
      issued_at: string;
      course: { title: string };
      user: { name: string };
    } | null;
  },
};
