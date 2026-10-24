import { getSupabaseEnv } from "@/lib/supabase/env";
import { probePublicReportBackend } from "@/lib/public-report";

/** Diagnóstico seguro (não expõe valores secretos). */
export async function GET() {
  const { url, anonKey, serviceRoleKey } = getSupabaseEnv();
  const publicReport = await probePublicReportBackend();
  const publicLinkReady =
    publicReport.rpcAvailable ||
    (publicReport.adminShareLinksReadable && !publicReport.adminError);

  return Response.json({
    ok: Boolean(url && anonKey && (publicLinkReady || serviceRoleKey)),
    publicLinkReady,
    publicReport,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim(),
      ),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceRoleKey),
      NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim()),
      NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim(),
      ),
      publicClientConfigured: Boolean(url && anonKey),
    },
  });
}
