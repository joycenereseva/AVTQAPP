import type { PublicReportPayload } from "@/lib/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function fetchPublicReportByToken(
  token: string,
): Promise<PublicReportPayload | null> {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("get_public_report", {
    p_token: token,
  });
  if (error || !data) return null;
  return data as PublicReportPayload;
}
