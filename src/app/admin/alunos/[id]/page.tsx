import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcAgeFromBirthDate } from "@/lib/utils";

export default async function StudentHistoryPage({
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

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, assessment_date, reference_month, status, probe_total, finalized_at")
    .eq("student_id", id)
    .order("assessment_date", { ascending: false });

  const finalized = (assessments ?? []).filter((a) => a.status === "finalized");

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/admin" className="mb-4 inline-block text-sm text-[var(--teal-dark)] hover:underline">
        ← Voltar
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-brand text-2xl font-bold text-[var(--teal-dark)]">{student.full_name}</h1>
          <p className="text-sm text-[var(--gray-text)]">
            {calcAgeFromBirthDate(student.birth_date) !== "—"
              ? `${calcAgeFromBirthDate(student.birth_date)} anos`
              : "—"}
            {student.schedule ? ` · ${student.schedule}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/alunos/${id}/avaliacao/nova`} className="btn btn-primary">
            + Nova avaliação
          </Link>
          {finalized[0] && (
            <Link
              href={`/admin/alunos/${id}/avaliacao/nova?from=${finalized[finalized.length - 1].id}`}
              className="btn btn-secondary"
            >
              Nova (copiar última)
            </Link>
          )}
          {finalized.length >= 2 && (
            <Link href={`/admin/alunos/${id}/comparar`} className="btn btn-secondary">
              Comparar
            </Link>
          )}
          <Link href={`/admin/alunos/${id}/editar`} className="btn btn-ghost">
            Editar cadastro
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {(assessments ?? []).length === 0 ? (
          <div className="card py-10 text-center text-[var(--gray-text)]">
            Nenhuma avaliação registrada.
          </div>
        ) : (
          assessments!.map((e) => (
            <Link
              key={e.id}
              href={`/admin/avaliacoes/${e.id}`}
              className="card flex items-center justify-between p-4 transition hover:border-[var(--teal-light)]"
            >
              <div>
                <div className="font-semibold text-[var(--teal-dark)]">
                  {e.reference_month} · {e.assessment_date}
                </div>
                <div className="text-xs text-[var(--gray-text)]">
                  {e.status === "draft"
                    ? "Rascunho"
                    : e.status === "finalized"
                      ? "Finalizada"
                      : "Substituída"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--teal-dark)]">
                  {e.probe_total ?? "—"}
                </div>
                <div className="text-[10px] uppercase text-[var(--gray-text)]">Prova</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
