import { describe, it, expect } from "vitest";
import {
  validateCredentials,
  createSessionToken,
  verifySessionToken,
  changeAdminPassword,
} from "./auth";

describe("auth - Sistema de Autenticação e Sessões", () => {
  it("valida com sucesso credenciais padrão de administrador", () => {
    const isValid = validateCredentials("admin", "arsenal@admin2026");
    expect(isValid).toBe(true);
  });

  it("rejeita senha incorreta", () => {
    const isValid = validateCredentials("admin", "senha-errada-123");
    expect(isValid).toBe(false);
  });

  it("rejeita usuário inexistente", () => {
    const isValid = validateCredentials("usuario_invalido", "arsenal@admin2026");
    expect(isValid).toBe(false);
  });

  it("gera token de sessão e verifica autenticidade com HMAC", () => {
    const token = createSessionToken("admin", 2);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const session = verifySessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.username).toBe("admin");
  });

  it("rejeita token adulterado ou corrompido", () => {
    const token = createSessionToken("admin", 2);
    const tampered = token.slice(0, -4) + "XXXX";
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("rejeita token expirado", () => {
    // Cria token que expirou 2 horas atrás
    const expiredToken = createSessionToken("admin", -2);
    expect(verifySessionToken(expiredToken)).toBeNull();
  });

  it("permite alterar a senha do administrador e autenticar com a nova senha", () => {
    const newPass = "novaSenhaSegura2026";
    const changed = changeAdminPassword(newPass, "admin");
    expect(changed).toBe(true);

    // Valida com a nova senha
    expect(validateCredentials("admin", newPass)).toBe(true);

    // Senha antiga deve falhar agora
    expect(validateCredentials("admin", "arsenal@admin2026")).toBe(false);

    // Restaura a senha padrão para não afetar outros testes
    changeAdminPassword("arsenal@admin2026", "admin");
  });
});
