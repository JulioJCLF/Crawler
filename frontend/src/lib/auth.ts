import crypto from "crypto";
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const AUTH_FILE = path.join(DATA_DIR, "auth-config.json");
const AUTH_SECRET = process.env.AUTH_SECRET || "arsenal-crawler-secret-auth-key-2026";
export const SESSION_COOKIE_NAME = "arsenal_session";

interface AuthFileConfig {
  username: string;
  passwordHash: string;
  salt: string;
  updatedAt: string;
}

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      // Ignore
    }
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha256").toString("hex");
}

function getStoredAuthConfig(): AuthFileConfig | null {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const content = fs.readFileSync(AUTH_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("[auth] Falha ao ler arquivo de auth:", err);
  }
  return null;
}

export function validateCredentials(usernameInput: string, passwordInput: string): boolean {
  if (!usernameInput || !passwordInput) return false;

  const stored = getStoredAuthConfig();

  if (stored) {
    if (stored.username.toLowerCase() !== usernameInput.trim().toLowerCase()) {
      return false;
    }
    const hash = hashPassword(passwordInput, stored.salt);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(stored.passwordHash));
  }

  // Fallback para credenciais padrão / variáveis de ambiente
  const defaultUser = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const defaultPass = process.env.ADMIN_PASSWORD || "arsenal@admin2026";

  const isUserMatch = usernameInput.trim().toLowerCase() === defaultUser;
  const isPassMatch = passwordInput === defaultPass;

  return isUserMatch && isPassMatch;
}

export function changeAdminPassword(newPassword: string, username: string = "admin"): boolean {
  if (!newPassword || newPassword.length < 4) return false;

  try {
    ensureDirectoryExists(DATA_DIR);
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(newPassword, salt);

    const config: AuthFileConfig = {
      username: username.trim().toLowerCase(),
      passwordHash,
      salt,
      updatedAt: new Date().toISOString(),
    };

    const tempFile = `${AUTH_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(config, null, 2), "utf-8");
    fs.renameSync(tempFile, AUTH_FILE);
    return true;
  } catch (err) {
    console.error("[auth] Erro ao salvar nova senha:", err);
    return false;
  }
}

export function createSessionToken(username: string, expiresInHours: number = 24): string {
  const exp = Date.now() + expiresInHours * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ username, exp })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined): { username: string } | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");

  // Comparação em tempo constante
  if (
    Buffer.byteLength(signature) !== Buffer.byteLength(expectedSignature) ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (data.exp && data.exp > Date.now() && data.username) {
      return { username: data.username };
    }
  } catch {
    return null;
  }

  return null;
}
