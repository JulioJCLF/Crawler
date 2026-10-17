import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { clearProductsCache } from "@/lib/productsService";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  if (user.role !== "master") {
    return NextResponse.json(
      { error: "Apenas Administrador Master pode resetar o cache do catálogo." },
      { status: 403 }
    );
  }

  try {
    const freshSnapshot = await clearProductsCache();

    return NextResponse.json({
      success: true,
      message: "Cache do servidor resetado e dados do catálogo sincronizados com sucesso!",
      count: freshSnapshot.count,
      updatedAt: freshSnapshot.updatedAt,
    });
  } catch (err: any) {
    console.error("[api/admin/catalog/reset-cache] Erro ao resetar cache:", err);
    return NextResponse.json(
      { error: "Falha ao resetar o cache do servidor." },
      { status: 500 }
    );
  }
}
