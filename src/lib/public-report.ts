import type { PublicReportPayload } from "@/lib/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function fetchPublicReportByToken(
  token: string,
): Promise<PublicReportPayload | null> {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const hash = hashShareToken(token);

  // Preferência: tabela share_links (se migration aplicada)
  const { data: link } = await admin
    .from("share_links")
    .select("avaliacao_id, revoked_at, expires_at")
    .eq("token_hash", hash)
    .maybeSingle();

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
    const { data: rows } = await admin
      .from("avaliacoes")
      .select("*")
      .contains("dados_qualitativos", { share_token_hash: hash })
      .limit(5);
    const match = (rows as AvaliacaoRow[] | null)?.find((row) => {
      const dq = mergeDadosQualitativos(row);
      return dq.share_token_hash === hash && !dq.share_revoked_at;
    });
    avaliacao = match ?? null;
  }

  if (!avaliacao) return null;
  const dq = mergeDadosQualitativos(avaliacao);
  if (dq.status !== "finalizada") return null;

  const { data: aluno } = await admin
    .from("alunos")
    .select("*")
    .eq("id", avaliacao.aluno_id)
    .maybeSingle();
  if (!aluno) return null;

  const { data: history } = await admin
    .from("avaliacoes")
    .select("data_avaliacao, dados_qualitativos")
    .eq("aluno_id", avaliacao.aluno_id)
    .order("data_avaliacao", { ascending: true });

  const avDates = (history ?? [])
    .filter((h) => mergeDadosQualitativos(h as AvaliacaoRow).status === "finalizada")
    .map((h) => (h as { data_avaliacao: string }).data_avaliacao);
  while (avDates.length < 4) avDates.push("—");

  const student = aluno as AlunoRow;
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
