import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublicReportView } from "@/components/report/PublicReportView";
import { PrintToolbar } from "@/components/report/PrintToolbar";
import type { PublicReportPayload } from "@/lib/types/database";
import { signedStudentPhotoUrl } from "@/lib/photos";
import type { SkillsMap } from "@/lib/assessment-form";

export default async function AdminReportPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*, students(*)")
    .eq("id", id)
    .single();
  if (!assessment) notFound();

  const student = assessment.students as {
    full_name: string;
    birth_date: string | null;
    schedule: string | null;
    modelo: "infantil" | "avancado";
    photo_path: string | null;
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", assessment.owner_id)
    .single();

  const settings = (profile?.settings as Record<string, string>) ?? {};

  const admin = createAdminClient();
  const { data: datesRows } = await admin
    .from("assessments")
    .select("assessment_date")
    .eq("student_id", assessment.student_id)
    .eq("status", "finalized")
    .order("assessment_date", { ascending: true });

  const avDates = (datesRows ?? []).map((d) => d.assessment_date);
  while (avDates.length < 4) avDates.push("—");

  const payload: PublicReportPayload = {
    config: {
      nome: settings.nome ?? "Prof.ª Joyce Neres",
      tel: settings.tel ?? "",
      cref: settings.cref ?? "",
      email: settings.email ?? "",
    },
    student: {
      nome: student.full_name,
      birth_date: student.birth_date,
      schedule: student.schedule,
      modelo: student.modelo,
      photo_url: student.photo_path,
    },
    eval: {
      id: assessment.id,
      mes: assessment.reference_month,
      data: assessment.assessment_date,
      skills: (assessment.skills as SkillsMap) ?? {},
      probeNaoIncluso: assessment.probe_nao_incluso,
      probeRows: assessment.probe_rows as PublicReportPayload["eval"]["probeRows"],
      probeTotal: assessment.probe_total ?? "",
      gallahue: assessment.gallahue ?? "",
      morgana: assessment.morgana ?? "",
      desenvolturas: (assessment.desenvolturas as string[]) ?? [],
      dificuldades: (assessment.dificuldades as string[]) ?? [],
      meta: assessment.meta ?? "",
      consideracoes: assessment.consideracoes ?? "",
    },
    avDates: avDates.slice(0, 4),
  };

  const photoUrl = await signedStudentPhotoUrl(student.photo_path);

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-[var(--teal-dark)] px-4 py-2 text-sm text-white">
        <Link href={`/admin/avaliacoes/${id}`} className="underline opacity-90">
          ← Voltar à edição
        </Link>
        <span className="flex-1 opacity-75">Pré-visualização do relatório</span>
        <PrintToolbar />
      </div>
      <div className="bg-[#e7eff2]">
        <PublicReportView data={payload} photoUrl={photoUrl} />
      </div>
    </div>
  );
}
