import type { AssessmentModel, ProbeRow, SkillsMap } from "@/lib/assessment-form";

export type AlunoRow = {
  id: string;
  nome: string;
  data_nascimento: string | null;
  foto_url: string | null;
  whatsapp_pais: string | null;
  turma_dias: string | null;
  turma_horario: string | null;
  modelo?: AssessmentModel | null;
  status?: "ativo" | "inativo" | null;
  responsavel_nome?: string | null;
  observacoes_admin?: string | null;
  inicio_aulas?: string | null;
  owner_id?: string | null;
  created_at?: string;
};

export type DadosQualitativos = {
  skills?: SkillsMap;
  modelo?: AssessmentModel;
  status?: "rascunho" | "finalizada" | "substituida";
  probe_nao_incluso?: boolean;
  probe_rows?: ProbeRow[];
  probe_total?: string | null;
  share_token_hash?: string;
  share_revoked_at?: string | null;
};

export type DadosProva = {
  probe_nao_incluso?: boolean;
  probe_rows?: ProbeRow[];
  probe_total?: string | null;
};

export type AvaliacaoRow = {
  id: string;
  aluno_id: string;
  data_avaliacao: string;
  mes_referencia: string;
  dados_qualitativos: DadosQualitativos | null;
  dados_prova?: DadosProva | null;
  desenvolturas: string[] | null;
  dificuldades: string[] | null;
  classificacao_teorica: string | null;
  estagio_aprendizagem: string | null;
  meta_proxima: string | null;
  consideracoes_gerais: string | null;
  status?: "rascunho" | "finalizada" | "substituida" | null;
  finalized_at?: string | null;
  created_at?: string;
};

export type ShareLinkRow = {
  id: string;
  avaliacao_id: string;
  token_hash: string;
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
};
