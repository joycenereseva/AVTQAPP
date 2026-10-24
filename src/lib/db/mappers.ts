import type { AssessmentFormValues } from "@/components/assessments/AssessmentForm";
import type { AssessmentModel } from "@/lib/assessment-form";
import { computeProbeTotal } from "@/lib/assessment-form";
import type { StudentInput } from "@/app/actions/students";
import type { AlunoRow, AvaliacaoRow, DadosQualitativos } from "@/lib/db/types";
import type { AssessmentStatus, DbStudent, StudentStatus } from "@/lib/types/database";

const INACTIVE_PREFIX = "[INATIVO] ";
const MODELO_TAG = "__modelo:";

export function mapStudentStatusFromNome(nome: string): StudentStatus {
  return nome.startsWith(INACTIVE_PREFIX) ? "inactive" : "active";
}

export function displayNome(nome: string): string {
  return nome.startsWith(INACTIVE_PREFIX) ? nome.slice(INACTIVE_PREFIX.length) : nome;
}

export function nomeWithStatus(fullName: string, status: StudentStatus): string {
  const base = fullName.trim();
  if (status === "inactive") return INACTIVE_PREFIX + base;
  return base;
}

export function parseModeloFromAluno(row: AlunoRow): AssessmentModel {
  const tag = row.turma_horario?.includes(MODELO_TAG)
    ? row.turma_horario.split(MODELO_TAG)[1]?.split("|")[0]
    : null;
  if (tag === "infantil" || tag === "avancado") return tag;
  return "avancado";
}

export function embedModeloInHorario(horario: string | null, modelo: AssessmentModel): string | null {
  const base = (horario ?? "").split(MODELO_TAG)[0].replace(/\|$/, "").trim();
  const merged = `${base}${base ? " | " : ""}${MODELO_TAG}${modelo}`;
  return merged || `${MODELO_TAG}${modelo}`;
}

export function mapAssessmentStatus(dq: DadosQualitativos | null | undefined): AssessmentStatus {
  const s = dq?.status;
  if (s === "finalizada") return "finalized";
  if (s === "substituida") return "superseded";
  return "draft";
}

export function toAssessmentStatusDb(status: AssessmentStatus): DadosQualitativos["status"] {
  if (status === "finalized") return "finalizada";
  if (status === "superseded") return "substituida";
  return "rascunho";
}

