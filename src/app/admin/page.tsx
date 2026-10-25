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
    <div className="mx-auto max-w-[960px] px-4 py-8 md:px-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">Cadastros e avaliações periódicas</p>
        </div>
        <Link href="/admin/alunos/novo" className="btn btn-primary">
          + Novo aluno
        </Link>
      </div>

      <AdminStudentSearch initialQuery={q ?? ""} />

      {cards.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🏊</div>
          <h3 className="font-medium text-[var(--text)]">
            {q ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
          </h3>
          <p className="mt-2 text-sm">{q ? "Tente outro termo na busca." : "Comece com + Novo aluno."}</p>
        </div>
      ) : (
        <div className="students-grid">
          {cards.map(({ s, last, photoUrl }) => (
            <article key={s.id} className="student-card">
              <div className="flex gap-3">
                <StudentAvatar name={s.full_name} photoUrl={photoUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <h2 className="card-name truncate pr-14">{s.full_name}</h2>
                  <p className="card-meta">
                    {calcAgeFromBirthDate(s.birth_date) !== "—"
                      ? `${calcAgeFromBirthDate(s.birth_date)} anos`
                      : "Idade não informada"}
                    {s.schedule ? ` · ${s.schedule}` : ""}
                  </p>
                  <p className="card-last mt-2">
                    {last
                      ? `Última avaliação: ${last.data_avaliacao} · Nota ${probeTotalFromRow(last) ?? "—"}`
                      : "Nenhuma avaliação"}
                  </p>
                </div>
              </div>
              <div className="card-buttons">
                <Link href={`/admin/alunos/${s.id}`} className="card-btn">
                  Histórico
                </Link>
                <Link
                  href={`/admin/alunos/${s.id}/avaliacao/nova`}
                  className="card-btn card-btn-primary"
                >
                  Nova avaliação
                </Link>
                <Link href={`/admin/alunos/${s.id}/editar`} className="card-btn col-span-2">
                  Editar cadastro
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
