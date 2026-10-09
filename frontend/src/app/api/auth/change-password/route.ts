import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, changeAdminPassword, validateCredentials, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Informe a senha atual e a nova senha." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const isCurrentValid = validateCredentials(user.username, currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Senha atual incorreta." },
        { status: 400 }
      );
    }

    const changed = changeAdminPassword(newPassword, user.username);
    if (!changed) {
      return NextResponse.json(
        { error: "Falha ao gravar nova senha." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso.",
    });
  } catch (err) {
    console.error("[api/auth/change-password] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno ao alterar senha." },
      { status: 500 }
    );
  }
}
