/** Formulário e nomenclatura — espelhado de reference/avaliacao_natacao.html */

export type AssessmentModel = "infantil" | "avancado";

export type AssessmentSection = {
  title: string;
  fields: readonly string[];
};

export const NOMENCLATURA_INF = [
  "RSNE",
  "RPE",
  "RME",
  "REE",
  "NR",
  "CAP",
  "SAP",
  "CAR",
  "CAM",
  "NTNAV",
] as const;

export const NOMENCLATURA_AVD = [
  "Ok",
  "CTS",
  "CTA",
  "ATS",
  "ATM",
  "RL",
  "RDF+",
  "CAP",
  "SAP",
  "NT",
  "N",
  "NTNAV",
] as const;

export const SECTIONS_INFANTIL: AssessmentSection[] = [
  {
    title: "Elementos Essenciais da Psicomotricidade",
    fields: [
      "Organização espaço temporal",
      "Lateralidade",
      "Tonus elasticidade",
      "Ritmo",
      "Coordenação motora global",
      "Equilíbrio",
      "Coordenação motora fina",
      "Esquema corporal",
    ],
  },
  {
    title: "Habilidades Motoras Estabilizadoras",
    fields: ["Equilíbrio dinâmico", "Equilíbrio estático", "Movimentos axiais"],
  },
  {
    title: "Habilidades Motoras Locomotoras na Natação",
    fields: [
      "Saltos",
      "Apneia",
      "Flutuação ventral",
      "Saltitos",
      "Respiração frontal",
      "Flutuação dorsal",
      "Entradas",
      "Deslocamento",
      "Sustentação",
      "Saídas",
      "Mergulhos",
      "Deslizes",
    ],
  },
  {
    title: "Habilidades Manipulativas — Propulsores",
    fields: ["Chutar", "Propulsão MMII", "Propulsão MMSS", "Arremessar objetos"],
  },
  {
    title: "Habilidades Manipulativas — Estabilizadores",
    fields: ["Alcançar", "Segurar", "Soltar", "Agarrar"],
  },
  {
    title: "Habilidades de Condicionamento",
    fields: [
      "Resistência cardiovascular",
      "Velocidade",
      "Resistência muscular",
      "Agilidade",
      "Flexibilidade",
      "Coordenação",
      "Capacidade de recuperação",
      "Nado contínuo ritmado",
      "Força dinâmica",
    ],
  },
];

export const SECTIONS_AVANCADO: AssessmentSection[] = [
  {
    title: "Habilidades Motoras Aquáticas Fundamentais",
    fields: [
      "Respiração frontal",
      "Deslocamento",
      "Apneia",
      "Deslocamento c/ respiração frontal",
      "Propulsão de MMII",
      "Flutuação ventral",
      "Propulsão de MMSS",
      "Flutuação dorsal",
      "Manejo de materiais",
      "Flutuação vertical",
      "Entradas e saídas variadas",
      "Salto",
    ],
  },
  {
    title: "Habilidades Introdutórias para os Nados",
    fields: [
      "Deslize dorsal",
      "Deslocamento subaquático",
      "Deslize ventral",
      "Giro p/ decúbito dorsal",
      "Ondulação",
      "Giro p/ decúbito ventral",
      "Submersão",
      "Mudança de direção variada",
      "Rotação de tronco",
      "Rotação de quadril",
      "Streamline",
      "Equilíbrio",
    ],
  },
  {
    title: "Habilidades Específicas — Nado Crawl",
    fields: [
      "Educativos",
      "Virada simples",
      "Alinhamento corporal total",
      "Propulsão MMII",
      "Virada olímpica",
      "Respiração bilateral",
      "Propulsão MMSS",
      "Deslize",
      "Nado completo coordenado",
      "Respiração lateral",
      "Ondulação",
    ],
  },
  {
    title: "Nado Costas",
    fields: [
      "Educativos",
      "Virada simples",
      "Propulsão MMII",
      "Virada olímpica",
      "Nado completo coordenado",
      "Propulsão MMSS",
      "Deslize dorsal",
      "Controle respiratório",
      "Ondulação dorsal submersa",
    ],
  },
  {
    title: "Nado Peito",
    fields: [
      "Educativos",
      "Respiração frontal",
      "Nado completo coordenado",
      "Propulsão MMII",
      "Virada simples",
      "Propulsão MMSS",
      "Filipina",
    ],
  },
  {
    title: "Nado Borboleta",
    fields: [
      "Educativos",
      "Respiração frontal",
      "Ondulação golfinho",
      "Propulsão MMII",
      "Virada simples",
      "Nado completo",
      "Propulsão MMSS",
      "Virada olímpica",
      "Deslize",
    ],
  },
  {
    title: "Habilidades de Condicionamento",
    fields: [
      "Resistência cardiovascular",
      "Velocidade",
      "Resistência muscular",
      "Agilidade",
      "Flexibilidade",
      "Coordenação",
      "Capacidade de recuperação",
      "Nado contínuo ritmado",
      "Força dinâmica",
    ],
  },
];

