import { NextResponse } from "next/server";
import { getRaffles, getRaffleQuotas, calculateRaffleStats } from "@/lib/raffleService";

export async function GET() {
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

    const response = NextResponse.json({ raffles: enriched });
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    return response;
  } catch (err: any) {
    console.error("[api/raffles] Erro ao listar rifas:", err);
    return NextResponse.json(
      { error: "Erro interno ao carregar rifas." },
      { status: 500 }
    );
  }
}
