import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { calcAgeFromBirthDate } from "@/lib/utils";
import { signedStudentPhotoUrl } from "@/lib/photos";
import { AdminStudentSearch } from "@/components/students/AdminStudentSearch";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select("*, assessments(id, assessment_date, status, probe_total, finalized_at)")
    .eq("status", "active")
    .order("full_name");

  if (q?.trim()) {
    query = query.ilike("full_name", `%${q.trim()}%`);
  }

  const { data: students, error } = await query;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-red-600">Erro ao carregar alunos: {error.message}</p>
      </div>
    );
  }

  const cards = await Promise.all(
    (students ?? []).map(async (s) => {
      const evals = (s.assessments ?? []).filter(
        (e: { status: string }) => e.status === "finalized" || e.status === "draft",
      );
      evals.sort(
        (a: { assessment_date: string }, b: { assessment_date: string }) =>
          a.assessment_date.localeCompare(b.assessment_date),
      );
      const last = evals[evals.length - 1];
      const photo = await signedStudentPhotoUrl(s.photo_path);
      return { ...s, last, photoUrl: photo };
    }),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-brand text-2xl font-bold text-[var(--teal-dark)]">Alunos</h1>
          <p className="text-sm text-[var(--gray-text)]">Cadastros e avaliações periódicas</p>
        </div>
        <Link href="/admin/alunos/novo" className="btn btn-primary">
          + Novo aluno
        </Link>
      </div>

      <AdminStudentSearch initialQuery={q ?? ""} />

      {cards.length === 0 ? (
        <div className="card py-12 text-center text-[var(--gray-text)]">
          <div className="mb-2 text-3xl">🏊</div>
          <p>{q ? "Nenhum aluno encontrado." : "Nenhum aluno cadastrado."}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((s) => (
            <article key={s.id} className="card flex flex-col p-4">
              <div className="flex gap-3">
                <StudentAvatar name={s.full_name} photoUrl={s.photoUrl} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-[var(--teal-dark)]">{s.full_name}</h2>
                  <p className="text-xs text-[var(--gray-text)]">
                    {calcAgeFromBirthDate(s.birth_date) !== "—"
                      ? `${calcAgeFromBirthDate(s.birth_date)} anos`
                      : "Idade não informada"}
                    {s.schedule ? ` · ${s.schedule}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[var(--gray-text)]">
                    {s.last
                      ? `Última avaliação: ${s.last.assessment_date} · Nota ${s.last.probe_total ?? "—"}`
                      : "Nenhuma avaliação"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/admin/alunos/${s.id}`} className="btn btn-secondary btn-sm">
                  Histórico
                </Link>
                <Link
                  href={`/admin/alunos/${s.id}/avaliacao/nova`}
                  className="btn btn-primary btn-sm"
                >
                  Nova avaliação
                </Link>
                <Link href={`/admin/alunos/${s.id}/editar`} className="btn btn-ghost btn-sm">
                  Editar
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
