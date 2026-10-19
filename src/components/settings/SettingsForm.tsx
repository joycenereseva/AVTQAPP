"use client";

import { useState, useTransition } from "react";
import { saveProfileSettings } from "@/app/actions/profile";
import type { ProfileSettings } from "@/lib/types/database";

export function SettingsForm({ initial }: { initial: ProfileSettings }) {
  const [settings, setSettings] = useState<ProfileSettings>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await saveProfileSettings(settings);
          setMessage("Configurações salvas.");
        });
      }}
    >
      {message && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{message}</div>
      )}
      {(
        [
          ["nome", "Nome profissional"],
          ["tel", "Telefone"],
          ["cref", "CREF"],
          ["email", "E-mail"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <label className="form-label">{label}</label>
          <input
            className="form-control"
            value={settings[key] ?? ""}
            onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
          />
        </div>
      ))}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Salvar configurações
      </button>
    </form>
  );
}