export function scheduleFromAluno(row: AlunoRow): string | null {
  const horario = row.turma_horario?.split(MODELO_TAG)[0].replace(/\|$/, "").trim();
  const parts = [row.turma_dias?.trim(), horario].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function scheduleToAlunoFields(schedule: string | null): {
  turma_dias: string | null;
  turma_horario: string | null;
} {
  if (!schedule?.trim()) return { turma_dias: null, turma_horario: null };
  const parts = schedule.split("·").map((p) => p.trim());
  if (parts.length >= 2) {
    return { turma_dias: parts[0], turma_horario: parts.slice(1).join(" · ") };
  }
  return { turma_dias: schedule.trim(), turma_horario: null };
}

export function alunoToDbStudent(row: AlunoRow, ownerId?: string): DbStudent {
  return {
    id: row.id,
    owner_id: row.owner_id ?? ownerId ?? "",
    full_name: displayNome(row.nome),
    birth_date: row.data_nascimento,
    photo_path: row.foto_url,
    schedule: scheduleFromAluno(row),
    classes_start_date: row.inicio_aulas ?? null,
    guardian_name: row.responsavel_nome ?? null,
    guardian_phone: row.whatsapp_pais,
    admin_notes: row.observacoes_admin ?? null,
    status: row.status === "inativo" ? "inactive" : mapStudentStatusFromNome(row.nome),
    modelo: (row.modelo ?? parseModeloFromAluno(row)) as AssessmentModel,
    created_at: row.created_at ?? "",
    updated_at: row.created_at ?? "",
  };
}

export function studentInputToAlunoRow(input: StudentInput, ownerId: string): Partial<AlunoRow> {
  const sched = scheduleToAlunoFields(input.schedule);
  return {
    nome: nomeWithStatus(input.fullName, input.status),
    data_nascimento: input.birthDate,
    whatsapp_pais: input.guardianPhone,
    responsavel_nome: input.guardianName,
    observacoes_admin: input.adminNotes,
    inicio_aulas: input.classesStartDate,
    modelo: input.modelo,
    status: input.status === "inactive" ? "inativo" : "ativo",
    owner_id: ownerId,
    turma_dias: sched.turma_dias,
    turma_horario: embedModeloInHorario(sched.turma_horario, input.modelo),
  };
}

export function mergeDadosQualitativos(
  row: AvaliacaoRow,
): Required<Pick<DadosQualitativos, "skills" | "modelo">> & DadosQualitativos {
  const dq = (row.dados_qualitativos ?? {}) as DadosQualitativos;
  const dp = row.dados_prova ?? {};
  return {
    skills: dq.skills ?? {},
    modelo: dq.modelo ?? "avancado",
    status: dq.status,
    probe_nao_incluso: dp.probe_nao_incluso ?? dq.probe_nao_incluso,
    probe_rows: dp.probe_rows ?? dq.probe_rows,
    probe_total: dp.probe_total ?? dq.probe_total,
    share_token_hash: dq.share_token_hash,
    share_revoked_at: dq.share_revoked_at,
  };
}

export function avaliacaoToFormValues(row: AvaliacaoRow): AssessmentFormValues {
  const dq = mergeDadosQualitativos(row);
  return {
    referenceMonth: row.mes_referencia,
    assessmentDate: row.data_avaliacao,
    skills: dq.skills ?? {},
    probeNaoIncluso: dq.probe_nao_incluso ?? false,
    probeRows: dq.probe_rows?.length
      ? dq.probe_rows
      : [
          { habilidade: "", pontuacao: "" },
          { habilidade: "", pontuacao: "" },
        ],
    gallahue: row.classificacao_teorica ?? "",
    morgana: row.estagio_aprendizagem ?? "",
    desenvolturas: row.desenvolturas?.length ? row.desenvolturas : [""],
    dificuldades: row.dificuldades?.length ? row.dificuldades : [""],
    meta: row.meta_proxima ?? "",
    consideracoes: row.consideracoes_gerais ?? "",
  };
}

export function probeTotalFromRow(row: AvaliacaoRow): string | null {
  const dq = mergeDadosQualitativos(row);
  if (dq.probe_total) return dq.probe_total;
  if (dq.probe_rows?.length) return computeProbeTotal(dq.probe_rows);
  return null;
}

export function formToAvaliacaoPayload(
  input: {
    studentId: string;
    modelo: AssessmentModel;
    status: AssessmentStatus;
  } & AssessmentFormValues,
): Partial<AvaliacaoRow> {
  const probeTotal = computeProbeTotal(input.probeRows);
  const dq: DadosQualitativos = {
    skills: input.skills,
    modelo: input.modelo,
    status: toAssessmentStatusDb(input.status),
    probe_nao_incluso: input.probeNaoIncluso,
    probe_rows: input.probeRows,
    probe_total: probeTotal,
  };
  const statusDb = toAssessmentStatusDb(input.status);
  return {
    aluno_id: input.studentId,
    mes_referencia: input.referenceMonth,
    data_avaliacao: input.assessmentDate,
    status: statusDb,
    dados_qualitativos: dq,
    classificacao_teorica: input.gallahue || null,
    estagio_aprendizagem: input.morgana || null,
    meta_proxima: input.meta || null,
    consideracoes_gerais: input.consideracoes || null,
    desenvolturas: input.desenvolturas.filter(Boolean),
    dificuldades: input.dificuldades.filter(Boolean),
  };
}
