import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getBaseProductsSnapshot, invalidateProductsMemoryCache } from "@/lib/productsService";
import {
  getAdminCatalog,
  createCustomProduct,
  AdminCatalogFilterOptions,
} from "@/lib/catalogService";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json(
      { error: "Acesso não autorizado. Faça login para gerenciar o catálogo." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const statusParam = searchParams.get("status") as any;
  const status = ["all", "active", "hidden", "manual"].includes(statusParam)
    ? statusParam
    : "all";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const limit = parseInt(searchParams.get("limit") || "30", 10) || 30;

  try {
    const { snapshot } = await getBaseProductsSnapshot();
    const result = getAdminCatalog(snapshot, {
      query,
      category,
      status,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[api/admin/catalog/products] Erro ao listar catálogo:", err);
    return NextResponse.json(
      { error: "Erro interno ao carregar catálogo." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const res = createCustomProduct(body);

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    // Invalida cache de produtos para a vitrine atualizar na hora
    invalidateProductsMemoryCache();

    return NextResponse.json({
      success: true,
      message: "Produto manual cadastrado com sucesso.",
      product: res.product,
    });
  } catch (err: any) {
    console.error("[api/admin/catalog/products] Erro ao cadastrar produto:", err);
    return NextResponse.json(
      { error: "Erro ao cadastrar produto manual." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório." }, { status: 400 });
    }

    const { updateCustomProduct } = await import("@/lib/catalogService");
    const res = updateCustomProduct(id, updates);

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    invalidateProductsMemoryCache();

    return NextResponse.json({
      success: true,
      message: "Produto atualizado com sucesso.",
      product: res.product,
    });
  } catch (err: any) {
    console.error("[api/admin/catalog/products PUT] Erro:", err);
    return NextResponse.json({ error: "Erro ao atualizar produto." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  let id = searchParams.get("id");

  if (!id) {
    try {
      const body = await req.json();
      id = body?.id;
    } catch {
      // Ignora erro de JSON
    }
  }

  if (!id) {
    return NextResponse.json({ error: "ID do produto é obrigatório." }, { status: 400 });
  }

  try {
    const { deleteCustomProduct } = await import("@/lib/catalogService");
    const res = deleteCustomProduct(id);

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    invalidateProductsMemoryCache();

    return NextResponse.json({
      success: true,
      message: "Produto manual excluído permanentemente.",
    });
  } catch (err: any) {
    console.error("[api/admin/catalog/products DELETE] Erro:", err);
    return NextResponse.json({ error: "Erro ao excluir produto." }, { status: 500 });
  }
}

