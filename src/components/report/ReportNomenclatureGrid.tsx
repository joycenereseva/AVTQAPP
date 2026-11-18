import type { AssessmentModel } from "@/lib/assessment-form";
import { NOM_AVD, NOM_COND } from "@/lib/assessment-form";

type Props = {
  model: AssessmentModel;
  compact?: boolean;
};

function splitColumns(pairs: [string, string][]) {
  const half = Math.ceil(pairs.length / 2);
  return [pairs.slice(0, half), pairs.slice(half)] as const;
}

export function ReportNomenclatureGrid({ model, compact }: Props) {
  const pairs: [string, string][] =
    model === "infantil" ? [...NOM_COND] : [...NOM_AVD, ...NOM_COND];

  const [col1, col2] = splitColumns(pairs);

  return (
    <div
      className={
        compact
          ? "text-[10px] leading-snug"
          : "rounded-[10px] bg-white p-3.5 text-[11px] leading-snug shadow-sm"
      }
    >
      <div className="mb-2 border-b border-[#c8dde8] pb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--teal-dark)]">
        Nomenclatura
      </div>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div>
          {col1.map(([k, desc]) => (
            <div key={k} className="mb-0.5">
              <strong className="text-[var(--teal-dark)]">{k}</strong> {desc}
            </div>
          ))}
        </div>
        <div>
          {col2.map(([k, desc]) => (
            <div key={k} className="mb-0.5">
              <strong className="text-[var(--teal-dark)]">{k}</strong> {desc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
