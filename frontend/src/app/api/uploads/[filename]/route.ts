import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getUploadsDir } from "@/lib/catalogService";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  if (!filename) {
    return NextResponse.json({ error: "Nome de arquivo obrigatório." }, { status: 400 });
  }

  // Sanitiza nome contra directory traversal
  const safeFilename = path.basename(filename);

  // Procura em getUploadsDir() e em public/uploads
  const primaryPath = path.join(getUploadsDir(), safeFilename);
  const fallbackPath = path.join(process.cwd(), "public", "uploads", safeFilename);

  let finalPath = "";
  if (fs.existsSync(primaryPath)) {
    finalPath = primaryPath;
  } else if (fs.existsSync(fallbackPath)) {
    finalPath = fallbackPath;
  } else {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ finalPath);
    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[api/uploads] Erro ao servir arquivo:", err);
    return NextResponse.json({ error: "Erro ao ler imagem." }, { status: 500 });
  }
}
