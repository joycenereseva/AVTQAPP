"use client";

import { useEffect } from "react";

export function PrintToolbar() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1") {
      window.print();
    }
  }, []);

  return (
    <div className="flex gap-2 print:hidden">
      <button
        type="button"
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[var(--teal-dark)]"
        onClick={() => window.print()}
      >
        Imprimir / Salvar PDF
      </button>
    </div>
  );
}
