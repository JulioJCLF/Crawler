import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Informe usuário e senha." },
        { status: 400 }
      );
    }

    const isValid = validateCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 }
      );
    }

    const token = createSessionToken(username.trim().toLowerCase());
    const response = NextResponse.json({
      success: true,
      message: "Login realizado com sucesso.",
      user: { username: username.trim().toLowerCase() },
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
