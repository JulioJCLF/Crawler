// REQ-018: chamado pelo watch.yml como último passo do job (if: always()).
// Só orquestra chamadas ao GitHub CLI; a decisão fica em reliability/failureAlert.ts (testada).
import { execFileSync } from "node:child_process";
import {
  decideFailureAction,
  FAILURE_ISSUE_LABEL,
} from "./reliability/failureAlert.js";

function gh(args: string[]): string {
  return execFileSync("gh", args, { encoding: "utf8" });
}

function ensureLabel(label: string, description: string, color: string): void {
  try {
    gh(["label", "create", label, "--force", "--description", description, "--color", color]);
  } catch (err) {
    console.warn(`[reportExecutionStatus] Aviso ao garantir label '${label}':`, err);
  }
}

function parseArgs(argv: string[]): { status: string; runUrl: string } {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    if (i === -1 || i === argv.length - 1) {
      throw new Error(`Argumento obrigatório ausente: ${flag}`);
    }
    return argv[i + 1];
  };
  return { status: get("--status"), runUrl: get("--run-url") };
}

function findOpenFailureIssueNumber(): number | null {
  const output = gh([
    "issue",
    "list",
    "--label",
    FAILURE_ISSUE_LABEL,
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

function main() {
  const { status, runUrl } = parseArgs(process.argv.slice(2));
  const executionFailed = status !== "success";
  const now = new Date().toISOString();

  const existingOpenIssueNumber = findOpenFailureIssueNumber();

  const action = decideFailureAction({
    executionFailed,
    existingOpenIssueNumber,
    runUrl,
    now,
  });

  switch (action.type) {
    case "create":
      ensureLabel(action.label, "Alerta de falha na execução diária do crawler (REQ-018)", "d73a4a");
      try {
        gh(["issue", "create", "--title", action.title, "--body", action.body, "--label", action.label]);
      } catch (err) {
        console.warn(`[reportExecutionStatus] Falha ao criar issue com rótulo '${action.label}'. Tentando sem rótulo:`, err);
        gh(["issue", "create", "--title", action.title, "--body", action.body]);
      }
      console.log("Issue de falha criada.");
      break;
    case "update":
      gh(["issue", "comment", String(action.issueNumber), "--body", action.body]);
      console.log(`Issue #${action.issueNumber} atualizada com a nova falha.`);
      break;
    case "close":
      gh(["issue", "comment", String(action.issueNumber), "--body", action.comment]);
      gh(["issue", "close", String(action.issueNumber)]);
      console.log(`Issue #${action.issueNumber} fechada — execução se recuperou.`);
      break;
    case "none":
      console.log("Execução ok, sem Issue de falha aberta. Nada a fazer.");
      break;
  }
}

main();
