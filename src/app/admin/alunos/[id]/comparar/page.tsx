import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompareAssessments } from "@/components/assessments/CompareAssessments";
import { alunoToDbStudent, mergeDadosQualitativos } from "@/lib/db/mappers";
import type { AlunoRow, AvaliacaoRow } from "@/lib/db/types";
import type { SkillsMap } from "@/lib/assessment-form";

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { id: studentId } = await params;
  const { a, b } = await searchParams;
  const supabase = await createClient();

  const { data: alunoRow } = await supabase.from("alunos").select("*").eq("id", studentId).single();
  if (!alunoRow) notFound();
  const student = alunoToDbStudent(alunoRow as AlunoRow);

  const { data: evals } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("aluno_id", studentId)
    .order("data_avaliacao", { ascending: true });

  const list = ((evals ?? []) as AvaliacaoRow[]).filter(
    (e) => mergeDadosQualitativos(e).status === "finalizada",
  );
  const leftId = a ?? list[0]?.id;
  const rightId = b ?? list[list.length - 1]?.id;
  const left = list.find((e) => e.id === leftId);
  const right = list.find((e) => e.id === rightId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link
        href={`/admin/alunos/${studentId}`}
        className="mb-4 inline-block text-sm text-[var(--teal-dark)] hover:underline"
      >
        ← Voltar ao histórico
      </Link>
      <h1 className="font-brand mb-2 text-2xl font-bold text-[var(--teal-dark)]">
        Comparar avaliações
      </h1>
      <p className="mb-4 text-sm text-[var(--gray-text)]">{student.full_name}</p>

      <form className="mb-6 grid gap-3 sm:grid-cols-2" method="get">
        <div>
          <label className="form-label">Avaliação A</label>
          <select name="a" className="form-control" defaultValue={leftId}>
            {list.map((e) => (
              <option key={e.id} value={e.id}>
                {e.mes_referencia} · {e.data_avaliacao}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Avaliação B</label>
          <select name="b" className="form-control" defaultValue={rightId}>
            {list.map((e) => (
              <option key={e.id} value={e.id}>
                {e.mes_referencia} · {e.data_avaliacao}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary sm:col-span-2">
          Atualizar comparação
        </button>
      </form>

      {left && right ? (
        <CompareAssessments
          modelo={student.modelo}
          left={{
            id: left.id,
            label: `${left.mes_referencia} · ${left.data_avaliacao}`,
            assessment_date: left.data_avaliacao,
            skills: (mergeDadosQualitativos(left).skills ?? {}) as SkillsMap,
          }}
          right={{
            id: right.id,
            label: `${right.mes_referencia} · ${right.data_avaliacao}`,
            assessment_date: right.data_avaliacao,
            skills: (mergeDadosQualitativos(right).skills ?? {}) as SkillsMap,
          }}
        />
      ) : (
        <p className="text-[var(--gray-text)]">Selecione duas avaliações finalizadas.</p>
      )}
    </div>
  );
}
