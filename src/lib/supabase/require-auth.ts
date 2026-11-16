import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAuthUser(nextPath = "/admin") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const qs = new URLSearchParams({ next: nextPath });
    redirect(`/login?${qs.toString()}`);
  }

  return user;
}