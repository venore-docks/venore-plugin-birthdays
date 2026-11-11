import type { BlockDefinition } from "@venore/plugin-sdk/cms";

export const birthdaysMonthListBlockDefinition: BlockDefinition = {
  key: "birthdays.month.list",
  label: "Aniversariantes — Próximos aniversários",
  category: "birthdays",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: {
    title: "Aniversariantes",
    description: "Quem celebra aniversário nos próximos dias.",
    emptyMessage: "Não há aniversariantes cadastrados.",
    limit: 8,
  },
  editorFields: [
    { name: "title", type: "text", label: "Título" },
    { name: "description", type: "richtext", label: "Descrição" },
    { name: "emptyMessage", type: "richtext", label: "Mensagem quando não há aniversariantes" },
    { name: "limit", type: "number", label: "Quantidade máxima exibida" },
  ],
};
