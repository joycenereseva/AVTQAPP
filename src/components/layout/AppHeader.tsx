"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";

export function AppHeader() {
  const pathname = usePathname();
  const active = pathname.startsWith("/admin/configuracoes") ? "settings" : "students";

  return (
    <header className="app-header sticky top-0 z-50 flex h-16 items-center justify-between bg-[var(--teal-dark)] px-4 md:px-8">
      <BrandMark variant="header" />
      <nav className="flex gap-1">
        <Link
          href="/admin"
          className={`rounded-[var(--radius-sm)] px-4 py-2 text-[13px] font-medium transition-colors ${
            active === "students"
              ? "bg-white/15 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          Alunos
        </Link>
        <Link
          href="/admin/configuracoes"
          className={`rounded-[var(--radius-sm)] px-4 py-2 text-[13px] font-medium transition-colors ${
            active === "settings"
              ? "bg-white/15 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          Configurações
        </Link>
      </nav>
    </header>
  );
}
