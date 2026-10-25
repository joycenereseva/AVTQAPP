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
    <div className="mx-auto max-w-[960px] px-4 py-8 md:px-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">
            Identificação profissional exibida no relatório e no rodapé público.
          </p>
        </div>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
