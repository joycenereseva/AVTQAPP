import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentForm } from "@/components/students/StudentForm";
import { signedStudentPhotoUrl } from "@/lib/photos";
import { ArchiveStudentButton } from "@/components/students/ArchiveStudentButton";
import { alunoToDbStudent } from "@/lib/db/mappers";
import type { AlunoRow } from "@/lib/db/types";
import type { DbStudent } from "@/lib/types/database";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row, error } = await supabase.from("alunos").select("*").eq("id", id).single();

  if (error || !row) notFound();

  const student = alunoToDbStudent(row as AlunoRow) as DbStudent;
  const photoSignedUrl = await signedStudentPhotoUrl((row as AlunoRow).foto_url);

  return (
    <div className="px-4 py-6">
      <Link
        href={`/admin/alunos/${id}`}
        className="mb-4 inline-block text-sm text-[var(--teal-dark)] hover:underline"
      >
        ← Voltar
      </Link>
      <h1 className="font-brand mb-6 text-2xl font-bold text-[var(--teal-dark)]">
        Editar cadastro
      </h1>
      <StudentForm student={student} photoSignedUrl={photoSignedUrl} />
      <ArchiveStudentButton studentId={id} />
    </div>
  );
}
