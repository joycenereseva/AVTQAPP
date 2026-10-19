import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssessmentEditor } from "@/components/assessments/AssessmentEditor";
import type { AssessmentFormValues } from "@/components/assessments/AssessmentForm";
import { currentReferenceMonthBrazil, todayBrazilISODate } from "@/lib/assessment-form";

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

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();
  if (!student) notFound();

  const { data: pastEvals } = await supabase
    .from("assessments")
    .select("assessment_date")
    .eq("student_id", studentId)
    .eq("status", "finalized")
    .order("assessment_date", { ascending: true });

  const reevaluationDates = (pastEvals ?? []).map((e) => e.assessment_date);

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
    const { data: ref } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", fromAssessmentId)
      .single();
    if (ref) {
      initial = {
        referenceMonth: ref.reference_month,
        assessmentDate: todayBrazilISODate(),
        skills: (ref.skills as AssessmentFormValues["skills"]) ?? {},
        probeNaoIncluso: ref.probe_nao_incluso,
        probeRows: (ref.probe_rows as AssessmentFormValues["probeRows"]) ?? initial.probeRows,
        gallahue: ref.gallahue ?? "",
        morgana: ref.morgana ?? "",
        desenvolturas: (ref.desenvolturas as string[])?.length
          ? (ref.desenvolturas as string[])
          : [""],
        dificuldades: (ref.dificuldades as string[])?.length
          ? (ref.dificuldades as string[])
          : [""],
        meta: ref.meta ?? "",
        consideracoes: "",
      };
    }
  }

  return (
    <AssessmentEditor
      studentId={studentId}
      studentName={student.full_name}
      guardianPhone={student.guardian_phone}
      modelo={student.modelo}
      status="draft"
      initial={initial}
      reevaluationDates={reevaluationDates}
    />
  );
}
