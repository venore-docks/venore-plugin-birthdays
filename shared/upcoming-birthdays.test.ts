import { describe, expect, it } from "vitest";
import {
  nextOccurrence,
  relativeDayLabel,
  selectUpcomingBirthdays,
  todayInSaoPaulo,
  type CalendarDate,
} from "./upcoming-birthdays";

const person = (fullName: string, month: number, day: number) => ({ fullName, month, day });
const date = (year: number, month: number, day: number): CalendarDate => ({ year, month, day });

describe("nextOccurrence", () => {
  it("hoje conta como 0 dias", () => {
    expect(nextOccurrence(11, 30, date(2026, 11, 30)).daysUntil).toBe(0);
  });

  it("vira o mês e o ano: 30/nov -> 3/dez e 30/dez -> 2/jan", () => {
    expect(nextOccurrence(12, 3, date(2026, 11, 30))).toEqual({ occurrence: date(2026, 12, 3), daysUntil: 3 });
    expect(nextOccurrence(1, 2, date(2026, 12, 30))).toEqual({ occurrence: date(2027, 1, 2), daysUntil: 3 });
  });

  it("quem já passou este ano vai para o ano seguinte", () => {
    expect(nextOccurrence(11, 29, date(2026, 11, 30))).toEqual({ occurrence: date(2027, 11, 29), daysUntil: 364 });
  });

  it("29/fev em ano não bissexto comemora em 28/fev; em bissexto, em 29/fev", () => {
    expect(nextOccurrence(2, 29, date(2027, 2, 1)).occurrence).toEqual(date(2027, 2, 28));
    expect(nextOccurrence(2, 29, date(2028, 2, 1)).occurrence).toEqual(date(2028, 2, 29));
    expect(nextOccurrence(2, 29, date(2026, 11, 30)).occurrence).toEqual(date(2027, 2, 28));
  });
});

describe("selectUpcomingBirthdays", () => {
  const list = [
    person("Bruno", 12, 10),
    person("Ana", 11, 30),
    person("Carla", 1, 5),
    person("Daniel", 12, 3),
    person("Eva", 11, 29),
    person("Fábio", 3, 15),
  ];

  it("30/nov: hoje primeiro, depois dezembro, em ordem de proximidade, dentro da janela de 30 dias", () => {
    const result = selectUpcomingBirthdays(list, date(2026, 11, 30), { limit: 8 });
    expect(result.map((item) => item.fullName)).toEqual(["Ana", "Daniel", "Bruno"]);
    expect(result.map((item) => item.daysUntil)).toEqual([0, 3, 10]);
  });

  it("respeita o limit", () => {
    expect(selectUpcomingBirthdays(list, date(2026, 11, 30), { limit: 2 }).map((item) => item.fullName)).toEqual(["Ana", "Daniel"]);
  });

  it("janela vazia: mostra os próximos disponíveis, mesmo fora dos 30 dias", () => {
    const result = selectUpcomingBirthdays([person("Bruno", 12, 10), person("Fábio", 3, 15)], date(2026, 12, 20), { limit: 2 });
    expect(result.map((item) => item.fullName)).toEqual(["Fábio", "Bruno"]);
    expect(result.map((item) => item.daysUntil)).toEqual([85, 355]);
  });

  it("com alguém na janela, quem está fora dela não entra", () => {
    const result = selectUpcomingBirthdays(list, date(2026, 12, 20), { limit: 8 });
    expect(result.map((item) => item.fullName)).toEqual(["Carla"]);
  });

  it("empate no mesmo dia ordena por nome", () => {
    const result = selectUpcomingBirthdays([person("Zeca", 12, 1), person("Ana", 12, 1)], date(2026, 11, 30), { limit: 8 });
    expect(result.map((item) => item.fullName)).toEqual(["Ana", "Zeca"]);
  });

  it("lista vazia devolve vazio", () => {
    expect(selectUpcomingBirthdays([], date(2026, 11, 30), { limit: 8 })).toEqual([]);
  });
});

describe("todayInSaoPaulo", () => {
  it("usa o dia de São Paulo, não o de UTC (02:00 UTC de 1/dez ainda é 30/nov em SP)", () => {
    expect(todayInSaoPaulo(new Date("2026-12-01T02:00:00Z"))).toEqual(date(2026, 11, 30));
    expect(todayInSaoPaulo(new Date("2026-12-01T03:30:00Z"))).toEqual(date(2026, 12, 1));
  });
});

describe("relativeDayLabel", () => {
  it("hoje / amanhã / em N dias", () => {
    expect(relativeDayLabel(0)).toBe("Hoje");
    expect(relativeDayLabel(1)).toBe("Amanhã");
    expect(relativeDayLabel(5)).toBe("Em 5 dias");
  });
});
