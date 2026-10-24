import { redirect } from "next/navigation";

/** PDF via impressão do navegador — mesmo layout do relatório público. */
export default async function AssessmentPdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/avaliacoes/${id}/relatorio`);
}
