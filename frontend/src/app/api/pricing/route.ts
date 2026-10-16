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

    // Se o usuário for operador de dólar, restringe alteração apenas à cotação do dólar
    let payload = body;
    if (user.role === "dolar_operator") {
      if (body.exchangeRate === undefined || typeof body.exchangeRate !== "number" || body.exchangeRate <= 0) {
        return NextResponse.json(
          { error: "Operador de câmbio pode alterar apenas a cotação do dólar (valor numérico positivo)." },
          { status: 400 }
        );
      }

      const currentConfig = getPricingConfig();
      payload = {
        exchangeRate: body.exchangeRate,
        defaultMarkup: currentConfig.defaultMarkup,
        categoryMarkups: currentConfig.categoryMarkups,
      };
    }

    const result = updatePricingConfig(payload, user.username);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Dados de precificação inválidos." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        user.role === "dolar_operator"
          ? "Cotação do dólar atualizada com sucesso!"
          : "Configuração de precificação atualizada com sucesso.",
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
