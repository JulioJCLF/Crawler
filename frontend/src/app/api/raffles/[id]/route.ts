import { NextRequest, NextResponse } from "next/server";
import { getRaffleById, getRaffleQuotas, calculateRaffleStats } from "@/lib/raffleService";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID da rifa é obrigatório." }, { status: 400 });
  }

  const raffle = getRaffleById(id);
  if (!raffle) {
    return NextResponse.json({ error: "Rifa não encontrada." }, { status: 404 });
  }

  const quotas = getRaffleQuotas(id);
  const stats = calculateRaffleStats(raffle, quotas);

  // Para privacidade na vitrine pública, mascara telefone e sobrenome dos compradores
  const publicQuotas = quotas.map((q) => {
    const rawName = q.customerName || (q as any).buyerName;
    const rawPhone = q.customerPhone || (q as any).buyerPhone;

    let maskedName: string | undefined = undefined;
    if (rawName) {
      const parts = rawName.trim().split(/\s+/);
      if (parts.length === 1) {
        maskedName = parts[0];
      } else {
        maskedName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
      }
    }

    let maskedPhone: string | undefined = undefined;
    if (rawPhone) {
      const digits = rawPhone.replace(/\D/g, "");
      if (digits.length >= 8) {
        maskedPhone = `(${digits.slice(0, 2)}) *****-${digits.slice(-4)}`;
      }
    }

    return {
      number: q.number,
      status: q.status,
      customerName: maskedName,
      customerPhone: maskedPhone,
      buyerName: maskedName,
      buyerPhone: maskedPhone,
    };
  });

  const response = NextResponse.json({
    raffle,
    quotas: publicQuotas,
    stats,
  });

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  return response;
}
