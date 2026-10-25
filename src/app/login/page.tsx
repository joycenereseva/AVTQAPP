import { LoginForm } from "@/components/auth/LoginForm";
import { BrandMark } from "@/components/brand/BrandMark";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ missing?: string; next?: string }>;
}) {
  return (
    <div className="login-shell">
      <aside className="login-brand-panel">
        <BrandMark variant="login" className="mb-6 [&_img]:h-16 [&_img]:w-16 [&_img]:ring-white/30" />
        <p className="max-w-sm text-sm leading-relaxed text-white/85">
          {APP_DISPLAY_NAME} — cadastro de alunos, avaliações periódicas, relatório PDF e link
          rolável para os responsáveis no celular.
        </p>
      </aside>
      <div className="login-form-panel">
        <LoginForm searchParams={searchParams} />
      </div>
    </div>
  );
}
