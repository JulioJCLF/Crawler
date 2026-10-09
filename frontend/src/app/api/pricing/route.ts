import { NextRequest, NextResponse } from "next/server";
import { getPricingConfig, updatePricingConfig } from "@/lib/pricingService";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const config = getPricingConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json(
      { error: "Acesso não autorizado. Faça login para alterar a precificação." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result = updatePricingConfig(body, user.username);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Dados de precificação inválidos." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Configuração de precificação atualizada com sucesso.",
      config: result.config,
    });
  } catch (err) {
    console.error("[api/pricing] Erro ao processar requisição:", err);
    return NextResponse.json(
      { error: "Erro ao processar dados de precificação." },
      { status: 500 }
    );
  }
}
