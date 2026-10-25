import { BrandMark } from "@/components/brand/BrandMark";

export function ReportBrandHeader() {
  return (
    <header className="report-brand border-b border-[var(--report-border)] bg-white px-4 py-3">
      <BrandMark variant="report" />
    </header>
  );
}
