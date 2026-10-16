import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Informe usuário e senha." },
        { status: 400 }
      );
    }

    const authResult = authenticateUser(username, password);

    if (!authResult) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 }
      );
    }

    const token = createSessionToken(authResult.username, 24, authResult.role);
    const response = NextResponse.json({
      success: true,
      message: "Login realizado com sucesso.",
      user: {
        username: authResult.username,
        email: authResult.email,
        role: authResult.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return response;
  } catch (err) {
    console.error("[api/auth/login] Erro interno:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar login." },
      { status: 500 }
    );
  }
}
