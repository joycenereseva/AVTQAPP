"use client";

import { useState } from "react";
import { saveReportElementAsPdf } from "@/lib/report-pdf";

type Props = {
  fileName: string;
  className?: string;
};

export function SaveReportPdfButton({ fileName, className }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    const el = document.querySelector(".report-document");
    if (!el || !(el instanceof HTMLElement)) {
      setError("Relatório não encontrado na página.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await saveReportElementAsPdf(el, fileName);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gerar o PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#115f76] shadow-sm disabled:opacity-60"
        disabled={busy}
        onClick={onSave}
      >
        {busy ? "Gerando PDF…" : "Salvar PDF"}
      </button>
      {error && <p className="mt-1 text-xs text-red-200">{error}</p>}
    </div>
  );
}
