"use server";

import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw new Error(error.message);
}
