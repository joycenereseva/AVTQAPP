export function supabaseProjectRef(supabaseUrl: string): string | null {
  try {
    const ref = new URL(supabaseUrl).hostname.split(".")[0];
    return ref || null;
  } catch {
    return null;
  }
}

/** Indica presença de cookies de sessão Supabase (sem validar JWT na rede). */
export function hasSupabaseAuthCookies(
  cookies: { name: string; value: string }[],
  supabaseUrl: string,
): boolean {
  const ref = supabaseProjectRef(supabaseUrl);
  if (!ref) return false;
  const base = `sb-${ref}-auth-token`;
  return cookies.some(
    (c) =>
      c.value.length > 0 && (c.name === base || c.name.startsWith(`${base}.`)),
  );
}