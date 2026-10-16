import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  changePassword,
  validateCredentials,
  adminResetUserPassword,
  updateUserEmail,
  listUsersSummary,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(sessionToken);

  if (!session) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  // Apenas Admin Master pode listar resumo de usuários
  if (session.role !== "master") {
    return NextResponse.json(
      { error: "Apenas Administrador Master pode visualizar gestão de usuários." },
      { status: 403 }
    );
  }

  const users = listUsersSummary();
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(sessionToken);

  if (!session) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { action, currentPassword, newPassword, targetUsername, newEmail } = body;

    // Ação 1: Atualização de e-mail por Admin Master
    if (action === "update_email") {
      if (session.role !== "master") {
        return NextResponse.json(
          { error: "Apenas Administrador Master pode alterar e-mails cadastrados." },
          { status: 403 }
        );
      }

      if (!targetUsername || !newEmail || !newEmail.includes("@")) {
        return NextResponse.json(
          { error: "Informe um usuário e um e-mail válido." },
          { status: 400 }
        );
      }

      const ok = updateUserEmail(targetUsername, newEmail);
      if (!ok) {
        return NextResponse.json(
          { error: "Falha ao atualizar e-mail." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `E-mail do usuário '${targetUsername}' atualizado com sucesso.`,
      });
    }

    // Ação 2: Redefinição de senha de outro usuário por Admin Master
    if (targetUsername && targetUsername.toLowerCase() !== session.username.toLowerCase()) {
      if (session.role !== "master") {
        return NextResponse.json(
          { error: "Apenas Administrador Master pode redefinir senhas de outros usuários." },
          { status: 403 }
        );
      }

      const result = adminResetUserPassword(session.username, targetUsername, newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Senha do usuário '${targetUsername}' redefinida com sucesso pelo Master.`,
      });
    }

    // Ação 3: Troca da própria senha
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

    const isCurrentValid = validateCredentials(session.username, currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Senha atual incorreta." },
        { status: 400 }
      );
    }

    const changed = changePassword(session.username, newPassword);
    if (!changed) {
      return NextResponse.json(
        { error: "Falha ao gravar nova senha." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sua senha foi alterada com sucesso.",
    });
  } catch (err) {
    console.error("[api/auth/change-password] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar alteração de senha." },
      { status: 500 }
    );
  }
}
