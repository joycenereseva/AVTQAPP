import { differenceInYears } from "date-fns";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function calcAgeFromBirthDate(birthDate: string | null | undefined): string {
  if (!birthDate) return "—";
  try {
    const years = differenceInYears(new Date(), new Date(birthDate));
    if (years < 0 || years > 120) return "—";
    return String(years);
  } catch {
    return "—";
  }
}

export function studentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function whatsAppShareUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const text = encodeURIComponent(message);
  if (digits.length >= 10) {
    return `https://wa.me/${digits}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

export function buildShareMessage(
  studentName: string,
  referenceMonth: string,
  assessmentDate: string,
  link: string,
): string {
  return `Olá! A avaliação técnica de natação de ${studentName}, referente a ${referenceMonth}/${assessmentDate.slice(0, 4)}, está disponível neste link: ${link}\n\nAbra no celular e role a página para ver a ficha completa.`;
}
