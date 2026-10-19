"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminStudentSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      className="relative mb-6"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        router.push(`/admin?${params.toString()}`);
      }}
    >
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-text)]">
        🔍
      </span>
      <input
        className="form-control pl-10"
        placeholder="Buscar por nome..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  );
}
