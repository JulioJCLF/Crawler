import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { POST as uploadRoute } from "./route";
import { GET as serveUploadRoute } from "@/app/api/uploads/[filename]/route";
import { NextRequest } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import { setDataDirForTesting } from "@/lib/catalogService";

const TEST_DATA_DIR = path.join(
  os.tmpdir(),
  `crawler-upload-test-${process.pid}-${Date.now()}`
);

// Mock de autenticação
vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "admin_session",
  verifySessionToken: vi.fn((token) => {
    if (token === "valid-admin-token") {
      return { username: "admin", role: "master" };
    }
    if (token === "valid-cambio-token") {
      return { username: "cambio", role: "dolar_operator" };
    }
    return null;
  }),
}));

describe("Upload de Foto de Produto e Servidor de Arquivos", () => {
  beforeEach(() => {
    setDataDirForTesting(TEST_DATA_DIR);
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    setDataDirForTesting(null);
    try {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("rejeita upload de usuário não autenticado com 401", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["fake-image-content"], { type: "image/png" }), "test.png");

    const req = new NextRequest("http://localhost:3000/api/admin/catalog/upload", {
      method: "POST",
      body: formData,
    });

    const res = await uploadRoute(req);
    expect(res.status).toBe(401);
  });

  it("rejeita upload de usuário não-master com 403", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["fake-image-content"], { type: "image/png" }), "test.png");

    const req = new NextRequest("http://localhost:3000/api/admin/catalog/upload", {
      method: "POST",
      headers: {
        cookie: "admin_session=valid-cambio-token",
      },
      body: formData,
    });

    const res = await uploadRoute(req);
    expect(res.status).toBe(403);
  });

  it("rejeita tipo de arquivo não suportado", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "text/plain" }), "test.txt");

    const req = new NextRequest("http://localhost:3000/api/admin/catalog/upload", {
      method: "POST",
      headers: {
        cookie: "admin_session=valid-admin-token",
      },
    });
    req.formData = async () => formData;

    const res = await uploadRoute(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Formato de imagem não suportado");
  });

  it("faz upload de imagem válida e permite recuperá-la via GET /api/uploads/[filename]", async () => {
    const fileBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // Assinatura de PNG
    const blob = new Blob([fileBytes], { type: "image/png" }) as any;
    blob.arrayBuffer = async () => fileBytes.buffer;
    blob.name = "minha-foto.png";

    const formData = new FormData();
    formData.append("file", blob, "minha-foto.png");

    const req = new NextRequest("http://localhost:3000/api/admin/catalog/upload", {
      method: "POST",
      headers: {
        cookie: "admin_session=valid-admin-token",
      },
    });
    req.formData = async () => formData;

    const res = await uploadRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.url).toMatch(/^\/api\/uploads\/produto-.*\.png$/);
    expect(data.filename).toBeDefined();

    // Testa a rota de servir a imagem
    const serveReq = new NextRequest(`http://localhost:3000${data.url}`);
    const serveRes = await serveUploadRoute(serveReq, {
      params: Promise.resolve({ filename: data.filename }),
    });

    expect(serveRes.status).toBe(200);
    expect(serveRes.headers.get("content-type")).toBe("image/png");
    expect(serveRes.headers.get("cache-control")).toContain("public");
  });
});
