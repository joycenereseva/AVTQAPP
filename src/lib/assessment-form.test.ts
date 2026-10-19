import { describe, expect, it } from "vitest";
import {
  computeProbeTotal,
  sectionAllNotIncluded,
  skillKey,
  SECTIONS_AVANCADO,
} from "@/lib/assessment-form";

describe("assessment-form", () => {
  it("computes probe total", () => {
    expect(
      computeProbeTotal([
        { habilidade: "A", pontuacao: "2" },
        { habilidade: "B", pontuacao: "3.5" },
      ]),
    ).toBe("5.5");
  });

  it("detects section all NTNAV", () => {
    const sec = SECTIONS_AVANCADO[0];
    const skills: Record<string, string> = {};
    sec.fields.forEach((f) => {
      skills[skillKey(sec.title, f)] = "NTNAV";
    });
    expect(sectionAllNotIncluded(sec, skills)).toBe(true);
  });
});
