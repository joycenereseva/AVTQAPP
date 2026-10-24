"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProbeRow, SkillsMap } from "@/lib/assessment-form";
import { generateShareToken, hashShareToken } from "@/lib/share-token";
import type { AssessmentModel, AssessmentStatus } from "@/lib/types/database";
import { formToAvaliacaoPayload, mergeDadosQualitativos } from "@/lib/db/mappers";
import type { AvaliacaoRow, DadosQualitativos } from "@/lib/db/types";

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
  const { supabase } = await requireUser();
  const payload = formToAvaliacaoPayload(input);

  if (input.id) {
    const { data: existing } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("id", input.id)
      .single();

    if (existing) {
      const prev = mergeDadosQualitativos(existing as AvaliacaoRow);
      if (prev.status === "finalizada" && input.status === "draft") {
        throw new Error("Não é possível reabrir rascunho de avaliação finalizada.");
      }
      const dq: DadosQualitativos = {
        ...(payload.dados_qualitativos as DadosQualitativos),
        share_token_hash: prev.share_token_hash,
        share_revoked_at: prev.share_revoked_at,
      };
      payload.dados_qualitativos = dq;
    }

    const { data, error } = await supabase
      .from("avaliacoes")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidatePath(`/admin/alunos/${input.studentId}`);
    revalidatePath(`/admin/avaliacoes/${input.id}`);
    return { id: data.id as string };
  }

  const { data, error } = await supabase
    .from("avaliacoes")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/alunos/${input.studentId}`);
  return { id: data.id as string };
}

export async function finalizeAssessment(assessmentId: string, studentId: string) {
  const { supabase } = await requireUser();
  const { data: existing } = await supabase
    .from("avaliacoes")
    .select("dados_qualitativos")
    .eq("id", assessmentId)
    .single();
  const dq = mergeDadosQualitativos((existing ?? {}) as AvaliacaoRow);
  const nextDq: DadosQualitativos = { ...dq, status: "finalizada" };

  const { error } = await supabase
    .from("avaliacoes")
    .update({ dados_qualitativos: nextDq, status: "finalizada" })
    .eq("id", assessmentId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/alunos/${studentId}`);
  revalidatePath(`/admin/avaliacoes/${assessmentId}`);
}

export async function createShareLink(assessmentId: string, studentId: string) {
  const { supabase } = await requireUser();

  const { data: assessment, error: aErr } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("id", assessmentId)
    .single();
  if (aErr || !assessment) throw new Error("Avaliação não encontrada.");

  const dq = mergeDadosQualitativos(assessment as AvaliacaoRow);
  if (dq.status !== "finalizada") {
    throw new Error("Finalize a avaliação antes de gerar o link.");
  }

  const token = generateShareToken();
  const tokenHash = hashShareToken(token);
  const nextDq: DadosQualitativos = {
    ...dq,
    share_token_hash: tokenHash,
    share_revoked_at: null,
  };

  const { error: upErr } = await supabase
    .from("avaliacoes")
    .update({ dados_qualitativos: nextDq })
    .eq("id", assessmentId);
  if (upErr) throw new Error(upErr.message);

  try {
    const admin = createAdminClient();
    await admin.from("share_links").upsert(
      {
        avaliacao_id: assessmentId,
        token_hash: tokenHash,
        revoked_at: null,
      },
      { onConflict: "token_hash" },
    );
  } catch {
    const { error: linkErr } = await supabase.from("share_links").insert({
      avaliacao_id: assessmentId,
      token_hash: tokenHash,
      revoked_at: null,
    });
    if (linkErr && !linkErr.message.includes("Could not find")) {
      /* token já está em dados_qualitativos */
    }
  }

  revalidatePath(`/admin/avaliacoes/${assessmentId}`);
  revalidatePath(`/admin/alunos/${studentId}`);
  return { token };
}

export async function revokeShareLink(shareLinkId: string, assessmentId: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", shareLinkId);

  const { data: assessment } = await supabase
    .from("avaliacoes")
    .select("dados_qualitativos")
    .eq("id", assessmentId)
    .single();
  if (assessment) {
    const dq = mergeDadosQualitativos(assessment as AvaliacaoRow);
    await supabase
      .from("avaliacoes")
      .update({
        dados_qualitativos: { ...dq, share_revoked_at: new Date().toISOString() },
      })
      .eq("id", assessmentId);
  }
  revalidatePath(`/admin/avaliacoes/${assessmentId}`);
}
