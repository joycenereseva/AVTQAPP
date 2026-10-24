"use client";

import { useEffect } from "react";
import { SaveReportPdfButton } from "@/components/report/SaveReportPdfButton";

type Props = {
  pdfFileName: string;
};

export function PrintToolbar({ pdfFileName }: Props) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1") {
      window.print();
    }
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <SaveReportPdfButton fileName={pdfFileName} />
      <button
        type="button"
        className="rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
        onClick={() => window.print()}
      >
        Imprimir
      </button>
      <p className="w-full text-[11px] leading-snug text-white/80 sm:w-auto sm:max-w-xs">
        Use <strong>Salvar PDF</strong> para arquivo com cores da marca, sem data/URL do
        navegador. Na impressão, desmarque &quot;Cabeçalhos e rodapés&quot;.
      </p>
    </div>
  );
}
