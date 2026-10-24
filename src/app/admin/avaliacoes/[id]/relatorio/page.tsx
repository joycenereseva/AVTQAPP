import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicReportView } from "@/components/report/PublicReportView";
import { PrintToolbar } from "@/components/report/PrintToolbar";
import type { PublicReportPayload } from "@/lib/types/database";
import { signedStudentPhotoUrl } from "@/lib/photos";
import {
  alunoToDbStudent,
  mergeDadosQualitativos,
  probeTotalFromRow,
} from "@/lib/db/mappers";
import type { AlunoRow, AvaliacaoRow } from "@/lib/db/types";

export default async function AdminReportPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: assessment } = await supabase.from("avaliacoes").select("*").eq("id", id).single();
  if (!assessment) notFound();

  const av = assessment as AvaliacaoRow;
  const { data: alunoRow } = await supabase.from("alunos").select("*").eq("id", av.aluno_id).single();
  if (!alunoRow) notFound();
  const student = alunoToDbStudent(alunoRow as AlunoRow);
  const dq = mergeDadosQualitativos(av);

  const { data: datesRows } = await supabase
    .from("avaliacoes")
    .select("data_avaliacao, dados_qualitativos")
    .eq("aluno_id", av.aluno_id)
    .order("data_avaliacao", { ascending: true });

  const avDates = (datesRows ?? [])
    .filter((d) => mergeDadosQualitativos(d as AvaliacaoRow).status === "finalizada")
    .map((d) => (d as { data_avaliacao: string }).data_avaliacao);
  while (avDates.length < 4) avDates.push("—");

  const payload: PublicReportPayload = {
    config: {
      nome: "Prof.ª Joyce Neres",
      tel: "(73) 9 9104-0064",
      cref: "02260 - G",
      email: "joyceneresemp@gmail.com",
    },
    student: {
      nome: student.full_name,
      birth_date: student.birth_date,
      schedule: student.schedule,
      modelo: dq.modelo ?? student.modelo,
      photo_url: student.photo_path,
    },
    eval: {
      id: av.id,
      mes: av.mes_referencia,
      data: av.data_avaliacao,
      skills: dq.skills ?? {},
      probeNaoIncluso: dq.probe_nao_incluso ?? false,
      probeRows: dq.probe_rows ?? [],
      probeTotal: probeTotalFromRow(av) ?? "",
      gallahue: av.classificacao_teorica ?? "",
      morgana: av.estagio_aprendizagem ?? "",
      desenvolturas: av.desenvolturas ?? [],
      dificuldades: av.dificuldades ?? [],
      meta: av.meta_proxima ?? "",
      consideracoes: av.consideracoes_gerais ?? "",
    },
    avDates: avDates.slice(0, 4),
  };

  const photoUrl = await signedStudentPhotoUrl(student.photo_path);

  const safeName = student.full_name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  const pdfFileName = `Avaliacao_${safeName}_${av.data_avaliacao.slice(0, 10)}.pdf`;

  return (
    <div>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-[#115f76] px-4 py-2 text-sm text-white print:hidden">
        <Link href={`/admin/avaliacoes/${id}`} className="underline opacity-90">
          ← Voltar à edição
        </Link>
        <span className="flex-1 opacity-75">Pré-visualização (igual à página dos pais)</span>
        <PrintToolbar pdfFileName={pdfFileName} />
      </div>
      <div className="bg-[#e7eff2]">
        <PublicReportView data={payload} photoUrl={photoUrl} />
      </div>
    </div>
  );
}
