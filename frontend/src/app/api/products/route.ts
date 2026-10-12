import { NextRequest, NextResponse } from "next/server";
import { getProductsCatalog } from "@/lib/productsService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  const { snapshot, source, cachedAt } = await getProductsCatalog(forceRefresh);

  const response = NextResponse.json(snapshot);

  // Headers de Cache HTTP profissional para browsers e proxies Railway / Cloudflare
  response.headers.set(
    "Cache-Control",
    "public, max-age=60, s-maxage=1800, stale-while-revalidate=86400"
  );
  response.headers.set("X-Catalogue-Source", source);
  response.headers.set("X-Catalogue-Count", snapshot.count.toString());
  response.headers.set("X-Catalogue-Cached-At", new Date(cachedAt).toISOString());

  return response;
}
