import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { drawFederalLottery } from "@/lib/raffleService";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user || user.role !== "master") {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const res = drawFederalLottery(id, body);

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Sorteio apurado com sucesso! Vencedor da cota ${res.result?.winningQuota}: ${res.result?.winner.name}.`,
      result: res.result,
    });
  } catch (err: any) {
    console.error("[api/admin/raffles/[id]/draw] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao processar apuração da Loteria Federal." },
      { status: 500 }
    );
  }
}
