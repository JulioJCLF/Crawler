import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import {
  markQuotasAsPaid,
  releaseQuotas,
  reserveQuotas,
} from "@/lib/raffleService";

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
    const action = body?.action;
    const numbers = body?.numbers || body?.quotas;
    const customer = body?.customer;

    if (!Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json(
        { error: "Nenhum número de cota informado." },
        { status: 400 }
      );
    }

    if (action === "pay") {
      const res = markQuotasAsPaid(id, numbers);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `${numbers.length} cota(s) marcada(s) como PAGA(S)!`,
      });
    }

    if (action === "release") {
      const res = releaseQuotas(id, numbers);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `${numbers.length} cota(s) liberada(s) para disponibilidade.`,
      });
    }

    if (action === "reserve_manual") {
      if (!customer?.name || !customer?.phone) {
        return NextResponse.json(
          { error: "Nome e WhatsApp do comprador são obrigatórios." },
          { status: 400 }
        );
      }
      const res = reserveQuotas(id, numbers, customer);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `${numbers.length} cota(s) reservada(s) manualmente com sucesso.`,
      });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (err: any) {
    console.error("[api/admin/raffles/[id]/quotas] Erro:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar cotas da rifa." },
      { status: 500 }
    );
  }
}
