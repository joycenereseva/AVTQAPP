const AVATAR_URL =
  "https://joycenereseva.github.io/websitenat/assets/images/joyce-nav-avatar.jpg";

export function ReportBrandHeader() {
  return (
    <header className="report-brand border-b border-[#c8dde8] bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={AVATAR_URL}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full border-2 border-[#115f76]/30 object-cover"
          crossOrigin="anonymous"
        />
        <div className="min-w-0">
          <p className="font-brand text-[11px] font-semibold uppercase tracking-[0.12em] text-[#115f76]">
            Natação Particular
          </p>
          <p className="font-brand text-base font-bold leading-tight text-[#1a202c]">
            Profª Joyce Neres
          </p>
          <p className="text-xs text-[#64748b]">
            CREF/BA-022609 · Ficha de avaliação técnica qualitativa
          </p>
        </div>
      </div>
    </header>
  );
}
