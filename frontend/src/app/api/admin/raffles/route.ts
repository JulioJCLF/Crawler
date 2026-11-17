import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import {
  getRaffles,
  getRaffleQuotas,
  calculateRaffleStats,
  createRaffle,
} from "@/lib/raffleService";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  if (user.role !== "master") {
    return NextResponse.json(
      { error: "Apenas Administrador Master pode gerenciar rifas." },
      { status: 403 }
    );
  }

  try {
    const raffles = getRaffles();
    const enriched = raffles.map((r) => {
      const quotas = getRaffleQuotas(r.id);
      const stats = calculateRaffleStats(r, quotas);
      return {
        ...r,
        stats,
      };
    });

    return NextResponse.json({ raffles: enriched });
  } catch (err: any) {
    console.error("[api/admin/raffles GET] Erro:", err);
    return NextResponse.json({ error: "Erro ao listar rifas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  if (user.role !== "master") {
    return NextResponse.json(
      { error: "Apenas Administrador Master pode criar rifas." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const res = createRaffle(body);

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Rifa criada com sucesso!",
      raffle: res.raffle,
    });
  } catch (err: any) {
    console.error("[api/admin/raffles POST] Erro:", err);
    return NextResponse.json({ error: "Erro ao criar rifa." }, { status: 500 });
  }
}
