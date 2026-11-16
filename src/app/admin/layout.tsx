import { AppHeader } from "@/components/layout/AppHeader";
import { requireAuthUser } from "@/lib/supabase/require-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuthUser("/admin");

  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}
