import { AppHeader } from "@/components/layout/AppHeader";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}
