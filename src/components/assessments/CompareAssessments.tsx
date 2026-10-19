"use client";

import {
  displaySkillValue,
  sectionsForModel,
  skillKey,
  type AssessmentModel,
  type SkillsMap,
} from "@/lib/assessment-form";

type AssessmentSummary = {
  id: string;
  label: string;
  assessment_date: string;
  skills: SkillsMap;
};

type Props = {
  modelo: AssessmentModel;
  left: AssessmentSummary;
  right: AssessmentSummary;
};

export function CompareAssessments({ modelo, left, right }: Props) {
  const sections = sectionsForModel(modelo);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-[var(--teal-dark)]">
        <div>{left.label}</div>
        <div>{right.label}</div>
      </div>
      {sections.map((sec) => (
        <section key={sec.title} className="card overflow-hidden">
          <div className="bg-[var(--teal-pale)] px-3 py-2 text-sm font-semibold text-[var(--teal-dark)]">
            {sec.title}
          </div>
          <div className="divide-y divide-slate-100">
            {sec.fields.map((f) => {
              const key = skillKey(sec.title, f);
              const lv = displaySkillValue(left.skills[key]);
              const rv = displaySkillValue(right.skills[key]);
              const changed = lv !== rv;
              return (
                <div
                  key={key}
                  className={`grid grid-cols-2 gap-2 px-3 py-2 text-sm ${changed ? "bg-amber-50" : ""}`}
                >
                  <div>
                    <span className="text-xs text-[var(--gray-text)]">{f}</span>
                    <div className="font-medium">{lv}</div>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--gray-text)]">{f}</span>
                    <div className="font-medium">{rv}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
