// "Próximos aniversariantes" — lógica pura (sem React, sem banco) do bloco birthdays.month.list.
//
// A tabela birthdays guarda só mês/dia (sem ano), então a "próxima ocorrência" de cada um é a
// primeira data >= hoje com aquele mês/dia. Quem faz aniversário em 29/fev num ano não bissexto
// comemora em 28/fev (decisão de exibição; o dado salvo não muda).
import { DAYS_PER_MONTH } from "./months";

export const BLOCK_TIME_ZONE = "America/Sao_Paulo";
export const DEFAULT_WINDOW_DAYS = 30;

export type CalendarDate = { year: number; month: number; day: number };

export type DatedBirthday = { month: number; day: number; fullName: string };

export type UpcomingBirthday<T extends DatedBirthday> = T & {
  // Dias entre hoje (0 = hoje) e a próxima ocorrência.
  daysUntil: number;
  // Data real da próxima ocorrência (já com a regra de 29/fev).
  occurrence: CalendarDate;
};

// Data "de parede" em America/Sao_Paulo — o servidor (Vercel) roda em UTC, então `new Date().getDate()`
// viraria o dia 3h antes da virada real no Brasil.
export function todayInSaoPaulo(now: Date = new Date()): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BLOCK_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: read("year"), month: read("month"), day: read("day") };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function dayNumber(date: CalendarDate): number {
  return Math.round(Date.UTC(date.year, date.month - 1, date.day) / 86_400_000);
}

function occurrenceIn(year: number, month: number, day: number): CalendarDate {
  const maxDay = month === 2 && !isLeapYear(year) ? 28 : (DAYS_PER_MONTH[month] ?? 31);
  return { year, month, day: Math.min(day, maxDay) };
}

export function nextOccurrence(month: number, day: number, from: CalendarDate): { occurrence: CalendarDate; daysUntil: number } {
  const fromNumber = dayNumber(from);
  let occurrence = occurrenceIn(from.year, month, day);
  if (dayNumber(occurrence) < fromNumber) {
    occurrence = occurrenceIn(from.year + 1, month, day);
  }
  return { occurrence, daysUntil: dayNumber(occurrence) - fromNumber };
}

// Quem entra: aniversários dentro de `windowDays` a partir de hoje (inclusive), em ordem da próxima
// ocorrência (empate: nome), no máximo `limit`. Janela vazia (ex.: dezembro sem ninguém cadastrado
// até fevereiro) → os próximos `limit` disponíveis, por maior que seja a distância.
export function selectUpcomingBirthdays<T extends DatedBirthday>(
  birthdays: readonly T[],
  today: CalendarDate,
  options: { limit: number; windowDays?: number },
): UpcomingBirthday<T>[] {
  const windowDays = options.windowDays ?? DEFAULT_WINDOW_DAYS;
  const ranked = birthdays
    .map((birthday) => ({ ...birthday, ...nextOccurrence(birthday.month, birthday.day, today) }))
    .sort((a, b) => a.daysUntil - b.daysUntil || a.fullName.localeCompare(b.fullName, "pt-BR"));

  const inWindow = ranked.filter((birthday) => birthday.daysUntil <= windowDays);
  return (inWindow.length > 0 ? inWindow : ranked).slice(0, options.limit);
}

export function relativeDayLabel(daysUntil: number): string {
  if (daysUntil <= 0) return "Hoje";
  if (daysUntil === 1) return "Amanhã";
  return `Em ${daysUntil} dias`;
}
