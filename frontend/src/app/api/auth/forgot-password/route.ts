import { NextRequest, NextResponse } from "next/server";
import { generatePasswordResetCode } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/emailService";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Informe o usuário ou e-mail cadastrado." },
        { status: 400 }
      );
    }

    const codeResult = generatePasswordResetCode(identifier.trim());

    if (!codeResult.success || !codeResult.code || !codeResult.email) {
      return NextResponse.json(
        { error: codeResult.error || "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Despacha o e-mail
    const emailResult = await sendPasswordResetEmail(
      codeResult.email,
      codeResult.username || identifier,
      codeResult.code
    );

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error:
            emailResult.error ||
            "Não foi possível enviar o e-mail de recuperação. Você pode utilizar a Chave Mestra para recuperar o acesso.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Código de verificação enviado para ${maskEmail(codeResult.email)}.`,
      emailMasked: maskEmail(codeResult.email),
      username: codeResult.username,
      simulated: emailResult.simulated || false,
    });
  } catch (err) {
    console.error("[api/auth/forgot-password] Erro interno:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor ao solicitar recuperação de senha." },
      { status: 500 }
    );
  }
}
