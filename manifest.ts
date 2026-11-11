import type { PluginManifest } from "@venore/plugin-sdk";
import { BIRTHDAY_APPEARANCE_SETTINGS } from "./shared/appearance";

// Faixa escrita à mão, não importada de platform/plugin-engine/core-version.ts — mesmo motivo do
// academyManifest (src/plugins/academy/manifest.ts): importar o CORE_VERSION corrente tornaria a
// checagem de compatibilidade sempre trivialmente satisfeita.
export const birthdaysManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "birthdays",
  name: "Aniversariantes",
  version: "1.0.0",
  description: "Quadro de aniversários agrupado por mês, com tela de cadastro administrativa.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  // Schema próprio do plugin — aplicado no install (run-plugin-migrations.ts), não no
  // vercel-build. Default de migrationsSchema ("birthdays_migrations") já bate com
  // src/plugins/birthdays/drizzle.config.ts.
  migrationsPath: "./migrations",
  permissions: [
    { key: "birthdays.read", label: "Ver aniversariantes cadastrados" },
    { key: "birthdays.manage", label: "Cadastrar, editar e remover aniversariantes" },
  ],
  settings: Object.values(BIRTHDAY_APPEARANCE_SETTINGS).map(({ key, defaultValue }) => ({ key, defaultValue })),
  navigation: [
    {
      key: "birthdays.admin",
      label: "Aniversariantes",
      href: "/admin/birthdays",
      icon: "cake",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 20,
      requiredPermission: "birthdays.read",
    },
  ],
  seeds: [
    { key: "example", label: "Dados de exemplo", description: "Seis aniversariantes distribuídos pelo ano." },
  ],
  blocks: [{ key: "birthdays.month.list", label: "Aniversariantes — Próximos aniversários" }],
};
