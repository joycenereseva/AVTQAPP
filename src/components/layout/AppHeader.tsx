import Link from "next/link";
import { APP_DISPLAY_NAME, APP_TAGLINE } from "@/lib/branding";

type Props = {
  active?: "students" | "settings";
};

export function AppHeader({ active = "students" }: Props) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-[var(--teal-dark)] px-4 shadow-md md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--teal-light)] text-lg">
          🏊
        </div>
        <div>
          <div className="font-brand text-base font-bold tracking-wide text-white">
            {APP_DISPLAY_NAME}
          </div>
          <div className="text-[11px] text-[var(--teal-light)]">
            {APP_TAGLINE}
          </div>
        </div>
      </div>
      <nav className="flex gap-1">
        <Link
          href="/admin"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            active === "students"
              ? "bg-white/15 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          Alunos
        </Link>
        <Link
          href="/admin/configuracoes"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
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
