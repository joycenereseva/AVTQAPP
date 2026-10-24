/**
 * Credenciais públicas do projeto Supabase (equivalente ao que iria em NEXT_PUBLIC_*).
 * A chave publishable/anon é exposta no navegador por design; proteção é via RLS.
 * Preferir variáveis de ambiente na Vercel; estes valores evitam `missing=supabase` se o deploy não tiver NEXT_PUBLIC_*.
 */
export const SUPABASE_PUBLIC_PROJECT = {
  url: "https://lmqsrblvwvfpngrgehev.supabase.co",
  anonKey: "sb_publishable_CS-5zvq0E6gI3EsfjGb2CQ_6UtWCNC9",
} as const;