export const REFERENCE_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export type SkillValue = string;
export type SkillsMap = Record<string, SkillValue>;

export function skillKey(sectionTitle: string, field: string): string {
  return `${sectionTitle}::${field}`;
}

export function sectionsForModel(model: AssessmentModel): AssessmentSection[] {
  return model === "infantil" ? SECTIONS_INFANTIL : SECTIONS_AVANCADO;
}

export function optionsForField(
  sectionTitle: string,
  model: AssessmentModel,
): readonly string[] {
  if (sectionTitle.includes("Condicionamento")) {
    return NOMENCLATURA_INF;
  }
  return model === "infantil" ? NOMENCLATURA_INF : NOMENCLATURA_AVD;
}

export const NOM_AVD: [string, string][] = [
  ["CTS", "Com técnica simples"],
  ["CTA", "Com técnica acertiva"],
  ["ATS", "Autônomo 100%"],
  ["ATM", "Autônomo c/ material"],
  ["RL", "Realiza c/ limitação"],
  ["RDF+", "Muita dificuldade"],
  ["MMII", "Membros inferiores"],
  ["MMSS", "Membros superiores"],
  ["N", "Não faz"],
  ["NT", "Não testado"],
  ["CAP", "Apoio da profª"],
  ["SAP", "Sem apoio da profª"],
];

export const NOM_COND: [string, string][] = [
  ["RSNE", "Sem esforço"],
  ["RPE", "Pouco esforço"],
  ["RME", "Muito esforço"],
  ["REE", "Esforço extremo"],
  ["NR", "Não realiza"],
  ["CAP", "Apoio da profª"],
  ["SAP", "Sem apoio"],
  ["CAR", "Apoio responsável"],
  ["CAM", "Apoio material"],
];

export function nomenclatureForSection(
  sectionTitle: string,
  model: AssessmentModel,
): [string, string][] {
  const isCond = sectionTitle.includes("Condicionamento");
  if (isCond) return NOM_COND;
  return model === "infantil" ? NOM_COND : NOM_AVD;
}

export function skillColor(value: string | undefined): string {
  if (!value || value === "—") return "#444444";
  if (["CTA", "ATS", "RSNE"].includes(value)) return "#0A7A3A";
  if (["CTS", "ATM", "RPE", "RL", "CAP", "SAP"].includes(value)) return "#B07800";
  if (
    ["RDF+", "RME", "REE", "N", "NT", "NR", "CAR", "N. incluso"].includes(value)
  ) {
    return "#C0392B";
  }
  return "#333333";
}

export function displaySkillValue(raw: string | undefined): string {
  if (!raw) return "—";
  if (raw === "NTNAV") return "N. incluso";
  return raw;
}

export type ProbeRow = { habilidade: string; pontuacao: string };

export function computeProbeTotal(rows: ProbeRow[]): string {
  const total = rows.reduce(
    (sum, row) => sum + (parseFloat(row.pontuacao) || 0),
    0,
  );
  return total.toFixed(1);
}

export function sectionAllNotIncluded(
  section: AssessmentSection,
  skills: SkillsMap,
): boolean {
  return section.fields.every(
    (f) => skills[skillKey(section.title, f)] === "NTNAV",
  );
}

/** Data da avaliação no fuso America/Sao_Paulo (YYYY-MM-DD). */
export function todayBrazilISODate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(now);
}

export function currentReferenceMonthBrazil(now = new Date()): string {
  const monthIndex = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      month: "numeric",
    }).format(now),
  );
  return REFERENCE_MONTHS[monthIndex - 1] ?? "Janeiro";
}
