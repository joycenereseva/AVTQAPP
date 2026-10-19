import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssessmentEditor } from "@/components/assessments/AssessmentEditor";
import {
  alunoToDbStudent,
  avaliacaoToFormValues,
  mapAssessmentStatus,
  mergeDadosQualitativos,
} from "@/lib/db/mappers";
import type { AlunoRow, AvaliacaoRow } from "@/lib/db/types";

export default async function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assessment, error } = await supabase
    .from("avaliacoes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !assessment) notFound();

  const av = assessment as AvaliacaoRow;
  const { data: alunoRow } = await supabase.from("alunos").select("*").eq("id", av.aluno_id).single();
  if (!alunoRow) notFound();
  const student = alunoToDbStudent(alunoRow as AlunoRow);
  const dq = mergeDadosQualitativos(av);
  const modelo = dq.modelo ?? student.modelo;

  const { data: pastEvals } = await supabase
    .from("avaliacoes")
    .select("data_avaliacao, dados_qualitativos")
    .eq("aluno_id", av.aluno_id)
    .order("data_avaliacao", { ascending: true });

  const reevaluationDates = (pastEvals ?? [])
    .filter((e) => mergeDadosQualitativos(e as AvaliacaoRow).status === "finalizada")
    .map((e) => (e as { data_avaliacao: string }).data_avaliacao);

  return (
    <AssessmentEditor
      studentId={av.aluno_id}
      studentName={student.full_name}
      guardianPhone={student.guardian_phone}
      assessmentId={id}
      modelo={modelo}
      status={mapAssessmentStatus(dq)}
      initial={avaliacaoToFormValues(av)}
      reevaluationDates={reevaluationDates}
    />
  );
}
