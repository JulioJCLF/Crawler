import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import {
  getRaffleById,
  getRaffleQuotas,
  calculateRaffleStats,
  updateRaffle,
  deleteRaffle,
} from "@/lib/raffleService";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user || user.role !== "master") {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const raffle = getRaffleById(id);
  if (!raffle) {
    return NextResponse.json({ error: "Rifa não encontrada." }, { status: 404 });
  }

  // Admin recebe cotas completas (sem máscara)
  const quotas = getRaffleQuotas(id);
  const stats = calculateRaffleStats(raffle, quotas);

  return NextResponse.json({ raffle, quotas, stats });
}

export async function PUT(
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
    const res = updateRaffle(id, body);

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Rifa atualizada com sucesso.",
      raffle: res.raffle,
    });
  } catch (err: any) {
    console.error("[api/admin/raffles/[id] PUT] Erro:", err);
    return NextResponse.json({ error: "Erro ao atualizar rifa." }, { status: 500 });
  }
}

export async function DELETE(
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
    const res = deleteRaffle(id);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Rifa e cotas excluídas com sucesso.",
    });
  } catch (err: any) {
    console.error("[api/admin/raffles/[id] DELETE] Erro:", err);
    return NextResponse.json({ error: "Erro ao excluir rifa." }, { status: 500 });
  }
}
