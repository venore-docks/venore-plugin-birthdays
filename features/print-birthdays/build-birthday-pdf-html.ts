// EXCEÇÃO À REGRA DE TOKENS SEMÂNTICOS / "ZERO VALOR HARDCODED" — DELIBERADA.
//
// Este arquivo gera o documento HTML impresso via window.print() (uma folha A4, ver
// resolvePdfGridLayout). PDF é documento, não interface temável: ele precisa renderizar sempre
// igual, independente do tema ativo no host. Por isso aqui dimensão em milímetros, cor literal e
// fonte fixa são o comportamento CORRETO, não uma gambiarra a "corrigir" depois.
//
// O requisito de aceitação desta funcionalidade é fidelidade visual byte-a-byte com o layout
// homônimo do fem-colaborador (src/modules/birthdays/views/admin/client.tsx,
// buildBirthdayPdfHtml/buildPdfFooterMarkup/buildGiftSvgMarkup/resolvePdfGridLayout) — este
// arquivo é um porte quase literal daquele código. Não convertam cor/fonte/dimensão para tokens
// do tema: isso muda o resultado, e o resultado impresso é o requisito.
//
// As únicas cores que NÃO são literais fixas são as de negócio, injetadas via parâmetro:
// appearance.* (contexts/settings, birthdays.appearance.*), incluindo appearance.brandColor —
// a cor de marca do PDF é uma EXCEÇÃO DELIBERADA à regra geral de brand (desde T2,
// docs/implementation-roadmap.md Fase 5, a cor de marca do site vem do tema ativo,
// ThemeManifest.brandAesthetics.color): o PDF impresso não deve mudar toda vez que o tema do
// site muda, então sua cor de marca é configurada só em admin/birthdays/appearance
// (birthdays.appearance.brandColor), não herdada do tema. Ambas já eram configuráveis no
// fem-colaborador e continuam sendo aqui.
import type { BirthdayAppearanceSettings } from "../../shared/appearance";

export type PrintBrandMode = "text" | "svg" | "png";

export type BirthdayPdfInput = {
  birthdays: Array<{ id: string; fullName: string; role: string | null; day: number }>;
  monthLabel: string;
  appearance: BirthdayAppearanceSettings;
  brandMode: PrintBrandMode;
  brandAssetUrl: string;
  brandName: string;
  brandColor: string;
  giftSvgMarkup: string | null;
};

// Fallbacks idênticos aos lidos de `--font-display`/`--font-body` no fem-colaborador
// (getComputedStyle do host) — aqui viram literais porque a impressão não deve depender do tema
// do host que a chamar.
const FONT_DISPLAY = "Gotham, Montserrat, Avenir Next, Segoe UI, sans-serif";
const FONT_BODY = "Avenir Next, Inter, Segoe UI, sans-serif";

