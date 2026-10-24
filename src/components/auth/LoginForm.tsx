"use client";

import { use, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_DISPLAY_NAME } from "@/lib/branding";

type Props = {
  searchParams: Promise<{ missing?: string; next?: string }>;
};

export function LoginForm({ searchParams }: Props) {
  const params = use(searchParams);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
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
      <form onSubmit={onSubmit} className="space-y-4">
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
          Entrar
        </button>
      </form>
    </div>
  );
}
