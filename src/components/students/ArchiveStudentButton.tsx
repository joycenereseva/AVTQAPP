"use client";

import { useTransition } from "react";
import { deactivateStudent } from "@/app/actions/students";
import { useRouter } from "next/navigation";

export function ArchiveStudentButton({ studentId }: { studentId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <button
        type="button"
        className="btn btn-danger"
        disabled={pending}
        onClick={() => {
          if (
            !confirm(
              "Arquivar este aluno? O cadastro ficará inativo, mas o histórico de avaliações será mantido.",
            )
          ) {
            return;
          }
          startTransition(async () => {
            await deactivateStudent(studentId);
            router.push("/admin");
            router.refresh();
          });
        }}
      >
        Arquivar aluno (inativo)
      </button>
      <p className="mt-2 text-xs text-[var(--gray-text)]">
        O histórico de avaliações é preservado. Prefira arquivar em vez de excluir.
      </p>
    </div>
  );
}
