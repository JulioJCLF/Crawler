import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { invalidateProductsMemoryCache } from "@/lib/productsService";
import { hideProduct } from "@/lib/catalogService";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { id, name, reason, source } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "O ID do produto é obrigatório." }, { status: 400 });
    }

    const res = hideProduct(id, name, reason, source);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    invalidateProductsMemoryCache();

    return NextResponse.json({
      success: true,
      message: "Produto ocultado da vitrine com sucesso.",
    });
  } catch (err: any) {
    console.error("[api/admin/catalog/hide] Erro ao ocultar produto:", err);
    return NextResponse.json({ error: "Erro ao ocultar produto." }, { status: 500 });
  }
}
