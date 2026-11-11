import { listPublicBirthdaysHandler as listPublicBirthdays } from "../features/list-public-birthdays/handler";
import { formatDisplayName } from "../shared/format-display-name";
import { MONTH_LABELS } from "../shared/months";
import { relativeDayLabel, selectUpcomingBirthdays, todayInSaoPaulo } from "../shared/upcoming-birthdays";
import type { BlockRendererProps } from "@venore/plugin-sdk";
import { hasRichTextContent, renderRichTextContent, RICH_TEXT_INLINE_CLASSES } from "@venore/plugin-sdk/page-builder";
import { cn } from "@venore/plugin-sdk/ui";

function readString(data: Record<string, unknown>, key: string, fallback: string): string {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readLimit(data: Record<string, unknown>, fallback: number): number {
  const value = data.limit;
  return typeof value === "number" && value > 0 ? value : fallback;
}

function monthAbbreviation(month: number): string {
  return (MONTH_LABELS[month] ?? "").slice(0, 3).toLocaleUpperCase("pt-BR");
}

// Lista dos próximos aniversariantes (hoje em diante, janela de ~30 dias — ver
// shared/upcoming-birthdays.ts), no lugar da grade de calendário. Só tokens shadcn: funciona em
// tema claro/escuro e herda as cores do tema ativo. As cores de birthdays.appearance.* são do
// quadro público/PDF e não se aplicam a este bloco.
export async function BirthdaysMonthListBlock({ block }: BlockRendererProps) {
  const title = readString(block.data, "title", "Aniversariantes");
  const description = block.data.description;
  const emptyMessage = hasRichTextContent(block.data.emptyMessage)
    ? block.data.emptyMessage
    : "Não há aniversariantes cadastrados.";
  const limit = readLimit(block.data, 8);

  const result = await listPublicBirthdays();
  // Handler é público (sem auth) — um erro aqui é de infraestrutura, não de permissão. Bloco some
  // em vez de quebrar a página, mesmo padrão de AcademyCourseListBlock.
  if (!result.success) {
    return null;
  }

  const upcoming = selectUpcomingBirthdays(result.data, todayInSaoPaulo(), { limit });

  const first = upcoming[0];
  const last = upcoming[upcoming.length - 1];
  const rangeLabel = first
    ? first.occurrence.month === last.occurrence.month
      ? (MONTH_LABELS[first.occurrence.month] ?? "")
      : `${monthAbbreviation(first.occurrence.month)} – ${monthAbbreviation(last.occurrence.month)}`
    : null;

  return (
    <section className="overflow-hidden rounded-panel border border-border bg-card shadow-panel">
      <header className="flex items-start justify-between gap-3 border-b border-border p-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          {hasRichTextContent(description) && (
            <div className={cn("mt-1 text-sm text-muted-foreground", RICH_TEXT_INLINE_CLASSES)}>{renderRichTextContent(description)}</div>
          )}
        </div>
        {rangeLabel && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{rangeLabel}</span>
        )}
      </header>

      {upcoming.length === 0 ? (
        <div className={cn("p-4 text-sm text-muted-foreground sm:px-6", RICH_TEXT_INLINE_CLASSES)}>{renderRichTextContent(emptyMessage)}</div>
      ) : (
        <ul className="divide-y divide-border">
          {upcoming.map((birthday) => {
            const isToday = birthday.daysUntil === 0;
            return (
              <li
                key={birthday.id}
                className={cn("flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6", isToday && "bg-primary/10")}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    "flex size-12 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
                    isToday ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  <span className="text-lg font-semibold tabular-nums">{birthday.occurrence.day}</span>
                  <span
                    className={cn(
                      "mt-0.5 text-[10px] font-medium tracking-caps",
                      isToday ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {monthAbbreviation(birthday.occurrence.month)}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{formatDisplayName(birthday.fullName)}</p>
                  {birthday.role && <p className="truncate text-xs text-muted-foreground">{birthday.role}</p>}
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                    isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {relativeDayLabel(birthday.daysUntil)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
