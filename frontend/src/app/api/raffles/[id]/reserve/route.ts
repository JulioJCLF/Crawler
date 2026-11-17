import { NextRequest, NextResponse } from "next/server";
import { reserveQuotas } from "@/lib/raffleService";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID da rifa é obrigatório." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const numbers = body.numbers || body.quotas;
    const customer = body.customer || {
      name: body.buyerName,
      phone: body.buyerPhone,
      sellerId: body.sellerId,
    };

    if (!Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos um número de cota." },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json(
        { error: "Nome e WhatsApp são obrigatórios para reservar cotas." },
        { status: 400 }
      );
    }

    const res = reserveQuotas(id, numbers, customer);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Cotas reservadas com sucesso! Prossiga com o pagamento no WhatsApp.",
      reservedNumbers: res.reservedNumbers,
      totalAmount: res.totalAmount,
    });
  } catch (err: any) {
    console.error("[api/raffles/reserve] Erro ao reservar cotas:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar reserva." },
      { status: 500 }
    );
  }
}
