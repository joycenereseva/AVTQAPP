import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssessmentEditor } from "@/components/assessments/AssessmentEditor";
import type { AssessmentFormValues } from "@/components/assessments/AssessmentForm";
import type { AssessmentStatus } from "@/lib/types/database";

export default async function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("*, students(full_name, guardian_phone, modelo)")
    .eq("id", id)
    .single();

  if (error || !assessment) notFound();

  const student = assessment.students as {
    full_name: string;
    guardian_phone: string | null;
    modelo: "infantil" | "avancado";
  };

  const { data: pastEvals } = await supabase
    .from("assessments")
    .select("assessment_date")
    .eq("student_id", assessment.student_id)
    .eq("status", "finalized")
    .order("assessment_date", { ascending: true });

  const reevaluationDates = (pastEvals ?? []).map((e) => e.assessment_date);

  const initial: AssessmentFormValues = {
    referenceMonth: assessment.reference_month,
    assessmentDate: assessment.assessment_date,
    skills: (assessment.skills as AssessmentFormValues["skills"]) ?? {},
    probeNaoIncluso: assessment.probe_nao_incluso,
    probeRows: (assessment.probe_rows as AssessmentFormValues["probeRows"]) ?? [],
    gallahue: assessment.gallahue ?? "",
    morgana: assessment.morgana ?? "",
    desenvolturas: (assessment.desenvolturas as string[]) ?? [""],
    dificuldades: (assessment.dificuldades as string[]) ?? [""],
    meta: assessment.meta ?? "",
    consideracoes: assessment.consideracoes ?? "",
  };

  return (
    <AssessmentEditor
      studentId={assessment.student_id}
      studentName={student.full_name}
      guardianPhone={student.guardian_phone}
      assessmentId={id}
      modelo={assessment.modelo ?? student.modelo}
      status={assessment.status as AssessmentStatus}
      initial={initial}
      reevaluationDates={reevaluationDates}
    />
  );
}
