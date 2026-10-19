"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveStudent, updateStudentPhoto } from "@/app/actions/students";
import { createClient } from "@/lib/supabase/client";
import type { AssessmentModel, DbStudent, StudentStatus } from "@/lib/types/database";
import { StudentAvatar } from "@/components/students/StudentAvatar";

type Props = {
  student?: DbStudent;
  photoSignedUrl?: string | null;
};

export function StudentForm({ student, photoSignedUrl }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(student?.full_name ?? "");
  const [birthDate, setBirthDate] = useState(student?.birth_date ?? "");
  const [schedule, setSchedule] = useState(student?.schedule ?? "");
  const [classesStart, setClassesStart] = useState(student?.classes_start_date ?? "");
  const [guardianName, setGuardianName] = useState(student?.guardian_name ?? "");
  const [guardianPhone, setGuardianPhone] = useState(student?.guardian_phone ?? "");
  const [adminNotes, setAdminNotes] = useState(student?.admin_notes ?? "");
  const [status, setStatus] = useState<StudentStatus>(student?.status ?? "active");
  const [modelo, setModelo] = useState<AssessmentModel>(student?.modelo ?? "avancado");
  const [previewUrl, setPreviewUrl] = useState<string | null>(photoSignedUrl ?? null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Informe o nome completo.");
      return;
    }
    startTransition(async () => {
      try {
        const { id } = await saveStudent({
          id: student?.id,
          fullName,
          birthDate: birthDate || null,
          schedule: schedule || null,
          classesStartDate: classesStart || null,
          guardianName: guardianName || null,
          guardianPhone: guardianPhone || null,
          adminNotes: adminNotes || null,
          status,
          modelo,
        });
        router.push(`/admin/alunos/${id}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  };

  const onPhoto = async (file: File | null) => {
    if (!student?.id || !file) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${student.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("student-photos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setError(upErr.message);
      return;
    }
    await updateStudentPhoto(student.id, path);
    const { data } = await supabase.storage.from("student-photos").createSignedUrl(path, 3600);
    setPreviewUrl(data?.signedUrl ?? null);
    router.refresh();
  };

  const removePhoto = async () => {
    if (!student?.id) return;
    await updateStudentPhoto(student.id, null);
    setPreviewUrl(null);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-2xl p-6">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="mb-4 flex items-center gap-4">
        <StudentAvatar name={fullName || "Aluno"} photoUrl={previewUrl} size="lg" />
        {student?.id && (
          <div className="flex flex-col gap-2 text-sm">
            <label className="btn btn-secondary cursor-pointer">
              Enviar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
              />
            </label>
            {previewUrl && (
              <button type="button" className="btn btn-ghost text-red-600" onClick={removePhoto}>
                Remover foto
              </button>
            )}
          </div>
        )}
      </div>

      <div className="form-group mb-3">
        <label className="form-label">Nome completo</label>
        <input
          className="form-control"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="form-label">Data de nascimento</label>
          <input
            type="date"
            className="form-control"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Dias e horários das aulas</label>
          <input
            className="form-control"
            placeholder="Seg/Qua 16:00"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="form-label">Início das aulas</label>
          <input
            type="date"
            className="form-control"
            value={classesStart}
            onChange={(e) => setClassesStart(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Modelo de ficha</label>
          <select
            className="form-control"
            value={modelo}
            onChange={(e) => setModelo(e.target.value as AssessmentModel)}
          >
            <option value="infantil">Infantil (até 4 anos)</option>
            <option value="avancado">Avançado (5 anos+)</option>
          </select>
        </div>
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="form-label">Nome do responsável</label>
          <input
            className="form-control"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Telefone do responsável</label>
          <input
            className="form-control"
            placeholder="+55 73 99999-0000"
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Observações administrativas</label>
        <textarea
          className="form-control min-h-[80px]"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="form-label">Situação</label>
        <select
          className="form-control"
          value={status}
          onChange={(e) => setStatus(e.target.value as StudentStatus)}
        >
          <option value="active">Ativo</option>
          <option value="inactive">Inativo (arquivado)</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          Salvar aluno
        </button>
      </div>
    </form>
  );
}
