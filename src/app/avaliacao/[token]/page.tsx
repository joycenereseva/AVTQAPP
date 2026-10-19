import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicReportView } from "@/components/report/PublicReportView";
import { fetchPublicReportByToken } from "@/lib/public-report";
import { signedStudentPhotoUrl } from "@/lib/photos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Avaliação Técnica",
  robots: { index: false, follow: false },
};

export default async function PublicAssessmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await fetchPublicReportByToken(token);
  if (!data) notFound();

  const photoUrl = await signedStudentPhotoUrl(data.student.photo_url);

  return (
    <div className="min-h-screen bg-[#e7eff2]">
      <PublicReportView data={data} photoUrl={photoUrl} />
    </div>
  );
}
