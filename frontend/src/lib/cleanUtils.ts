/**
 * Remove qualquer ocorrência da escrita "Arsenal Sports" do título/descrição
 * do produto (seja como sufixo, prefixo, entre parênteses ou separado por hífen),
 * preservando o restante do título e especificações técnicas (como roscas "14MM-").
 */
export function cleanProductName(name: string): string {
  if (!name) return "";
  return name
    .replace(/\s*[\(\[]\s*arsenal\s+sports\s*[\)\]]/gi, "")
    .replace(/(\s+[-|/•]\s*|\s+)\barsenal\s+sports\b/gi, "")
    .replace(/^\barsenal\s+sports\b\s*[-|/•]?\s*/gi, "")
    .replace(/\barsenal\s+sports\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
