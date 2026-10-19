import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/SettingsForm";
import type { ProfileSettings } from "@/lib/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", user!.id)
    .single();

  const settings = (profile?.settings as ProfileSettings) ?? {
    nome: "Prof.ª Joyce Neres",
    tel: "(73) 9 9104-0064",
    cref: "02260 - G",
    email: "joyceneresemp@gmail.com",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-brand mb-2 text-2xl font-bold text-[var(--teal-dark)]">
        Configurações
      </h1>
      <p className="mb-6 text-sm text-[var(--gray-text)]">
        Identificação profissional exibida no relatório e no rodapé público.
      </p>
      <SettingsForm initial={settings} />
      <div className="mt-8 rounded-xl border border-[var(--gray-border)] bg-white p-4 text-sm text-[var(--gray-text)]">
        <p className="mb-2 font-semibold text-[var(--teal-dark)]">Privacidade (LGPD)</p>
        <p>
          Os dados tratados incluem informações de crianças e responsáveis. Obtenha consentimento
          dos responsáveis para fotografias e compartilhamento das avaliações. Links públicos usam
          tokens aleatórios revogáveis; não compartilhe tokens em canais abertos além do contato
          direto com a família.
        </p>
      </div>
    </div>
  );
}
