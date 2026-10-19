import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ missing?: string; next?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gray-bg)] px-4">
      <LoginForm searchParams={searchParams} />
    </div>
  );
}
