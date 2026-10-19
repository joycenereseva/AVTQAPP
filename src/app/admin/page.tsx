import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { calcAgeFromBirthDate } from "@/lib/utils";
import { signedStudentPhotoUrl } from "@/lib/photos";
import { AdminStudentSearch } from "@/components/students/AdminStudentSearch";
import { alunoToDbStudent, mapStudentStatusFromNome, probeTotalFromRow } from "@/lib/db/mappers";
import type { AlunoRow, AvaliacaoRow } from "@/lib/db/types";
import { mergeDadosQualitativos } from "@/lib/db/mappers";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("alunos").select("*, avaliacoes(*)").order("nome");

  if (q?.trim()) {
    query = query.ilike("nome", `%${q.trim()}%`);
  }

  const { data: rows, error } = await query;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-red-600">Erro ao carregar alunos: {error.message}</p>
      </div>
    );
  }

  const students = (rows ?? []).filter((r) => {
    const row = r as AlunoRow;
    return mapStudentStatusFromNome(row.nome) === "active";
  });

  const cards = await Promise.all(
    students.map(async (raw) => {
      const row = raw as AlunoRow & { avaliacoes?: AvaliacaoRow[] };
      const s = alunoToDbStudent(row);
      const evals = (row.avaliacoes ?? []).filter(
        (e) => mergeDadosQualitativos(e).status !== "substituida",
      );
      evals.sort((a, b) => a.data_avaliacao.localeCompare(b.data_avaliacao));
      const last = evals[evals.length - 1];
      const photo = await signedStudentPhotoUrl(row.foto_url);
      return { s, last, photoUrl: photo };
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
          {cards.map(({ s, last, photoUrl }) => (
            <article key={s.id} className="card flex flex-col p-4">
              <div className="flex gap-3">
                <StudentAvatar name={s.full_name} photoUrl={photoUrl} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-[var(--teal-dark)]">{s.full_name}</h2>
                  <p className="text-xs text-[var(--gray-text)]">
                    {calcAgeFromBirthDate(s.birth_date) !== "—"
                      ? `${calcAgeFromBirthDate(s.birth_date)} anos`
                      : "Idade não informada"}
                    {s.schedule ? ` · ${s.schedule}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[var(--gray-text)]">
                    {last
                      ? `Última avaliação: ${last.data_avaliacao} · Nota ${probeTotalFromRow(last) ?? "—"}`
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
