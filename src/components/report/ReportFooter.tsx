import { APP_DISPLAY_NAME } from "@/lib/branding";

type Props = {
  nome: string;
  cref: string;
  tel: string;
  email: string;
};

/** Rodapé alinhado ao PDF/HTML de referência (websitenat). */
export function ReportFooter({ nome, cref, tel, email }: Props) {
  return (
    <footer className="report-footer mx-3 mt-5 overflow-hidden rounded-[10px] bg-[#115f76] text-white">
      <div className="flex flex-col gap-2 px-3.5 py-3 text-center text-[11px] leading-relaxed sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="font-bold text-white/95">
          {nome}
          <span className="mt-0.5 block font-normal text-white/85 sm:mt-0 sm:inline sm:before:content-['·'] sm:before:mx-1.5">
            CREF {cref}
          </span>
        </div>
        <div className="text-[10px] text-white/70 sm:text-center sm:px-2">
          {APP_DISPLAY_NAME} · Natação Particular
        </div>
        <div className="text-white/90 sm:text-right">
          {tel}
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">{email}</span>
        </div>
      </div>
    </footer>
  );
}
