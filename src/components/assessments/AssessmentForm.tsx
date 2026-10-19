"use client";

import { useCallback, useMemo, useState } from "react";
import {
  computeProbeTotal,
  currentReferenceMonthBrazil,
  optionsForField,
  sectionsForModel,
  skillKey,
  todayBrazilISODate,
  type AssessmentModel,
  type ProbeRow,
  type SkillsMap,
} from "@/lib/assessment-form";
import { REFERENCE_MONTHS } from "@/lib/assessment-form";

export type AssessmentFormValues = {
  referenceMonth: string;
  assessmentDate: string;
  skills: SkillsMap;
  probeNaoIncluso: boolean;
  probeRows: ProbeRow[];
  gallahue: string;
  morgana: string;
  desenvolturas: string[];
  dificuldades: string[];
  meta: string;
  consideracoes: string;
};

type Props = {
  modelo: AssessmentModel;
  initial?: Partial<AssessmentFormValues>;
  reevaluationDates: string[];
  readOnly?: boolean;
  onChange?: (values: AssessmentFormValues) => void;
};

function defaultValues(initial?: Partial<AssessmentFormValues>): AssessmentFormValues {
  return {
    referenceMonth: initial?.referenceMonth ?? currentReferenceMonthBrazil(),
    assessmentDate: initial?.assessmentDate ?? todayBrazilISODate(),
    skills: initial?.skills ?? {},
    probeNaoIncluso: initial?.probeNaoIncluso ?? false,
    probeRows: initial?.probeRows?.length
      ? initial.probeRows
      : [
          { habilidade: "", pontuacao: "" },
          { habilidade: "", pontuacao: "" },
        ],
    gallahue: initial?.gallahue ?? "",
    morgana: initial?.morgana ?? "",
    desenvolturas: initial?.desenvolturas?.length ? initial.desenvolturas : [""],
    dificuldades: initial?.dificuldades?.length ? initial.dificuldades : [""],
    meta: initial?.meta ?? "",
    consideracoes: initial?.consideracoes ?? "",
  };
}

