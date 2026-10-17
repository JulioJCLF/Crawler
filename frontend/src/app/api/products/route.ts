import { NextRequest, NextResponse } from "next/server";
import { getProductsCatalog } from "@/lib/productsService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  const { snapshot, source, cachedAt } = await getProductsCatalog(forceRefresh);

  const response = NextResponse.json(snapshot);

  // Sem cache no cliente para que itens ocultados/adicionados reflitam imediatamente
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("X-Catalogue-Source", source);
  response.headers.set("X-Catalogue-Count", snapshot.count.toString());
  response.headers.set("X-Catalogue-Cached-At", new Date(cachedAt).toISOString());

  return response;
}
