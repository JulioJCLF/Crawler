import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getUploadsDir } from "@/lib/catalogService";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = verifySessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  if (user.role !== "master") {
    return NextResponse.json(
      { error: "Apenas Administrador Master pode fazer upload de fotos de produtos." },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato de imagem não suportado. Utilize JPG, PNG, WEBP, GIF ou AVIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "O tamanho da imagem excede o limite máximo permitido de 10MB." },
        { status: 400 }
      );
    }

    // Determina a extensão do arquivo
    let ext = "jpg";
    if (file.type === "image/png") ext = "png";
    else if (file.type === "image/webp") ext = "webp";
    else if (file.type === "image/gif") ext = "gif";
    else if (file.type === "image/avif") ext = "avif";
    else if (file.name) {
      const parts = file.name.split(".");
      if (parts.length > 1) {
        const potential = parts.pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (potential && ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(potential)) {
          ext = potential === "jpeg" ? "jpg" : potential;
        }
      }
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filename = `produto-${uniqueId}.${ext}`;

    const uploadsDir = getUploadsDir();
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let buffer: Buffer;
    if (typeof file.arrayBuffer === "function") {
      buffer = Buffer.from(await file.arrayBuffer());
    } else if ((file as any)._buffer && Buffer.isBuffer((file as any)._buffer)) {
      buffer = (file as any)._buffer;
    } else if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (typeof (file as any).text === "function") {
      buffer = Buffer.from(await (file as any).text());
    } else {
      buffer = Buffer.from("");
    }
    const targetPath = path.join(uploadsDir, filename);
    fs.writeFileSync(targetPath, buffer);

    // Também espelha em public/uploads se a pasta existir ou puder ser criada
    try {
      const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicUploadsDir, filename), buffer);
    } catch {
      // Ignora falha de espelhamento em sistemas somente leitura
    }

    const publicUrl = `/api/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (err: any) {
    console.error("[api/admin/catalog/upload] Erro ao processar upload:", err);
    return NextResponse.json({ error: "Erro ao realizar upload da imagem." }, { status: 500 });
  }
}