export function AssessmentForm({
  modelo,
  initial,
  reevaluationDates,
  readOnly = false,
  onChange,
}: Props) {
  const [values, setValues] = useState<AssessmentFormValues>(() => defaultValues(initial));

  const sections = useMemo(() => sectionsForModel(modelo), [modelo]);

  const emit = useCallback(
    (next: AssessmentFormValues) => {
      setValues(next);
      onChange?.(next);
    },
    [onChange],
  );

  const update = (patch: Partial<AssessmentFormValues>) => {
    emit({ ...values, ...patch });
  };

  const setSkill = (key: string, val: string) => {
    update({ skills: { ...values.skills, [key]: val } });
  };

  const toggleSectionNtnav = (sectionTitle: string, fields: readonly string[], checked: boolean) => {
    const skills = { ...values.skills };
    fields.forEach((f) => {
      skills[skillKey(sectionTitle, f)] = checked ? "NTNAV" : "";
    });
    update({ skills });
  };

  const probeTotal = computeProbeTotal(values.probeRows);

  const hdrDates = useMemo(() => {
    const d = [...reevaluationDates];
    while (d.length < 4) d.push("—");
    return d.slice(0, 4);
  }, [reevaluationDates]);

  return (
    <div className="space-y-4">
      <section className="card overflow-hidden">
        <div className="bg-[var(--teal-pale)] px-4 py-2.5 text-sm font-semibold text-[var(--teal-dark)]">
          Identificação
        </div>
        <div className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="eval-mes">
                Mês de referência
              </label>
              <select
                id="eval-mes"
                className="form-control"
                disabled={readOnly}
                value={values.referenceMonth}
                onChange={(e) => update({ referenceMonth: e.target.value })}
              >
                {REFERENCE_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="eval-data">
                Data da avaliação
              </label>
              <input
                id="eval-data"
                type="date"
                className="form-control"
                disabled={readOnly}
                value={values.assessmentDate}
                onChange={(e) => update({ assessmentDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["AVALIADO", "REAVALIADO", "REAVALIADO", "REAVALIADO"].map((label, i) => (
              <div
                key={i}
                className={`rounded-md px-2 py-2 text-center text-[11px] font-semibold text-[var(--teal-dark)] ${
                  i === 0 ? "bg-[var(--teal-pale)]" : "bg-[var(--gray-bg)]"
                }`}
              >
                {label}
                <br />
                <span className="font-normal text-[var(--gray-text)]">{hdrDates[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {sections.map((sec) => {
        const allNtnav = sec.fields.every(
          (f) => values.skills[skillKey(sec.title, f)] === "NTNAV",
        );
        const opts = optionsForField(sec.title, modelo);
        return (
          <section key={sec.title} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--teal-pale)] px-4 py-2.5">
              <span className="text-sm font-semibold text-[var(--teal-dark)]">{sec.title}</span>
              {!readOnly && (
                <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-[var(--teal-dark)]">
                  <input
                    type="checkbox"
                    checked={allNtnav}
                    onChange={(e) =>
                      toggleSectionNtnav(sec.title, sec.fields, e.target.checked)
                    }
                    className="h-3.5 w-3.5 accent-[var(--teal-dark)]"
                  />
                  Não incluso nesta avaliação
                </label>
              )}
            </div>
            <div className="p-4">
              {allNtnav && (
                <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-center text-sm font-bold text-[#c0392b]">
                  Não incluso nesta avaliação
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {sec.fields.map((f) => {
                  const key = skillKey(sec.title, f);
                  const val = values.skills[key] ?? "";
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-slate-700">{f}</span>
                      <select
                        className="form-control py-2 text-xs"
                        disabled={readOnly}
                        value={val}
                        onChange={(e) => setSkill(key, e.target.value)}
                      >
                        <option value="">—</option>
                        {opts.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                        <option value="NTNAV">Não incluso nesta avaliação</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      <section className="card overflow-hidden">
        <div className="bg-[var(--teal-pale)] px-4 py-2.5 text-sm font-semibold text-[var(--teal-dark)]">
          PROVA
        </div>
        <div className="p-4">
          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--teal-dark)]">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={values.probeNaoIncluso}
              onChange={(e) => update({ probeNaoIncluso: e.target.checked })}
              className="h-4 w-4 accent-[var(--teal-dark)]"
            />
            Não incluso nesta avaliação
          </label>
          {!values.probeNaoIncluso && (
            <>
              <div className="overflow-x-auto">
                <table className="mb-3 w-full min-w-[320px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-[var(--teal-pale)] text-left text-xs text-[var(--teal-dark)]">
                      <th className="p-2">Habilidade</th>
                      <th className="w-28 p-2">Pontuação</th>
                      <th className="w-10 p-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {values.probeRows.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="p-1">
                          <input
                            className="form-control py-1.5"
                            disabled={readOnly}
                            value={row.habilidade}
                            placeholder="Habilidade"
                            onChange={(e) => {
                              const probeRows = [...values.probeRows];
                              probeRows[i] = { ...probeRows[i], habilidade: e.target.value };
                              update({ probeRows });
                            }}
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            max={10}
                            className="form-control py-1.5"
                            disabled={readOnly}
                            value={row.pontuacao}
                            onChange={(e) => {
                              const probeRows = [...values.probeRows];
                              probeRows[i] = { ...probeRows[i], pontuacao: e.target.value };
                              update({ probeRows });
                            }}
                          />
                        </td>
                        <td className="p-1">
                          {!readOnly && (
                            <button
                              type="button"
                              className="btn-ghost rounded-lg px-2 py-1 text-red-600"
                              onClick={() => {
                                const probeRows = values.probeRows.filter((_, j) => j !== i);
                                update({ probeRows: probeRows.length ? probeRows : [{ habilidade: "", pontuacao: "" }] });
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--teal-dark)] font-bold text-[var(--teal-dark)]">
                      <td className="p-2">MÉDIA TOTAL</td>
                      <td className="p-2">{probeTotal}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    update({
                      probeRows: [...values.probeRows, { habilidade: "", pontuacao: "" }],
                    })
                  }
                >
                  + Adicionar habilidade
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {[
        ["Classificação Gallahue (2013)", "gallahue", 4],
        ["Estágio de Aprendizagem — Morgana (2020)", "morgana", 3],
        ["Meta Reavaliativa", "meta", 3],
        ["Considerações Gerais", "consideracoes", 4],
      ].map(([title, field, rows]) => (
        <section key={field as string} className="card overflow-hidden">
          <div className="bg-[var(--teal-pale)] px-4 py-2.5 text-sm font-semibold text-[var(--teal-dark)]">
            {title}
          </div>
          <div className="p-4">
            <textarea
              className="form-control min-h-[80px]"
              rows={rows as number}
              disabled={readOnly}
              value={values[field as keyof AssessmentFormValues] as string}
              onChange={(e) => update({ [field]: e.target.value } as Partial<AssessmentFormValues>)}
            />
          </div>
        </section>
      ))}

      <section className="card overflow-hidden">
        <div className="bg-[var(--teal-pale)] px-4 py-2.5 text-sm font-semibold text-[var(--teal-dark)]">
          Observações Gerais Individuais
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {(
            [
              ["Desenvolturas", "desenvolturas"],
              ["Dificuldades Observadas", "dificuldades"],
            ] as const
          ).map(([label, key]) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              {(values[key] as string[]).map((item, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <input
                    className="form-control"
                    disabled={readOnly}
                    value={item}
                    onChange={(e) => {
                      const list = [...values[key]];
                      list[i] = e.target.value;
                      update({ [key]: list } as Partial<AssessmentFormValues>);
                    }}
                  />
                  {!readOnly && (
                    <button
                      type="button"
                      className="btn-ghost shrink-0 px-2"
                      onClick={() => {
                        const list = values[key].filter((_, j) => j !== i);
                        update({ [key]: list.length ? list : [""] } as Partial<AssessmentFormValues>);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    update({ [key]: [...values[key], ""] } as Partial<AssessmentFormValues>)
                  }
                >
                  + Adicionar
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function getAssessmentFormSnapshot(
  values: AssessmentFormValues,
): AssessmentFormValues {
  return {
    ...values,
    probeRows: values.probeRows.map((r) => ({ ...r })),
    skills: { ...values.skills },
    desenvolturas: values.desenvolturas.filter(Boolean),
    dificuldades: values.dificuldades.filter(Boolean),
  };
}
