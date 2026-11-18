"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { requestPasswordReset } from "@/app/actions/auth";
import { APP_DISPLAY_NAME } from "@/lib/branding";

type Props = {
  searchParams: Promise<{ missing?: string; next?: string; error?: string }>;
};

export function LoginForm({ searchParams }: Props) {
  const params = use(searchParams);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.error === "link_invalido" ? "Link inválido ou expirado. Solicite um novo." : null,
  );
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error: signErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signErr) throw signErr;
        router.push(params.next || "/admin");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha no login.");
      }
    });
  };

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
        await requestPasswordReset(email, redirectTo);
        setResetSent(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar e-mail.");
      }
    });
  };

  return (
    <div className="card w-full max-w-md p-8">
      <h1 className="font-brand text-xl font-bold text-[var(--teal-dark)]">
        {APP_DISPLAY_NAME}
      </h1>
      <p className="mb-6 text-sm text-[var(--gray-text)]">
        Área exclusiva da Prof.ª Joyce Neres
      </p>

      {params.missing === "supabase" && (
        <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No Vercel (Production), defina{" "}
          <strong>NEXT_PUBLIC_SUPABASE_URL</strong> e{" "}
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> (ou{" "}
          <strong>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</strong>), além de{" "}
          <strong>SUPABASE_SERVICE_ROLE_KEY</strong>, e faça redeploy.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {mode === "login" ? (
        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="form-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--teal-dark)] hover:underline"
            onClick={() => { setMode("reset"); setError(null); setResetSent(false); }}
          >
            Esqueceu a senha?
          </button>
        </form>
      ) : resetSent ? (
        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            E-mail enviado! Verifique sua caixa de entrada e clique no link para redefinir a senha.
          </div>
          <button
            type="button"
            className="text-sm text-[var(--teal-dark)] hover:underline"
            onClick={() => { setMode("login"); setResetSent(false); }}
          >
            Voltar ao login
          </button>
        </div>
      ) : (
        <form onSubmit={onReset} className="space-y-4">
          <p className="text-sm text-[var(--gray-text)]">
            Digite seu e-mail e enviaremos um link para redefinir a senha.
          </p>
          <div>
            <label className="form-label" htmlFor="reset-email">
              E-mail
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={pending}>
            {pending ? "Enviando…" : "Enviar link de redefinição"}
          </button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--teal-dark)] hover:underline"
            onClick={() => { setMode("login"); setError(null); }}
          >
            Voltar ao login
          </button>
        </form>
      )}
    </div>
  );
}
