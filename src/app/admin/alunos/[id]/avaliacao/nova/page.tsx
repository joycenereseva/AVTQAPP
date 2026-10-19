import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssessmentEditor } from "@/components/assessments/AssessmentEditor";
import type { AssessmentFormValues } from "@/components/assessments/AssessmentForm";
import { currentReferenceMonthBrazil, todayBrazilISODate } from "@/lib/assessment-form";
import { alunoToDbStudent, avaliacaoToFormValues, mergeDadosQualitativos } from "@/lib/db/mappers";
import type { AlunoRow, AvaliacaoRow } from "@/lib/db/types";
import type { AssessmentStatus } from "@/lib/types/database";

export default async function NewAssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id: studentId } = await params;
  const { from: fromAssessmentId } = await searchParams;
  const supabase = await createClient();

  const { data: row } = await supabase.from("alunos").select("*").eq("id", studentId).single();
  if (!row) notFound();
  const student = alunoToDbStudent(row as AlunoRow);

  const { data: pastEvals } = await supabase
    .from("avaliacoes")
    .select("data_avaliacao, dados_qualitativos")
    .eq("aluno_id", studentId)
    .order("data_avaliacao", { ascending: true });

  const reevaluationDates = (pastEvals ?? [])
    .filter((e) => mergeDadosQualitativos(e as AvaliacaoRow).status === "finalizada")
    .map((e) => (e as { data_avaliacao: string }).data_avaliacao);

  let initial: AssessmentFormValues = {
    referenceMonth: currentReferenceMonthBrazil(),
    assessmentDate: todayBrazilISODate(),
    skills: {},
    probeNaoIncluso: false,
    probeRows: [
      { habilidade: "", pontuacao: "" },
      { habilidade: "", pontuacao: "" },
    ],
    gallahue: "",
    morgana: "",
    desenvolturas: [""],
    dificuldades: [""],
    meta: "",
    consideracoes: "",
  };

  if (fromAssessmentId) {
    const { data: ref } = await supabase.from("avaliacoes").select("*").eq("id", fromAssessmentId).single();
    if (ref) {
      initial = avaliacaoToFormValues(ref as AvaliacaoRow);
      initial.assessmentDate = todayBrazilISODate();
      initial.consideracoes = "";
    }
  }

  const status: AssessmentStatus = "draft";

  return (
    <AssessmentEditor
      studentId={studentId}
      studentName={student.full_name}
      guardianPhone={student.guardian_phone}
      modelo={student.modelo}
      status={status}
      initial={initial}
      reevaluationDates={reevaluationDates}
    />
  );
}
