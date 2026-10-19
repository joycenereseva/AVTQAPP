import { SettingsForm } from "@/components/settings/SettingsForm";
import type { ProfileSettings } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

const defaults: ProfileSettings = {
  nome: "Prof.ª Joyce Neres",
  tel: "(73) 9 9104-0064",
  cref: "02260 - G",
  email: "joyceneresemp@gmail.com",
};

export default async function SettingsPage() {
  let settings = defaults;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.settings) settings = { ...defaults, ...(profile.settings as ProfileSettings) };
    }
  } catch {
    /* tabela profiles opcional */
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-brand mb-2 text-2xl font-bold text-[var(--teal-dark)]">
        Configurações
      </h1>
      <p className="mb-6 text-sm text-[var(--gray-text)]">
        Identificação profissional exibida no relatório e no rodapé público.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