const PDF_TITLE = "Aniversariantes";
const PDF_TEAM_FALLBACK = "Equipe";
const PDF_EMPTY_MESSAGE = "Nenhum aniversariante neste mês.";
const PDF_OVERFLOW_MESSAGE = (count: number) => `+ ${count} registros não exibidos por limite de uma página.`;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildGiftSvgMarkup(svgMarkup: string | null) {
  if (!svgMarkup) {
    return "";
  }

  return svgMarkup
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/#89b6bd/gi, "var(--gift-accent-soft)")
    .replace(/#fff/gi, "var(--gift-ribbon)")
    .replace(/#db9327/gi, "var(--gift-shadow)")
    .replace(/#e0dcd1/gi, "var(--gift-neutral)")
    .replace(/#f7a823/gi, "var(--gift-gold)")
    .replace(/#1f8299/gi, "var(--gift-teal)")
    .replace(/<svg\b/gi, '<svg class="gift-svg"');
}

function abbreviateBirthdayName(fullName: string) {
  const normalizedParts = fullName.trim().split(/\s+/).filter(Boolean);

  if (normalizedParts.length <= 2 || fullName.trim().length <= 18) {
    return fullName.trim();
  }

  const particles = new Set(["da", "das", "de", "des", "di", "do", "dos", "e"]);
  const firstName = normalizedParts[0]!;
  const lastName = normalizedParts[normalizedParts.length - 1]!;
  const middle = normalizedParts
    .slice(1, -1)
    .map((part) => (particles.has(part.toLowerCase()) ? "" : `${part[0]!.toUpperCase()}.`))
    .filter(Boolean)
    .join(" ");

  return [firstName, middle, lastName].filter(Boolean).join(" ");
}

function resolvePdfGridLayout(total: number) {
  if (total <= 35) {
    return {
      columns: 5,
      rows: 7,
      slots: 35,
      gap: 10,
      sheetPadding: "14mm 12mm 12mm",
      sheetGap: "10mm",
      headerIcon: 82,
      titleFont: 23,
      subtitleFont: 27,
      footerHeight: 48,
      brandWidth: 306,
      brandHeight: 72,
      roleHeight: 34,
      cardPadding: "9px 10px 8px",
      dayFont: 12,
      nameFont: 12,
      roleFont: 9,
      rolePadding: "4px 6px",
    };
  }

  if (total <= 42) {
    return {
      columns: 6,
      rows: 7,
      slots: 42,
      gap: 8,
      sheetPadding: "12mm 10mm 10mm",
      sheetGap: "8mm",
      headerIcon: 72,
      titleFont: 21,
      subtitleFont: 24,
      footerHeight: 42,
      brandWidth: 270,
      brandHeight: 60,
      roleHeight: 30,
      cardPadding: "7px 8px 6px",
      dayFont: 11,
      nameFont: 10.5,
      roleFont: 8.5,
      rolePadding: "3px 5px",
    };
  }

  if (total <= 48) {
    return {
      columns: 6,
      rows: 8,
      slots: 48,
      gap: 7,
      sheetPadding: "10mm 9mm 9mm",
      sheetGap: "6mm",
      headerIcon: 64,
      titleFont: 19,
      subtitleFont: 22,
      footerHeight: 36,
      brandWidth: 238,
      brandHeight: 52,
      roleHeight: 26,
      cardPadding: "6px 7px 5px",
      dayFont: 10,
      nameFont: 9.5,
      roleFont: 8,
      rolePadding: "2px 4px",
    };
  }

  return {
    columns: 7,
    rows: 8,
    slots: 56,
    gap: 6,
    sheetPadding: "9mm 8mm 8mm",
    sheetGap: "5mm",
    headerIcon: 58,
    titleFont: 17,
    subtitleFont: 20,
    footerHeight: 32,
    brandWidth: 210,
    brandHeight: 46,
    roleHeight: 24,
    cardPadding: "5px 6px 4px",
    dayFont: 9,
    nameFont: 8.7,
    roleFont: 7.4,
    rolePadding: "2px 3px",
  };
}

function buildBirthdayGridSlots(
  birthdays: BirthdayPdfInput["birthdays"],
  cardColors: string[],
  slotCount: number,
) {
  const sortedBirthdays = birthdays
    .slice()
    .sort((left, right) => left.day - right.day || left.fullName.localeCompare(right.fullName, "pt-BR"));

  return Array.from({ length: slotCount }, (_, index) => {
    const birthday = sortedBirthdays[index] ?? null;

    return {
      birthday,
      color: birthday ? cardColors[index % cardColors.length]! : null,
      key: birthday ? birthday.id : `empty-slot-${index + 1}`,
    };
  });
}

function buildBrandMarkup(input: {
  brandMode: PrintBrandMode;
  brandAssetUrl: string;
  brandName: string;
  brandColor: string;
}) {
  if (input.brandMode === "text") {
    return `<div class="brand-text">${escapeHtml(input.brandName)}</div>`;
  }

  if (input.brandMode === "svg") {
    const color = input.brandColor.trim() || "#143b52";

    return `
      <div
        class="brand-mark brand-mark-svg"
        aria-label="${escapeHtml(input.brandName)}"
        style="
          color:${escapeHtml(color)};
          background-color:currentColor;
          mask-image:url('${escapeHtml(input.brandAssetUrl)}');
          -webkit-mask-image:url('${escapeHtml(input.brandAssetUrl)}');
        "
      ></div>
    `;
  }

  return `<img class="brand-mark brand-mark-image" src="${escapeHtml(input.brandAssetUrl)}" alt="${escapeHtml(input.brandName)}" />`;
}

export function buildBirthdayPdfHtml(input: BirthdayPdfInput): string {
  const layout = resolvePdfGridLayout(input.birthdays.length);
  const visibleBirthdays = input.birthdays.slice(0, layout.slots);
  const overflowCount = Math.max(0, input.birthdays.length - visibleBirthdays.length);
  const cards = buildBirthdayGridSlots(
    visibleBirthdays,
    [input.appearance.cardDarkColor, input.appearance.cardTealColor, input.appearance.cardAccentColor],
    layout.slots,
  )
    .map((slot) => {
      if (!slot.birthday || !slot.color) {
        return '<article class="birthday-card is-empty" aria-hidden="true"></article>';
      }

      const birthday = slot.birthday;
      const role = birthday.role?.trim() ? birthday.role : PDF_TEAM_FALLBACK;
      const displayName = abbreviateBirthdayName(birthday.fullName);

      return `
        <article class="birthday-slot" style="border-color:${slot.color}; background:${slot.color}">
          <div class="birthday-card" style="background:${slot.color}">
            <div class="birthday-day">${String(birthday.day).padStart(2, "0")}</div>
            <div class="birthday-name">${escapeHtml(displayName)}</div>
          </div>
          <div class="birthday-role">${escapeHtml(role)}</div>
        </article>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(PDF_TITLE)} ${escapeHtml(input.monthLabel)}</title>
        <style>
          :root {
            --teal: ${input.appearance.titleColor};
            --navy: ${input.appearance.cardDarkColor};
            --gold: ${input.appearance.monthColor};
            --paper: ${input.appearance.pageBackground};
            --ink: ${input.appearance.cardDarkColor};
            --card-text: ${input.appearance.cardTextColor};
            --day-text: ${input.appearance.dayTextColor};
            --role-text: ${input.appearance.roleTextColor};
            --brand-color: ${input.brandColor};
            --font-display: ${FONT_DISPLAY};
            --font-body: ${FONT_BODY};
            --gift-accent-soft: #89b6bd;
            --gift-ribbon: #ffffff;
            --gift-shadow: #db9327;
            --gift-neutral: #e0dcd1;
            --gift-gold: #f7a823;
            --gift-teal: #1f8299;
            --grid-columns: ${layout.columns};
            --grid-rows: ${layout.rows};
            --grid-gap: ${layout.gap}px;
            --sheet-padding: ${layout.sheetPadding};
            --sheet-gap: ${layout.sheetGap};
            --header-icon: ${layout.headerIcon}px;
            --title-font: ${layout.titleFont}px;
            --subtitle-font: ${layout.subtitleFont}px;
            --footer-height: ${layout.footerHeight}px;
            --brand-width: ${layout.brandWidth}px;
            --brand-height: ${layout.brandHeight}px;
            --role-height: ${layout.roleHeight}px;
            --card-padding: ${layout.cardPadding};
            --day-font: ${layout.dayFont}px;
            --name-font: ${layout.nameFont}px;
            --role-font: ${layout.roleFont}px;
            --role-padding: ${layout.rolePadding};
          }

          * {
            box-sizing: border-box;
            /* Sem isto, o Chrome só imprime background-color quando a caixa "Gráficos de
               segundo plano" está marcada no diálogo de impressão — sem ela, cor de fundo de
               card e a marca (mask-image + background-color:currentColor) somem, sobrando só a
               borda. print-color-adjust:exact força a impressão exata independente dessa opção. */
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          body {
            margin: 0;
            background: var(--paper);
            color: var(--ink);
            font-family: var(--font-body);
          }

          .sheet {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: var(--sheet-padding);
            background: var(--paper);
            display: grid;
            grid-template-rows: auto 1fr auto;
            gap: var(--sheet-gap);
            overflow: hidden;
          }

          .header {
            display: grid;
            grid-template-columns: 104px 1fr;
            align-items: center;
            gap: 14px;
          }

          .gift-wrap {
            width: var(--header-icon);
            height: var(--header-icon);
            margin-left: 4px;
          }

          .gift-svg {
            display: block;
            width: 100%;
            height: auto;
          }

          .title-wrap {
            text-align: right;
            justify-self: end;
            width: 100%;
            /* DIVERGÊNCIA INTENCIONAL do fem-colaborador: lá esta regra tem padding-right:18px,
               o que deixa o texto do título ~18px pra dentro da borda direita real da folha —
               enquanto a última coluna da grade de cards (.grid) encosta nessa borda sem nenhum
               recuo equivalente. Conferido com o usuário: no PDF de referência do fem-colaborador
               o título fica alinhado com a borda dos cards (sem esse gap), então 0 aqui é o que
               reproduz fielmente o resultado visual esperado — manter os 18px teria sido a cópia
               literal errada. */
            padding-right: 0;
          }

          .title {
            margin: 0;
            color: var(--role-text);
            font-family: var(--font-display);
            font-size: var(--title-font);
            line-height: 1;
            letter-spacing: 0.8px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .subtitle {
            margin: 7px 0 0;
            color: var(--gold);
            font-family: var(--font-display);
            font-size: var(--subtitle-font);
            line-height: 1;
            font-weight: 700;
            text-transform: uppercase;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
            grid-template-rows: repeat(var(--grid-rows), minmax(0, 1fr));
            gap: var(--grid-gap);
            min-height: 0;
          }

          .birthday-slot {
            min-height: 0;
            display: grid;
            grid-template-rows: 1fr var(--role-height);
            gap: 0;
            border: 2px solid transparent;
            border-radius: 4px;
            overflow: hidden;
          }

          .birthday-card {
            min-height: 0;
            display: grid;
            grid-template-rows: auto 1fr;
            padding: var(--card-padding);
            color: var(--card-text);
            page-break-inside: avoid;
            break-inside: avoid;
            overflow: hidden;
          }

          .birthday-card.is-empty {
            background: transparent !important;
          }

          .birthday-day {
            text-align: right;
            font-family: var(--font-display);
            font-size: var(--day-font);
            font-weight: 700;
            color: var(--day-text);
          }

          .birthday-name {
            align-self: center;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-family: var(--font-display);
            font-size: var(--name-font);
            line-height: 1.12;
            font-weight: 700;
            text-transform: uppercase;
            word-break: break-word;
            min-height: 100%;
            -webkit-box-pack: center;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .birthday-role {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: var(--card-text);
            background: transparent;
            font-size: var(--role-font);
            line-height: 1.2;
            font-weight: 700;
            letter-spacing: 0.02em;
            opacity: 1;
            height: var(--role-height);
            min-height: var(--role-height);
            max-height: var(--role-height);
            padding: var(--role-padding);
            border-top: 2px solid color-mix(in oklch, var(--card-text) 52%, transparent);
            text-shadow: 0 1px 1px color-mix(in oklch, #000000 18%, transparent);
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .footer {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: var(--footer-height);
          }

          .overflow-note {
            position: absolute;
            left: 8mm;
            right: 8mm;
            bottom: 2mm;
            margin: 0;
            text-align: center;
            color: var(--role-text);
            font-size: 7px;
            line-height: 1.1;
          }

          .brand-mark {
            display: block;
          }

          .brand-mark-svg {
            width: var(--brand-width);
            height: var(--brand-height);
            mask-repeat: no-repeat;
            -webkit-mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-position: center;
            mask-size: contain;
            -webkit-mask-size: contain;
          }

          .brand-mark-image {
            max-width: var(--brand-width);
            max-height: var(--brand-height);
            width: auto;
            height: auto;
            object-fit: contain;
          }

          .brand-text {
            color: var(--brand-color);
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <section class="header">
            <div class="gift-wrap" aria-hidden="true">
              ${buildGiftSvgMarkup(input.giftSvgMarkup)}
            </div>
            <div class="title-wrap">
              <h1 class="title">${escapeHtml(PDF_TITLE)}</h1>
              <p class="subtitle">${escapeHtml(input.monthLabel)}</p>
            </div>
          </section>

          <section class="grid">
            ${cards || `<p>${escapeHtml(PDF_EMPTY_MESSAGE)}</p>`}
          </section>

          ${overflowCount > 0 ? `<p class="overflow-note">${escapeHtml(PDF_OVERFLOW_MESSAGE(overflowCount))}</p>` : ""}

          <footer class="footer">
            ${buildBrandMarkup({
              brandMode: input.brandMode,
              brandAssetUrl: input.brandAssetUrl,
              brandName: input.brandName,
              brandColor: input.brandColor,
            })}
          </footer>
        </main>
      </body>
    </html>
  `;
}
