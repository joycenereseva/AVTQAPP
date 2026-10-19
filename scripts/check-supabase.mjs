/**
 * Verifica URL, chaves e acesso básico ao Supabase.
 * Uso: node scripts/check-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "fotos-alunos";

const missing = [];
if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
if (!anon) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
if (!service) missing.push("SUPABASE_SERVICE_ROLE_KEY");

if (missing.length) {
  console.error("❌ Preencha no .env.local:", missing.join(", "));
  console.error("   Supabase → Project Settings → API");
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = ["profiles", "students", "assessments", "share_links"];
let ok = true;

for (const table of tables) {
  const { error } = await admin.from(table).select("id").limit(1);
  if (error) {
    console.error(`❌ Tabela "${table}":`, error.message);
    ok = false;
  } else {
    console.log(`✓ Tabela "${table}" acessível`);
  }
}

const { data: buckets, error: bErr } = await admin.storage.listBuckets();
if (bErr) {
  console.error("❌ Storage listBuckets:", bErr.message);
  ok = false;
} else {
  const found = buckets?.some((b) => b.name === bucket);
  console.log(found ? `✓ Bucket "${bucket}" encontrado` : `❌ Bucket "${bucket}" não encontrado`);
  if (!found) ok = false;
}

const { error: rpcErr } = await admin.rpc("get_public_report", { p_token: "test-invalid-token" });
if (rpcErr && !rpcErr.message.includes("null")) {
  console.warn("⚠ RPC get_public_report:", rpcErr.message, "(confira se a função foi criada no SQL)");
} else {
  console.log("✓ RPC get_public_report registrada");
}

process.exit(ok ? 0 : 1);
