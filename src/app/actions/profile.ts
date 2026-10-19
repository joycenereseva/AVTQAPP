"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProfileSettings } from "@/lib/types/database";

export async function saveProfileSettings(settings: ProfileSettings) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase
    .from("profiles")
    .update({ settings })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/configuracoes");
}
