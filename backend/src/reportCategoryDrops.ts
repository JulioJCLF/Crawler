// REQ-019: chamado pelo watch.yml depois do crawler. Lê o arquivo de alerta
// (se existir) e orquestra a Issue via GitHub CLI. Decisão fica em
// reliability/categoryAlert.ts (testada); a leitura do arquivo aqui não é.
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import {
  decideCategoryAlertAction,
  CATEGORY_ALERT_LABEL,
} from "./reliability/categoryAlert.js";
import type { CategoryDrop } from "./reliability/categoryDrop.js";

function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8" });
}

async function readDrops(path: string): Promise<CategoryDrop[]> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as { drops: CategoryDrop[] };
    return parsed.drops ?? [];
  } catch {
    // Arquivo não existe: nenhuma queda foi detectada nesta execução.
    return [];
  }
}

function findOpenCategoryIssueNumber(): number | null {
  const output = gh([
    "issue",
    "list",
    "--label",
    CATEGORY_ALERT_LABEL,
    "--state",
    "open",
    "--json",
    "number",
    "--limit",
    "1",
  ]);
  const issues = JSON.parse(output) as { number: number }[];
  return issues.length > 0 ? issues[0].number : null;
}

function ensureLabel(label: string, description: string, color: string): void {
  try {
    gh(["label", "create", label, "--force", "--description", description, "--color", color]);
  } catch (err) {
    console.warn(`[reportCategoryDrops] Aviso ao garantir label '${label}':`, err);
  }
}

async function main() {
  const alertPath = process.argv[2];
  if (!alertPath) {
    throw new Error("Uso: reportCategoryDrops.ts <caminho-do-category-alert.json>");
  }

  const drops = await readDrops(alertPath);
  const now = new Date().toISOString();
  const existingOpenIssueNumber = findOpenCategoryIssueNumber();

  const action = decideCategoryAlertAction({ drops, existingOpenIssueNumber, now });

  switch (action.type) {
    case "create":
      ensureLabel(action.label, "Alerta de queda brusca em categoria do crawler (REQ-019)", "e99695");
      try {
        gh(["issue", "create", "--title", action.title, "--body", action.body, "--label", action.label]);
      } catch (err) {
        console.warn(`[reportCategoryDrops] Falha ao criar issue com rótulo '${action.label}'. Tentando sem rótulo:`, err);
        gh(["issue", "create", "--title", action.title, "--body", action.body]);
      }
      console.log("Issue de queda de categoria criada.");
      break;
    case "update":
      gh(["issue", "comment", String(action.issueNumber), "--body", action.body]);
      console.log(`Issue #${action.issueNumber} atualizada com a nova queda.`);
      break;
    case "close":
      gh(["issue", "comment", String(action.issueNumber), "--body", action.comment]);
      gh(["issue", "close", String(action.issueNumber)]);
      console.log(`Issue #${action.issueNumber} fechada — categorias se recuperaram.`);
      break;
    case "none":
      console.log("Sem queda de categoria e sem Issue aberta. Nada a fazer.");
      break;
  }
}

main();
