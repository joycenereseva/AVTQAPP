import type { PublicReportPayload } from "@/lib/types/database";
import {
  displaySkillValue,
  nomenclatureForSection,
  sectionAllNotIncluded,
  sectionsForModel,
  skillColor,
  type ProbeRow,
} from "@/lib/assessment-form";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { calcAgeFromBirthDate } from "@/lib/utils";

type Props = {
  data: PublicReportPayload;
  photoUrl?: string | null;
};

function ProbeChart({ rows }: { rows: ProbeRow[] }) {
  const data = rows.filter((r) => r.habilidade && r.pontuacao !== "");
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map((r) => parseFloat(r.pontuacao) || 0), 1);
  return (
    <div className="overflow-x-auto px-3 pb-3">
      <div className="flex min-h-[120px] items-end gap-2 pt-2">
        {data.map((r, i) => {
          const val = parseFloat(r.pontuacao) || 0;
          const pct = Math.max((val / maxVal) * 100, 4);
          const tone =
            val >= maxVal * 0.8 ? "bg-[var(--teal)]" : val >= maxVal * 0.5 ? "bg-amber-500" : "bg-red-500";
          return (
            <div key={i} className="min-w-[36px] flex-1 text-center">
              <div className="text-xs font-bold text-[var(--teal-dark)]">{val}</div>
              <div
                className={`mx-auto mt-1 w-[80%] rounded-t ${tone}`}
                style={{ height: `${pct}px`, minHeight: 4 }}
              />
              <div className="mt-1 break-words text-[10px] text-[var(--gray-text)]">
                {r.habilidade}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PublicReportView({ data, photoUrl }: Props) {
  const { student, eval: ev, config, avDates } = data;
  const sections = sectionsForModel(student.modelo);
  const skills = ev.skills ?? {};
  const age = calcAgeFromBirthDate(student.birth_date);

  const dateLabels = ["Avaliado", "Reavaliado", "Reavaliado", "Reavaliado"];

  return (
    <div className="mx-auto max-w-[640px] pb-8">
      <div className="bg-gradient-to-br from-[var(--teal-dark)] to-[var(--teal)] px-4 pb-6 pt-5 text-white">
        <div className="flex items-center gap-3.5">
          <StudentAvatar
            name={student.nome}
            photoUrl={photoUrl}
            size="lg"
            className="border-white/85"
          />
          <div>
            <h1 className="font-brand text-xl font-bold leading-tight">{student.nome}</h1>
            <p className="mt-1 text-sm opacity-90">
              {age !== "—" ? `${age} anos` : "—"} · {student.schedule || "—"}
            </p>
            <span className="mt-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
              {ev.mes} · {ev.data}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 border-b border-[#c8dde8] bg-white px-4 py-3 text-center text-[11px]">
        {dateLabels.map((label, i) => {
          const d = avDates[i] ?? "—";
          const active = i === 0 || d === ev.data;
          return (
            <div key={i} className={active ? "text-[var(--teal-dark)]" : "text-[var(--gray-text)]"}>
              <strong className="block text-[10px] uppercase">{label}</strong>
              <span className={active ? "font-bold" : ""}>{d}</span>
            </div>
          );
        })}
      </div>

      {sections.map((sec) => {
        const allNtnav = sectionAllNotIncluded(sec, skills);
        const nom = nomenclatureForSection(sec.title, student.modelo);
        return (
          <section
            key={sec.title}
            className="mx-3 mt-3 overflow-hidden rounded-[10px] bg-white shadow-sm"
          >
            <div className="bg-[var(--teal-dark)] px-3.5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white">
              {sec.title}
            </div>
            {allNtnav ? (
              <div className="p-3 text-center text-sm font-bold text-[#c0392b]">
                NÃO INCLUSO NESTA AVALIAÇÃO
              </div>
            ) : (
              <div className="flex">
                <div className="min-w-0 flex-1 p-3">
                  {sec.fields.map((f) => {
                    const raw = skills[`${sec.title}::${f}`];
                    const v = displaySkillValue(raw);
                    return (
                      <div
                        key={f}
                        className="border-b border-slate-100 py-1 text-sm last:border-0"
                      >
                        <span className="text-slate-700">{f}: </span>
                        <span className="font-bold" style={{ color: skillColor(v) }}>
                          {v}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="hidden w-[38%] max-w-[150px] border-l border-[#c8dde8] bg-[#eef4f8] p-2 text-[10px] leading-snug sm:block">
                  <div className="mb-1 border-b border-[#c8dde8] pb-1 text-[9px] font-bold uppercase text-[var(--teal-dark)]">
                    Nomenclatura
                  </div>
                  {nom.map(([k, desc]) => (
                    <div key={k}>
                      <strong className="text-[var(--teal-dark)]">{k}</strong> {desc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}

      {ev.probeNaoIncluso ? (
        <div className="mx-3 mt-3 overflow-hidden rounded-[10px] bg-white shadow-sm">
          <div className="bg-[var(--teal-dark)] px-3.5 py-2.5 text-sm font-bold text-white">
            Prova
          </div>
          <div className="p-3 text-center text-sm font-bold text-[#c0392b]">
            Não incluso nesta avaliação
          </div>
        </div>
      ) : (
        <div className="mx-3 mt-3 overflow-hidden rounded-[10px] bg-white shadow-sm">
          <div className="bg-[var(--teal-dark)] px-3.5 py-2.5 text-sm font-bold text-white">
            Prova{" "}
            <small className="block font-normal opacity-80">
              Média total: {ev.probeTotal || "—"}
            </small>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#eef4f8] text-left text-xs text-[var(--teal-dark)]">
                <th className="px-3 py-2">Habilidade</th>
                <th className="px-3 py-2">Pontuação</th>
              </tr>
            </thead>
            <tbody>
              {(ev.probeRows ?? [])
                .filter((r) => r.habilidade)
                .map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2">{r.habilidade}</td>
                    <td className="px-3 py-2 font-bold">{r.pontuacao}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <ProbeChart rows={ev.probeRows ?? []} />
        </div>
      )}

      {[
        ["Classificação Gallahue (2013)", ev.gallahue, "Gallahue; Ozmun; Goodway"],
        ["Estágio de Aprendizagem — Morgana (2020)", ev.morgana, null],
        ["Meta reavaliativa", ev.meta, null],
        ["Considerações finais", ev.consideracoes, null],
      ].map(([title, body, sub]) =>
        body ? (
          <div key={title as string} className="mx-3 mt-3 overflow-hidden rounded-[10px] bg-white shadow-sm">
            <div className="bg-[var(--teal-dark)] px-3.5 py-2.5 text-sm font-bold text-white">
              {title}
              {sub ? <small className="mt-0.5 block font-normal opacity-80">{sub}</small> : null}
            </div>
            <div className="whitespace-pre-wrap p-3.5 text-[15px]">{body}</div>
          </div>
        ) : null,
      )}

      {ev.desenvolturas?.length ? (
        <div className="mx-3 mt-3 overflow-hidden rounded-[10px] bg-white shadow-sm">
          <div className="bg-[var(--teal-dark)] px-3.5 py-2.5 text-sm font-bold text-white">
            Desenvolturas
          </div>
          <ul className="list-disc p-3.5 pl-8 text-[15px]">
            {ev.desenvolturas.map((item, i) => (
              <li key={i} className="mb-1.5">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {ev.dificuldades?.length ? (
        <div className="mx-3 mt-3 overflow-hidden rounded-[10px] bg-white shadow-sm">
          <div className="bg-[var(--teal-dark)] px-3.5 py-2.5 text-sm font-bold text-white">
            Dificuldades observadas
          </div>
          <ul className="list-disc p-3.5 pl-8 text-[15px]">
            {ev.dificuldades.map((item, i) => (
              <li key={i} className="mb-1.5">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <footer className="mx-3 mt-5 rounded-[10px] bg-[var(--teal-dark)] p-3.5 text-center text-xs leading-relaxed text-white/90">
        <strong>{config.nome || "Prof.ª Joyce Neres"}</strong>
        <br />
        CREF {config.cref || "—"} · {config.tel || ""}
        <br />
        {config.email || ""}
        <br />
        <span className="opacity-75">
          Ficha de Avaliação Técnica Qualitativa · Natação Particular
        </span>
      </footer>
    </div>
  );
}
