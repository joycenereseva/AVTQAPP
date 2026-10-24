import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatBrDate(iso: string | null | undefined): string {
  if (!iso || iso === "—") return "—";
  try {
    return format(parseISO(iso.length > 10 ? iso.slice(0, 10) : iso), "dd/MM/yyyy", {
      locale: ptBR,
    });
  } catch {
    return iso;
  }
}
