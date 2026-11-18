"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_DISPLAY_NAME } from "@/lib/branding";

export function NovaSenhaForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error: updateErr } = await supabase.auth.updateUser({ password });
        if (updateErr) throw updateErr;
        router.push("/admin");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao atualizar senha.");
      }
    });
  };

  return (
    <div className="card w-full max-w-md p-8">
      <h1 className="font-brand text-xl font-bold text-[var(--teal-dark)]">
        {APP_DISPLAY_NAME}
      </h1>
      <p className="mb-6 text-sm text-[var(--gray-text)]">
        Defina sua nova senha
      </p>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="form-label" htmlFor="password">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="confirm">
            Confirmar senha
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className="form-control"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
