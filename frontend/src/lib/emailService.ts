import nodemailer from "nodemailer";

export interface SendEmailResult {
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = process.env.SMTP_FROM || `"Hunting World" <${user || "noreply@huntingworld.com"}>`;

  return { host, port, user, pass, secure, from };
}

export function renderPasswordResetHtml(username: string, code: string, resetUrl?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - Hunting World</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f17; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #131924; border: 1px solid #1f293d; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #d97706, #f59e0b, #d97706);"></td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff;">
                Hunting World
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 11px; font-family: monospace; letter-spacing: 1.5px; text-transform: uppercase; color: #9ca3af;">
                Painel Administrativo · Recuperação de Acesso
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 1px; background-color: #1f293d;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #e5e7eb;">
                Olá, <strong>${username}</strong>!
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                Recebemos uma solicitação para redefinir a senha do seu usuário no painel de gestão da <strong>Hunting World</strong>. Utilize o código de verificação abaixo para continuar:
              </p>

              <!-- Verification Code Box -->
              <div style="background-color: #0b0f17; border: 1px solid #2d3748; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 11px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; display: block; margin-bottom: 8px;">
                  Seu Código de 6 Dígitos
                </span>
                <span style="font-size: 36px; font-weight: 800; font-family: monospace; letter-spacing: 10px; color: #f59e0b; display: inline-block;">
                  ${code}
                </span>
              </div>

              <p style="margin: 16px 0 0 0; font-size: 12px; color: #ef4444; line-height: 1.5;">
                ⏱ <strong>Atenção:</strong> Este código é válido por <strong>15 minutos</strong>. Se expirar, solicite um novo na tela de login.
              </p>
              
              ${
                resetUrl
                  ? `
              <div style="margin-top: 24px; text-align: center;">
                <a href="${resetUrl}" style="background-color: #d97706; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; display: inline-block;">
                  Redefinir Senha Diretamente
                </a>
              </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 30px 32px; background-color: #0e131d; border-top: 1px solid #1f293d; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                Se você não solicitou a redefinição de senha, ignore este e-mail. Nenhuma alteração foi realizada.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 10px; font-family: monospace; color: #4b5563;">
                Hunting World &copy; 2026 · Sistema Automatizado de Segurança
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendPasswordResetEmail(
  toEmail: string,
  username: string,
  code: string,
  resetUrl?: string
): Promise<SendEmailResult> {
  const htmlContent = renderPasswordResetHtml(username, code, resetUrl);
  const { host, port, user, pass, secure, from } = getSmtpConfig();

  if (!isSmtpConfigured()) {
    console.warn(
      `[emailService] SMTP não configurado. Código gerado para usuário "${username}" (${toEmail}): [${code}]`
    );

    // Em testes ou desenvolvimento, permitimos a simulação com sucesso
    if (process.env.NODE_ENV !== "production" || process.env.VITEST) {
      return {
        success: true,
        simulated: true,
      };
    }

    return {
      success: false,
      error:
        "Serviço de e-mail (SMTP) não configurado no servidor. Configure as variáveis SMTP_* no Railway ou utilize a Chave Mestra.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: `Código de Recuperação: ${code} - Hunting World Admin`,
      text: `Olá ${username}, seu código de recuperação de senha da Hunting World é: ${code}. Válido por 15 minutos.`,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error("[emailService] Falha ao enviar e-mail via SMTP:", err);
    return {
      success: false,
      error: err.message || "Erro desconhecido ao enviar e-mail via SMTP.",
    };
  }
}
