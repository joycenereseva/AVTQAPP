import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentForm } from "@/components/students/StudentForm";
import { signedStudentPhotoUrl } from "@/lib/photos";
import { ArchiveStudentButton } from "@/components/students/ArchiveStudentButton";
import type { DbStudent } from "@/lib/types/database";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !student) notFound();

  const photoSignedUrl = await signedStudentPhotoUrl(student.photo_path);

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
      <StudentForm student={student as DbStudent} photoSignedUrl={photoSignedUrl} />
      <ArchiveStudentButton studentId={id} />
    </div>
  );
}
