import { NextRequest, NextResponse } from "next/server";
import {
  verifyAndResetPasswordWithCode,
  resetPasswordWithRecoveryKey,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, code, newPassword, recoveryKey, restoreDefault } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: "Informe o usuário ou e-mail." },
        { status: 400 }
      );
    }

    // Modalidade 1: Recuperação com Chave Mestra de Emergência
    if (recoveryKey) {
      const result = resetPasswordWithRecoveryKey(
        identifier,
        recoveryKey,
        newPassword,
        restoreDefault
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Falha ao redefinir com Chave Mestra." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: restoreDefault
          ? `Senha do usuário '${result.username}' restaurada para o padrão de fábrica!`
          : `Senha do usuário '${result.username}' alterada com sucesso via Chave Mestra!`,
      });
    }

    // Modalidade 2: Recuperação com Código de 6 Dígitos via E-mail
    if (!code || !newPassword) {
      return NextResponse.json(
        { error: "Informe o código de 6 dígitos recebido por e-mail e a nova senha." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const resetResult = verifyAndResetPasswordWithCode(identifier, code, newPassword);

    if (!resetResult.success) {
      return NextResponse.json(
        { error: resetResult.error || "Falha ao validar código de recuperação." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso! Você já pode entrar com a nova senha.",
    });
  } catch (err) {
    console.error("[api/auth/reset-password] Erro interno:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar redefinição de senha." },
      { status: 500 }
    );
  }
}
