import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { alunoToDbStudent, mergeDadosQualitativos, probeTotalFromRow } from "@/lib/db/mappers";
import type { AlunoRow, AvaliacaoRow } from "@/lib/db/types";
import { calcAgeFromBirthDate } from "@/lib/utils";

export default async function StudentHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row, error } = await supabase.from("alunos").select("*").eq("id", id).single();

  if (error || !row) notFound();
  const student = alunoToDbStudent(row as AlunoRow);

  const { data: assessments } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("aluno_id", id)
    .order("data_avaliacao", { ascending: false });

  const list = (assessments ?? []) as AvaliacaoRow[];
  const finalized = list.filter((e) => mergeDadosQualitativos(e).status === "finalizada");

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
          {finalized.length >= 2 && (
            <Link href={`/admin/alunos/${id}/comparar`} className="btn btn-secondary">
              Comparar
            </Link>
          )}
          {finalized[0] && (
            <Link
              href={`/admin/alunos/${id}/avaliacao/nova?from=${finalized[0].id}`}
              className="btn btn-secondary"
            >
              Nova (copiar última)
            </Link>
          )}
          <Link href={`/admin/alunos/${id}/editar`} className="btn btn-ghost">
            Editar cadastro
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="card py-10 text-center text-[var(--gray-text)]">
            Nenhuma avaliação registrada.
          </div>
        ) : (
          list.map((e) => {
            const st = mergeDadosQualitativos(e).status;
            return (
              <Link
                key={e.id}
                href={`/admin/avaliacoes/${e.id}`}
                className="card flex items-center justify-between p-4 transition hover:border-[var(--teal-light)]"
              >
                <div>
                  <div className="font-semibold text-[var(--teal-dark)]">
                    {e.mes_referencia} · {e.data_avaliacao}
                  </div>
                  <div className="text-xs text-[var(--gray-text)]">
                    {st === "finalizada"
                      ? "Finalizada"
                      : st === "substituida"
                        ? "Substituída"
                        : "Rascunho"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[var(--teal-dark)]">
                    {probeTotalFromRow(e) ?? "—"}
                  </div>
                  <div className="text-[10px] uppercase text-[var(--gray-text)]">Prova</div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
