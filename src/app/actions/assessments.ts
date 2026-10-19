"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeProbeTotal, type ProbeRow, type SkillsMap } from "@/lib/assessment-form";
import { generateShareToken, hashShareToken } from "@/lib/share-token";
import type { AssessmentModel, AssessmentStatus } from "@/lib/types/database";

export type SaveAssessmentInput = {
  id?: string;
  studentId: string;
  referenceMonth: string;
  assessmentDate: string;
  modelo: AssessmentModel;
  skills: SkillsMap;
  probeNaoIncluso: boolean;
  probeRows: ProbeRow[];
  gallahue: string;
  morgana: string;
  desenvolturas: string[];
  dificuldades: string[];
  meta: string;
  consideracoes: string;
  status: AssessmentStatus;
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Não autenticado.");
  return { supabase, user };
}

export async function saveAssessment(input: SaveAssessmentInput) {
  const { supabase, user } = await requireUser();
  const probeTotal = computeProbeTotal(input.probeRows);
  const payload = {
    student_id: input.studentId,
    owner_id: user.id,
    reference_month: input.referenceMonth,
    assessment_date: input.assessmentDate,
    status: input.status,
    modelo: input.modelo,
    skills: input.skills,
    probe_nao_incluso: input.probeNaoIncluso,
    probe_rows: input.probeRows,
    probe_total: probeTotal,
    gallahue: input.gallahue || null,
    morgana: input.morgana || null,
    desenvolturas: input.desenvolturas.filter(Boolean),
    dificuldades: input.dificuldades.filter(Boolean),
    meta: input.meta || null,
    consideracoes: input.consideracoes || null,
    finalized_at: input.status === "finalized" ? new Date().toISOString() : null,
  };

  if (input.id) {
    const { data: existing } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", input.id)
      .single();

    if (existing?.status === "finalized" && input.status === "draft") {
      throw new Error("Não é possível reabrir rascunho de avaliação finalizada.");
    }

    if (existing?.status === "finalized") {
      await supabase.from("assessment_audit_logs").insert({
        assessment_id: input.id,
        changed_by: user.id,
        change_type: "update_finalized",
        snapshot_before: existing,
        snapshot_after: payload,
      });
    }

    const { data, error } = await supabase
      .from("assessments")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/alunos/${input.studentId}`);
    return { id: data.id as string };
  }

  const { data, error } = await supabase
    .from("assessments")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/alunos/${input.studentId}`);
  return { id: data.id as string };
}

export async function finalizeAssessment(assessmentId: string, studentId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("assessments")
    .update({
      status: "finalized",
      finalized_at: new Date().toISOString(),
    })
    .eq("id", assessmentId)
    .eq("owner_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/alunos/${studentId}`);
  revalidatePath(`/admin/avaliacoes/${assessmentId}`);
}

export async function createShareLink(assessmentId: string, studentId: string) {
  const { supabase, user } = await requireUser();

  const { data: assessment, error: aErr } = await supabase
    .from("assessments")
    .select("id, status")
    .eq("id", assessmentId)
    .eq("owner_id", user.id)
    .single();
  if (aErr || !assessment) throw new Error("Avaliação não encontrada.");
  if (assessment.status !== "finalized") {
    throw new Error("Finalize a avaliação antes de gerar o link.");
  }

  await supabase
    .from("share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("assessment_id", assessmentId)
    .is("revoked_at", null);

  const token = generateShareToken();
  const tokenHash = hashShareToken(token);

  const { error } = await supabase.from("share_links").insert({
    assessment_id: assessmentId,
    token_hash: tokenHash,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/avaliacoes/${assessmentId}`);
  revalidatePath(`/admin/alunos/${studentId}`);
  return { token };
}

export async function revokeShareLink(shareLinkId: string, assessmentId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", shareLinkId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/avaliacoes/${assessmentId}`);
}
