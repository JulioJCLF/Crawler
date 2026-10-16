import path from "path";
import {
  resetAllToFactoryDefaults,
  changePassword,
  listUsersSummary,
  findUserByIdentifier,
} from "../src/lib/auth";

async function main() {
  const args = process.argv.slice(2);

  console.log("==================================================");
  console.log(" Hunting World - Utilitário de Reset de Acessos   ");
  console.log("==================================================\n");

  if (args.length >= 2) {
    const targetUser = args[0].trim().toLowerCase();
    const newPassword = args[1];

    if (newPassword.length < 6) {
      console.error("❌ Erro: A nova senha deve ter no mínimo 6 caracteres.");
      process.exit(1);
    }

    const user = findUserByIdentifier(targetUser);
    if (!user) {
      console.error(`❌ Erro: Usuário '${targetUser}' não encontrado.`);
      console.log("Usuários disponíveis:", listUsersSummary().map((u) => u.username).join(", "));
      process.exit(1);
    }

    const ok = changePassword(targetUser, newPassword);
    if (ok) {
      console.log(`✅ Senha do usuário '${targetUser}' alterada com sucesso!`);
      console.log(`Nova senha configurada: ${newPassword}`);
    } else {
      console.error("❌ Falha ao salvar nova senha no arquivo de configuração.");
      process.exit(1);
    }
  } else {
    // Sem argumentos: restaura todos os padrões de fábrica
    console.log("Restaurando todos os usuários para os padrões iniciais de fábrica...");
    const ok = resetAllToFactoryDefaults();

    if (ok) {
      console.log("✅ Configurações restauradas com sucesso!\n");
      console.log("--------------------------------------------------");
      console.log("📋 Credenciais Padrão Restauradas:");
      console.log("--------------------------------------------------");
      console.log("1) Administrador Master:");
      console.log("   - Usuário: admin");
      console.log("   - Senha:   arsenal@admin2026");
      console.log("   - E-mail:  admin@huntworld.com.br\n");
      console.log("2) Operador de Dólar / Câmbio:");
      console.log("   - Usuário: cambio");
      console.log("   - Senha:   arsenal@dolar2026");
      console.log("   - E-mail:  cambio@huntworld.com.br");
      console.log("--------------------------------------------------");
      console.log("🔑 Chave Mestra de Recuperação Web:");
      console.log("   arsenal-reset-2026");
      console.log("--------------------------------------------------");
    } else {
      console.error("❌ Falha ao restaurar padrões de autenticação.");
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Erro inesperado no script de reset:", err);
  process.exit(1);
});
