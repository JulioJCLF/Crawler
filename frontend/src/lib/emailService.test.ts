import { describe, it, expect } from "vitest";
import {
  renderPasswordResetHtml,
  sendPasswordResetEmail,
  isSmtpConfigured,
  getSmtpConfig,
} from "./emailService";

describe("emailService - Serviço de Envio de E-mails", () => {
  it("renderiza template de e-mail com código de 6 dígitos e nome do usuário", () => {
    const html = renderPasswordResetHtml("admin", "123456", "https://loja.com/reset");
    expect(html).toContain("123456");
    expect(html).toContain("admin");
    expect(html).toContain("Hunting World");
    expect(html).toContain("15 minutos");
    expect(html).toContain("https://loja.com/reset");
  });

  it("retorna configuração SMTP padrão ou de ambiente", () => {
    const config = getSmtpConfig();
    expect(config).toBeDefined();
    expect(typeof config.port).toBe("number");
  });

  it("simula envio com sucesso em ambiente de teste quando SMTP não está configurado", async () => {
    // Em ambiente de teste (VITEST=true), deve simular com sucesso
    const res = await sendPasswordResetEmail(
      "teste@huntworld.com.br",
      "admin",
      "654321"
    );
    expect(res.success).toBe(true);
    if (!isSmtpConfigured()) {
      expect(res.simulated).toBe(true);
    }
  });
});
