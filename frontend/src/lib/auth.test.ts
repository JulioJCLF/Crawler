import { describe, it, expect, beforeEach } from "vitest";
import {
  validateCredentials,
  authenticateUser,
  createSessionToken,
  verifySessionToken,
  changePassword,
  adminResetUserPassword,
  generatePasswordResetCode,
  verifyAndResetPasswordWithCode,
  resetPasswordWithRecoveryKey,
  resetAllToFactoryDefaults,
  DEFAULT_RECOVERY_KEY,
  updateUserEmail,
  listUsersSummary,
} from "./auth";

describe("auth - Sistema de Autenticação, Perfis e Recuperação", () => {
  beforeEach(() => {
    // Restaura padrões de fábrica antes de cada teste
    resetAllToFactoryDefaults();
  });

  it("valida com sucesso credenciais de Admin Master e Operador de Dólar", () => {
    const adminAuth = authenticateUser("admin", "arsenal@admin2026");
    expect(adminAuth).not.toBeNull();
    expect(adminAuth?.username).toBe("admin");
    expect(adminAuth?.role).toBe("master");

    const cambioAuth = authenticateUser("cambio", "arsenal@dolar2026");
    expect(cambioAuth).not.toBeNull();
    expect(cambioAuth?.username).toBe("cambio");
    expect(cambioAuth?.role).toBe("dolar_operator");

    expect(validateCredentials("admin", "arsenal@admin2026")).toBe(true);
    expect(validateCredentials("cambio", "arsenal@dolar2026")).toBe(true);
  });

  it("rejeita senha incorreta e usuário inexistente", () => {
    expect(validateCredentials("admin", "senha-errada-123")).toBe(false);
    expect(validateCredentials("cambio", "senha-errada-123")).toBe(false);
    expect(validateCredentials("usuario_fantasma", "arsenal@admin2026")).toBe(false);
  });

  it("gera token de sessão com role e valida com HMAC", () => {
    const adminToken = createSessionToken("admin", 2, "master");
    const adminSession = verifySessionToken(adminToken);
    expect(adminSession).not.toBeNull();
    expect(adminSession?.username).toBe("admin");
    expect(adminSession?.role).toBe("master");

    const cambioToken = createSessionToken("cambio", 2, "dolar_operator");
    const cambioSession = verifySessionToken(cambioToken);
    expect(cambioSession).not.toBeNull();
    expect(cambioSession?.username).toBe("cambio");
    expect(cambioSession?.role).toBe("dolar_operator");
  });

  it("rejeita token adulterado ou expirado", () => {
    const token = createSessionToken("admin", 2);
    const tampered = token.slice(0, -4) + "XXXX";
    expect(verifySessionToken(tampered)).toBeNull();

    const expiredToken = createSessionToken("admin", -2);
    expect(verifySessionToken(expiredToken)).toBeNull();
  });

  it("permite alterar a senha de qualquer um dos usuários", () => {
    const newPass = "novaSenhaSegura2026";
    expect(changePassword("cambio", newPass)).toBe(true);
    expect(validateCredentials("cambio", newPass)).toBe(true);
    expect(validateCredentials("cambio", "arsenal@dolar2026")).toBe(false);
  });

  it("permite que o Admin Master redefina a senha do operador de dólar", () => {
    const res = adminResetUserPassword("admin", "cambio", "novaSenhaOperador2026");
    expect(res.success).toBe(true);
    expect(validateCredentials("cambio", "novaSenhaOperador2026")).toBe(true);

    // Operador tentando redefinir a senha do master deve falhar
    const failRes = adminResetUserPassword("cambio", "admin", "tentativaInvasao2026");
    expect(failRes.success).toBe(false);
  });

  it("gera código de recuperação de 6 dígitos e permite redefinir senha", () => {
    const codeRes = generatePasswordResetCode("admin");
    expect(codeRes.success).toBe(true);
    expect(codeRes.code).toBeDefined();
    expect(codeRes.code?.length).toBe(6);

    const resetRes = verifyAndResetPasswordWithCode(
      "admin",
      codeRes.code!,
      "senhaRecuperada2026"
    );
    expect(resetRes.success).toBe(true);
    expect(validateCredentials("admin", "senhaRecuperada2026")).toBe(true);

    // Código não pode ser reutilizado
    const reuseRes = verifyAndResetPasswordWithCode(
      "admin",
      codeRes.code!,
      "outraSenha2026"
    );
    expect(reuseRes.success).toBe(false);
  });

  it("rejeita código de verificação incorreto", () => {
    generatePasswordResetCode("cambio");
    const res = verifyAndResetPasswordWithCode("cambio", "000000", "senhaQualquer2026");
    expect(res.success).toBe(false);
    expect(res.error).toContain("incorreto");
  });

  it("permite redefinir senha através da Chave Mestra de Emergência", () => {
    const resetRes = resetPasswordWithRecoveryKey(
      "cambio",
      DEFAULT_RECOVERY_KEY,
      "novaSenhaChaveMestra2026"
    );
    expect(resetRes.success).toBe(true);
    expect(validateCredentials("cambio", "novaSenhaChaveMestra2026")).toBe(true);

    // Chave incorreta é rejeitada
    const failRes = resetPasswordWithRecoveryKey(
      "cambio",
      "chave-completamente-errada",
      "qualquerSenha"
    );
    expect(failRes.success).toBe(false);
  });

  it("permite atualizar e-mail e listar sumário de usuários", () => {
    expect(updateUserEmail("cambio", "novo.email@loja.com")).toBe(true);
    const users = listUsersSummary();
    const cambioUser = users.find((u) => u.username === "cambio");
    expect(cambioUser?.email).toBe("novo.email@loja.com");
    expect(cambioUser?.role).toBe("dolar_operator");
  });
});
