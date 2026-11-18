import type { PublicReportPayload } from "@/lib/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAnonServerClient } from "@/lib/supabase/anon-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { hashShareToken } from "@/lib/share-token";
import { mergeDadosQualitativos, probeTotalFromRow } from "@/lib/db/mappers";
import type { AlunoRow, AvaliacaoRow } from "@/lib/db/types";

const DEFAULT_CONFIG = {
  nome: "Prof.ª Joyce Neres",
  tel: "(73) 9 9104-0064",
  cref: "02260 - G",
  email: "joyceneresemp@gmail.com",
};

function normalizeShareToken(raw: string): string {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function isFinalized(row: AvaliacaoRow): boolean {
  const dq = mergeDadosQualitativos(row);
  return dq.status === "finalizada" || row.status === "finalizada";
}

function rowToPayload(
  avaliacao: AvaliacaoRow,
  aluno: AlunoRow,
  avDates: string[],
): PublicReportPayload {
  const dq = mergeDadosQualitativos(avaliacao);
  const student = aluno;
  const probeTotal = probeTotalFromRow(avaliacao) ?? "";

  return {
    config: DEFAULT_CONFIG,
    student: {
      nome: student.nome.replace(/^\[INATIVO\] /, ""),
      birth_date: student.data_nascimento,
      schedule: [student.turma_dias, student.turma_horario?.split("__modelo:")[0]]
        .filter(Boolean)
        .join(" · "),
      modelo: dq.modelo ?? "avancado",
      photo_url: student.foto_url,
    },
    eval: {
      id: avaliacao.id,
      mes: avaliacao.mes_referencia,
      data: avaliacao.data_avaliacao,
      skills: dq.skills ?? {},
      probeNaoIncluso: dq.probe_nao_incluso ?? false,
      probeRows: dq.probe_rows ?? [],
      probeTotal,
      gallahue: avaliacao.classificacao_teorica ?? "",
      morgana: avaliacao.estagio_aprendizagem ?? "",
      desenvolturas: avaliacao.desenvolturas ?? [],
      dificuldades: avaliacao.dificuldades ?? [],
      meta: avaliacao.meta_proxima ?? "",
      consideracoes: avaliacao.consideracoes_gerais ?? "",
    },
    avDates: avDates.slice(0, 4),
  };
}

async function fetchViaRpc(token: string): Promise<PublicReportPayload | null> {
  try {
    const anon = createAnonServerClient();
    const { data, error } = await anon.rpc("get_public_avaliacao_report", {
      p_token: token,
    });
    if (error || data == null) return null;
    return data as PublicReportPayload;
  } catch {
    return null;
  }
}

async function fetchViaAdmin(token: string): Promise<PublicReportPayload | null> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null;
  }

  const hash = hashShareToken(token);

  const { data: link, error: linkErr } = await admin
    .from("share_links")
    .select("avaliacao_id, revoked_at, expires_at")
    .eq("token_hash", hash)
    .maybeSingle();

  if (linkErr && linkErr.message?.includes("Invalid API key")) {
    return null;
  }

  let avaliacaoId: string | null = null;
  if (link) {
    if (link.revoked_at) return null;
    if (link.expires_at && new Date(link.expires_at) <= new Date()) return null;
    avaliacaoId = link.avaliacao_id;
  }

  let avaliacao: AvaliacaoRow | null = null;
  if (avaliacaoId) {
    const { data } = await admin.from("avaliacoes").select("*").eq("id", avaliacaoId).maybeSingle();
    avaliacao = data as AvaliacaoRow | null;
  } else {
    const { data: rows, error } = await admin
      .from("avaliacoes")
      .select("*")
      .filter("dados_qualitativos->>share_token_hash", "eq", hash)
      .limit(5);
    if (error) return null;
    const match = (rows as AvaliacaoRow[] | null)?.find((row) => {
      const dq = mergeDadosQualitativos(row);
      return dq.share_token_hash === hash && !dq.share_revoked_at;
    });
    avaliacao = match ?? null;
  }

  if (!avaliacao || !isFinalized(avaliacao)) return null;

  const { data: aluno } = await admin
    .from("alunos")
    .select("*")
    .eq("id", avaliacao.aluno_id)
    .maybeSingle();
  if (!aluno) return null;

  const { data: history } = await admin
    .from("avaliacoes")
    .select("data_avaliacao, dados_qualitativos, status")
    .eq("aluno_id", avaliacao.aluno_id)
    .order("data_avaliacao", { ascending: true });

  const avDates = (history ?? [])
    .filter((h) => isFinalized(h as AvaliacaoRow))
    .map((h) => (h as { data_avaliacao: string }).data_avaliacao);
  while (avDates.length < 4) avDates.push("—");

  return rowToPayload(avaliacao, aluno as AlunoRow, avDates);
}

export async function fetchPublicReportByToken(
  rawToken: string,
): Promise<PublicReportPayload | null> {
  if (!isSupabaseConfigured()) return null;
  const token = normalizeShareToken(rawToken);
  if (token.length < 16) return null;

  const viaRpc = await fetchViaRpc(token);
  if (viaRpc) return viaRpc;

  return fetchViaAdmin(token);
}

/** Diagnóstico seguro para /api/health (não expõe dados). */
export async function probePublicReportBackend(): Promise<{
  rpcAvailable: boolean;
  adminShareLinksReadable: boolean;
  adminError: string | null;
}> {
  let adminShareLinksReadable = false;
  let adminError: string | null = null;
  let rpcAvailable = false;

  try {
    const anon = createAnonServerClient();
    const { error } = await anon.rpc("get_public_avaliacao_report", {
      p_token: "0000000000000000",
    });
    rpcAvailable = !error?.message?.includes("Could not find the function");
  } catch {
    rpcAvailable = false;
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("share_links").select("id").limit(1);
    adminShareLinksReadable = !error;
    adminError = error?.message ?? null;
  } catch (e) {
    adminError = e instanceof Error ? e.message : "admin_client_unavailable";
  }

  return { rpcAvailable, adminShareLinksReadable, adminError };
}
