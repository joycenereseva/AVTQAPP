/**
 * Verifica URL, chaves e acesso às tabelas do projeto.
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
  process.exit(1);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let ok = true;

for (const table of ["alunos", "avaliacoes"]) {
  const { error } = await admin.from(table).select("id").limit(1);
  if (error) {
    console.error(`❌ Tabela "${table}":`, error.message);
    ok = false;
  } else {
    console.log(`✓ Tabela "${table}" acessível`);
  }
}

const { error: slErr } = await admin.from("share_links").select("id").limit(1);
if (slErr) {
  console.log(`⚠ Tabela "share_links" opcional:`, slErr.message);
} else {
  console.log(`✓ Tabela "share_links" acessível`);
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

const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 5 });
console.log(`✓ Auth: ${users?.users?.length ?? 0} utilizador(es) registado(s)`);

process.exit(ok ? 0 : 1);
