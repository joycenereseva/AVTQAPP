import type { AssessmentModel, ProbeRow, SkillsMap } from "@/lib/assessment-form";

export type { AssessmentModel, ProbeRow, SkillsMap };

export type StudentStatus = "active" | "inactive";

export type AssessmentStatus = "draft" | "finalized" | "superseded";

export type ProfileSettings = {
  nome?: string;
  tel?: string;
  cref?: string;
  email?: string;
  logo_url?: string | null;
};

export type DbProfile = {
  id: string;
  display_name: string | null;
  settings: ProfileSettings;
  created_at: string;
  updated_at: string;
};

export type DbStudent = {
  id: string;
  owner_id: string;
  full_name: string;
  birth_date: string | null;
  photo_path: string | null;
  schedule: string | null;
  classes_start_date: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  admin_notes: string | null;
  status: StudentStatus;
  modelo: AssessmentModel;
  created_at: string;
  updated_at: string;
};

export type DbAssessment = {
  id: string;
  student_id: string;
  owner_id: string;
  reference_month: string;
  assessment_date: string;
  status: AssessmentStatus;
  modelo: AssessmentModel;
  skills: SkillsMap;
  probe_nao_incluso: boolean;
  probe_rows: ProbeRow[];
  probe_total: string | null;
  gallahue: string | null;
  morgana: string | null;
  desenvolturas: string[];
  dificuldades: string[];
  meta: string | null;
  consideracoes: string | null;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbShareLink = {
  id: string;
  assessment_id: string;
  token_hash: string;
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
};

export type DbAssessmentAudit = {
  id: string;
  assessment_id: string;
  changed_by: string;
  change_type: string;
  snapshot_before: Record<string, unknown> | null;
  snapshot_after: Record<string, unknown> | null;
  created_at: string;
};

export type PublicReportPayload = {
  config: ProfileSettings & { nome: string };
  student: {
    nome: string;
    birth_date: string | null;
    schedule: string | null;
    modelo: AssessmentModel;
    photo_url: string | null;
  };
  eval: {
    id: string;
    mes: string;
    data: string;
    skills: SkillsMap;
    probeNaoIncluso: boolean;
    probeRows: ProbeRow[];
    probeTotal: string;
    gallahue: string;
    morgana: string;
    desenvolturas: string[];
    dificuldades: string[];
    meta: string;
    consideracoes: string;
  };
  avDates: string[];
};
