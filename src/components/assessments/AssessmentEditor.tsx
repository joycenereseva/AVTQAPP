"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AssessmentForm,
  getAssessmentFormSnapshot,
  type AssessmentFormValues,
} from "@/components/assessments/AssessmentForm";
import {
  createShareLink,
  finalizeAssessment,
  saveAssessment,
} from "@/app/actions/assessments";
import type { AssessmentModel, AssessmentStatus } from "@/lib/types/database";
import { buildShareMessage, whatsAppShareUrl } from "@/lib/utils";

type Props = {
  studentId: string;
  studentName: string;
  guardianPhone: string | null;
  assessmentId?: string;
  modelo: AssessmentModel;
  status: AssessmentStatus;
  initial: AssessmentFormValues;
  reevaluationDates: string[];
  existingSharePath?: string | null;
};

export function AssessmentEditor({
  studentId,
  studentName,
  guardianPhone,
  assessmentId,
  modelo,
  status,
  initial,
  reevaluationDates,
  existingSharePath,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(existingSharePath ?? null);
  const [pending, startTransition] = useTransition();
  const savingRef = useRef(false);

  const persist = (nextStatus: AssessmentStatus) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const snapshot = getAssessmentFormSnapshot(values);
        const result = await saveAssessment({
          id: assessmentId,
          studentId,
          referenceMonth: snapshot.referenceMonth,
          assessmentDate: snapshot.assessmentDate,
          modelo,
          skills: snapshot.skills,
          probeNaoIncluso: snapshot.probeNaoIncluso,
          probeRows: snapshot.probeRows,
          gallahue: snapshot.gallahue,
          morgana: snapshot.morgana,
          desenvolturas: snapshot.desenvolturas,
          dificuldades: snapshot.dificuldades,
          meta: snapshot.meta,
          consideracoes: snapshot.consideracoes,
          status: nextStatus,
        });
        setMessage(nextStatus === "draft" ? "Rascunho salvo." : "Avaliação salva.");
        if (!assessmentId) {
          router.replace(`/admin/avaliacoes/${result.id}`);
        } else {
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar.");
      } finally {
        savingRef.current = false;
      }
    });
  };

  const onFinalize = () => {
    if (!assessmentId) {
      setError("Salve a avaliação antes de finalizar.");
      return;
    }
    startTransition(async () => {
      try {
        await saveAssessment({
          id: assessmentId,
          studentId,
          ...getAssessmentFormSnapshot(values),
          modelo,
          status: "finalized",
        });
        await finalizeAssessment(assessmentId, studentId);
        setMessage("Avaliação finalizada.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao finalizar.");
      }
    });
  };

  const onShare = () => {
    if (!assessmentId) {
      setError("Salve e finalize antes de compartilhar.");
      return;
    }
    startTransition(async () => {
      try {
        const { token } = await createShareLink(assessmentId, studentId);
        const origin = window.location.origin;
        const url = `${origin}/avaliacao/${token}`;
        setShareUrl(url);
        setMessage("Link gerado. Copie ou envie pelo WhatsApp.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao gerar link.");
      }
    });
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setMessage("Link copiado.");
  };

  const openWhatsApp = () => {
    if (!shareUrl) return;
    const msg = buildShareMessage(
      studentName,
      values.referenceMonth,
      values.assessmentDate,
      shareUrl,
    );
    window.open(whatsAppShareUrl(guardianPhone ?? "", msg), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link
        href={`/admin/alunos/${studentId}`}
        className="mb-4 inline-block text-sm text-[var(--teal-dark)] hover:underline"
      >
        ← Voltar ao histórico
      </Link>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-brand text-2xl font-bold text-[var(--teal-dark)]">
            {assessmentId ? "Editar avaliação" : "Nova avaliação"}
          </h1>
          <p className="text-sm text-[var(--gray-text)]">{studentName}</p>
          <p className="text-xs text-[var(--gray-text)]">
            Status:{" "}
            <strong>
              {status === "draft"
                ? "Rascunho"
                : status === "finalized"
                  ? "Finalizada"
                  : "Substituída"}
            </strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {assessmentId && status === "finalized" && (
            <Link
              href={`/admin/avaliacoes/${assessmentId}/relatorio`}
              className="btn btn-secondary"
            >
              Visualizar relatório
            </Link>
          )}
          {assessmentId && (
            <Link
              href={`/admin/avaliacoes/${assessmentId}/pdf`}
              className="btn btn-secondary"
              target="_blank"
            >
              Gerar PDF
            </Link>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <AssessmentForm
        modelo={modelo}
        initial={initial}
        reevaluationDates={reevaluationDates}
        readOnly={false}
        onChange={setValues}
      />

      {status === "finalized" && (
        <p className="mt-4 text-xs text-amber-800">
          Alterações em avaliação finalizada são registradas no histórico de auditoria.
        </p>
      )}

      <div className="sticky bottom-0 mt-6 flex flex-wrap gap-2 border-t border-[var(--gray-border)] bg-[var(--gray-bg)] py-4">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={pending}
          onClick={() => persist(status === "finalized" ? "finalized" : "draft")}
        >
          {status === "finalized" ? "Salvar correção" : "Salvar rascunho"}
        </button>
        {status !== "finalized" && (
          <>
            <button
              type="button"
              className="btn btn-primary"
              disabled={pending}
              onClick={() => persist("draft")}
            >
              Salvar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={pending}
              onClick={onFinalize}
            >
              Finalizar avaliação
            </button>
          </>
        )}
        {status === "finalized" && (
          <>
            <button type="button" className="btn btn-primary" disabled={pending} onClick={onShare}>
              Gerar / renovar link
            </button>
            {shareUrl && (
              <>
                <button type="button" className="btn btn-secondary" onClick={copyLink}>
                  Copiar link
                </button>
                <button type="button" className="btn btn-secondary" onClick={openWhatsApp}>
                  Compartilhar pelo WhatsApp
                </button>
              </>
            )}
          </>
        )}
      </div>
      {shareUrl && (
        <p className="mt-2 break-all text-xs text-[var(--gray-text)]">{shareUrl}</p>
      )}
    </div>
  );
}
