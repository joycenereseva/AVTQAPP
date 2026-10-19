"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentModel, StudentStatus } from "@/lib/types/database";
import { studentInputToAlunoRow } from "@/lib/db/mappers";

export type StudentInput = {
  id?: string;
  fullName: string;
  birthDate: string | null;
  schedule: string | null;
  classesStartDate: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  adminNotes: string | null;
  status: StudentStatus;
  modelo: AssessmentModel;
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

export async function saveStudent(input: StudentInput) {
  const { supabase, user } = await requireUser();
  const row = studentInputToAlunoRow(input, user.id);

  if (input.id) {
    const { error } = await supabase.from("alunos").update(row).eq("id", input.id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    revalidatePath(`/admin/alunos/${input.id}`);
    return { id: input.id };
  }

  const { data, error } = await supabase.from("alunos").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  return { id: data.id as string };
}

export async function deactivateStudent(studentId: string) {
  const { supabase } = await requireUser();
  const { data: current } = await supabase.from("alunos").select("nome").eq("id", studentId).single();
  if (!current) throw new Error("Aluno não encontrado.");
  const nome = current.nome.startsWith("[INATIVO] ") ? current.nome : `[INATIVO] ${current.nome}`;
  const { error } = await supabase.from("alunos").update({ nome }).eq("id", studentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/alunos/${studentId}`);
}

export async function updateStudentPhoto(studentId: string, photoPath: string | null) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("alunos").update({ foto_url: photoPath }).eq("id", studentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/alunos/${studentId}`);
}
