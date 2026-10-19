"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentModel, StudentStatus } from "@/lib/types/database";

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
  const row = {
    owner_id: user.id,
    full_name: input.fullName.trim(),
    birth_date: input.birthDate || null,
    schedule: input.schedule?.trim() || null,
    classes_start_date: input.classesStartDate || null,
    guardian_name: input.guardianName?.trim() || null,
    guardian_phone: input.guardianPhone?.trim() || null,
    admin_notes: input.adminNotes?.trim() || null,
    status: input.status,
    modelo: input.modelo,
  };

  if (input.id) {
    const { error } = await supabase.from("students").update(row).eq("id", input.id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    revalidatePath(`/admin/alunos/${input.id}`);
    return { id: input.id };
  }

  const { data, error } = await supabase.from("students").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  return { id: data.id as string };
}

export async function deactivateStudent(studentId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("students")
    .update({ status: "inactive" })
    .eq("id", studentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/alunos/${studentId}`);
}

export async function updateStudentPhoto(studentId: string, photoPath: string | null) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("students")
    .update({ photo_path: photoPath })
    .eq("id", studentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/alunos/${studentId}`);
}
