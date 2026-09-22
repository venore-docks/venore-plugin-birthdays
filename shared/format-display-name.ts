// Higienização de exibição (não altera o dado salvo) — nomes vêm do cadastro/import CSV sem
// padrão de capitalização garantido ("MARIA DA SILVA", "joão pedro", ...). Regra pedida: primeira
// letra de cada palavra maiúscula, resto minúsculo — sem tratar partículas (da/de/dos) como
// exceção, de propósito (não foi pedido). toLocaleUpperCase/toLocaleLowerCase("pt-BR") em vez das
// variantes sem locale — acentuação (Á, Ã, É...) precisa do case mapping certo pro idioma.
export function formatDisplayName(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((word) => `${word.charAt(0).toLocaleUpperCase("pt-BR")}${word.slice(1).toLocaleLowerCase("pt-BR")}`)
    .join(" ");
}
