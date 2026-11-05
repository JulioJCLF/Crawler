import { NextRequest, NextResponse } from "next/server";
import { getEnrichedProductById } from "@/lib/productDetailsService";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID do equipamento é obrigatório." }, { status: 400 });
  }

  const product = await getEnrichedProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Equipamento não encontrado." }, { status: 404 });
  }

  const response = NextResponse.json({ product });
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  return response;
}
