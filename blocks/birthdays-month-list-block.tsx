import { listPublicBirthdaysHandler as listPublicBirthdays } from "../features/list-public-birthdays/handler";
import { DAYS_PER_MONTH, MONTH_LABELS } from "../shared/months";
import type { PublicBirthdayView } from "../features/list-public-birthdays/types";
import type { BlockRendererProps } from "@venore/plugin-sdk";
import { hasRichTextContent, renderRichTextContent, RICH_TEXT_INLINE_CLASSES } from "@venore/plugin-sdk/page-builder";
import { cn } from "@venore/plugin-sdk/ui";
import { BirthdayCalendarDay } from "./birthday-calendar-day";

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function readString(data: Record<string, unknown>, key: string, fallback: string): string {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readLimit(data: Record<string, unknown>, fallback: number): number {
  const value = data.limit;
  return typeof value === "number" && value > 0 ? value : fallback;
}

type CalendarCell = { day: number; birthdays: PublicBirthdayView[] } | null;

// Grade do mês corrente (não um calendário genérico de qualquer mês/ano): dias 1..N vêm de
// DAYS_PER_MONTH (tolerante a fevereiro bissexto, sem ano na tabela birthdays — mesma regra de
// shared/months.ts), só o dia-da-semana de alinhamento usa o ano real corrente.
function buildCalendarCells(currentMonth: number, currentYear: number, birthdaysByDay: Map<number, PublicBirthdayView[]>): CalendarCell[] {
  const daysInMonth = DAYS_PER_MONTH[currentMonth] ?? 31;
  const firstWeekday = new Date(currentYear, currentMonth - 1, 1).getDay();

  const cells: CalendarCell[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      return { day, birthdays: birthdaysByDay.get(day) ?? [] };
    }),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export async function BirthdaysMonthListBlock({ block }: BlockRendererProps) {
  const title = readString(block.data, "title", "Aniversariantes do mês");
  const description = block.data.description;
  const emptyMessage = hasRichTextContent(block.data.emptyMessage)
    ? block.data.emptyMessage
    : "Não há aniversariantes cadastrados para este mês.";
  const limit = readLimit(block.data, 12);

  const result = await listPublicBirthdays();
  // Handler é público (sem auth) — um erro aqui é de infraestrutura, não de permissão. Bloco some
  // em vez de quebrar a página, mesmo padrão de AcademyCourseListBlock.
  if (!result.success) {
    return null;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const today = now.getDate();

  // "Próximo primeiro": hoje e quem ainda vai fazer aniversário este mês aparecem antes de quem já
  // fez — achado da revisão de blocos desta sessão (antes só ordenava por dia, misturando quem já
  // passou com quem ainda vem). MAX_DAYS_IN_MONTH (31) como deslocamento garante que o grupo "já
  // passou" sempre vem depois do grupo "ainda vem", mantendo ordem crescente dentro de cada grupo.
  // Usado só pra decidir QUEM entra no `limit` — a grade do calendário exibe esse conjunto já em
  // ordem cronológica normal (dia crescente), não "próximo primeiro".
  const MAX_DAYS_IN_MONTH = 31;
  function rank(day: number): number {
    return day >= today ? day - today : day - today + MAX_DAYS_IN_MONTH;
  }

  const monthBirthdays = result.data
    .filter((birthday) => birthday.month === currentMonth)
    .sort((a, b) => rank(a.day) - rank(b.day))
    .slice(0, limit)
    .sort((a, b) => a.day - b.day);

  const birthdaysByDay = new Map<number, PublicBirthdayView[]>();
  for (const birthday of monthBirthdays) {
    const group = birthdaysByDay.get(birthday.day) ?? [];
    group.push(birthday);
    birthdaysByDay.set(birthday.day, group);
  }

  const calendarCells = buildCalendarCells(currentMonth, currentYear, birthdaysByDay);

  return (
    <div className="rounded-panel border border-border bg-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {hasRichTextContent(description) && (
            <div className={cn("mt-1 text-sm text-muted-foreground", RICH_TEXT_INLINE_CLASSES)}>{renderRichTextContent(description)}</div>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {MONTH_LABELS[currentMonth]}
        </span>
      </div>

      {monthBirthdays.length === 0 ? (
        <div className={cn("mt-4 text-sm text-muted-foreground", RICH_TEXT_INLINE_CLASSES)}>{renderRichTextContent(emptyMessage)}</div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-caps text-muted-foreground sm:text-xs">
            {WEEKDAY_LABELS.map((label, index) => (
              // eslint-disable-next-line react/no-array-index-key -- rótulo fixo de 7 posições, sem identidade própria
              <span key={index}>{label}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarCells.map((cell, index) => {
              if (!cell) {
                // eslint-disable-next-line react/no-array-index-key -- célula de preenchimento sem dado, posição é a identidade
                return <div key={`pad-${index}`} aria-hidden="true" />;
              }

              return <BirthdayCalendarDay key={cell.day} day={cell.day} birthdays={cell.birthdays} isToday={cell.day === today} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
