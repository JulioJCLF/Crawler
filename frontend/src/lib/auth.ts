import crypto from "crypto";
import fs from "fs";
import path from "path";
import { UserRole, AuthUser } from "@/types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const AUTH_FILE = path.join(DATA_DIR, "auth-config.json");
const AUTH_SECRET = process.env.AUTH_SECRET || "arsenal-crawler-secret-auth-key-2026";
export const SESSION_COOKIE_NAME = "arsenal_session";

// Chave mestra de recuperação de emergência (Web)
export const DEFAULT_RECOVERY_KEY =
  process.env.ADMIN_RECOVERY_KEY ||
  process.env.ADMIN_RESET_SECRET ||
  "arsenal-reset-2026";

export interface StoredUser {
  username: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  salt: string;
  updatedAt: string;
}

export interface MultiUserAuthConfig {
  version: 2;
  users: Record<string, StoredUser>;
  updatedAt: string;
}

interface ActiveResetCode {
  code: string;
  username: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

// Armazenamento em memória de códigos de reset temporários (15 minutos)
const activeResetCodes = new Map<string, ActiveResetCode>();

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      // Ignore
    }
  }
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha256").toString("hex");
}

export function getDefaultUsers(): Record<string, StoredUser> {
  const adminUser = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || "arsenal@admin2026";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@huntworld.com.br").trim().toLowerCase();

  const cambioUser = (process.env.CAMBIO_USERNAME || "cambio").trim().toLowerCase();
  const cambioPass = process.env.CAMBIO_PASSWORD || "arsenal@dolar2026";
  const cambioEmail = (process.env.CAMBIO_EMAIL || "cambio@huntworld.com.br").trim().toLowerCase();

  const adminSalt = crypto.randomBytes(16).toString("hex");
  const cambioSalt = crypto.randomBytes(16).toString("hex");
  const now = new Date().toISOString();

  return {
    [adminUser]: {
      username: adminUser,
      email: adminEmail,
      role: "master",
      passwordHash: hashPassword(adminPass, adminSalt),
      salt: adminSalt,
      updatedAt: now,
    },
    [cambioUser]: {
      username: cambioUser,
      email: cambioEmail,
      role: "dolar_operator",
      passwordHash: hashPassword(cambioPass, cambioSalt),
      salt: cambioSalt,
      updatedAt: now,
    },
  };
}

export function getStoredAuthConfig(): MultiUserAuthConfig {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const content = fs.readFileSync(AUTH_FILE, "utf-8");
      const parsed = JSON.parse(content);

      // Versão 2 já formatada
      if (parsed.version === 2 && parsed.users && typeof parsed.users === "object") {
        // Garantir que os dois usuários base existam
        const defaults = getDefaultUsers();
        let changed = false;

        for (const [key, defaultUser] of Object.entries(defaults)) {
          if (!parsed.users[key]) {
            parsed.users[key] = defaultUser;
            changed = true;
          }
        }

        if (changed) {
          saveAuthConfig(parsed);
        }

        return parsed;
      }

      // Migração da Versão 1 legada (usuário único)
      if (parsed.username && parsed.passwordHash && parsed.salt) {
        const legacyUser = parsed.username.trim().toLowerCase();
        const defaults = getDefaultUsers();

        const migratedUsers: Record<string, StoredUser> = {
          ...defaults,
          [legacyUser]: {
            username: legacyUser,
            email: process.env.ADMIN_EMAIL || "admin@huntworld.com.br",
            role: "master",
            passwordHash: parsed.passwordHash,
            salt: parsed.salt,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          },
        };

        const migratedConfig: MultiUserAuthConfig = {
          version: 2,
          users: migratedUsers,
          updatedAt: new Date().toISOString(),
        };

        saveAuthConfig(migratedConfig);
        return migratedConfig;
      }
    }
  } catch (err) {
    console.warn("[auth] Falha ao ler auth-config.json, gerando padrões:", err);
  }

  // Se não existir arquivo ainda, cria com usuários padrão
  const defaultConfig: MultiUserAuthConfig = {
    version: 2,
    users: getDefaultUsers(),
    updatedAt: new Date().toISOString(),
  };

  saveAuthConfig(defaultConfig);
  return defaultConfig;
}

export function saveAuthConfig(config: MultiUserAuthConfig): boolean {
  try {
    ensureDirectoryExists(DATA_DIR);
    config.updatedAt = new Date().toISOString();
    const tempFile = `${AUTH_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 6)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(config, null, 2), "utf-8");
    fs.renameSync(tempFile, AUTH_FILE);
    return true;
  } catch (err) {
    console.error("[auth] Erro ao salvar arquivo de auth:", err);
    return false;
  }
}

/**
 * Busca usuário por username ou e-mail
 */
export function findUserByIdentifier(identifier: string): StoredUser | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const config = getStoredAuthConfig();

  if (config.users[clean]) {
    return config.users[clean];
  }

  for (const user of Object.values(config.users)) {
    if (user.email.toLowerCase() === clean) {
      return user;
    }
  }

  return null;
}

/**
 * Autentica usuário com username e senha
 */
export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): { username: string; email: string; role: UserRole } | null {
  if (!usernameInput || !passwordInput) return null;

  const user = findUserByIdentifier(usernameInput);
  if (!user) return null;

  const hash = hashPassword(passwordInput, user.salt);
  const isValid = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.passwordHash));

  if (!isValid) return null;

  return {
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

/**
 * Função mantida para retrocompatibilidade
 */
export function validateCredentials(usernameInput: string, passwordInput: string): boolean {
  return authenticateUser(usernameInput, passwordInput) !== null;
}

/**
 * Altera senha de um usuário existente
 */
export function changePassword(username: string, newPassword: string): boolean {
  if (!username || !newPassword || newPassword.length < 4) return false;

  const config = getStoredAuthConfig();
  const user = findUserByIdentifier(username);
  if (!user) return false;

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(newPassword, salt);

  config.users[user.username] = {
    ...user,
    passwordHash,
    salt,
    updatedAt: new Date().toISOString(),
  };

  return saveAuthConfig(config);
}

/**
 * Retrocompatibilidade com changeAdminPassword antigo
 */
export function changeAdminPassword(newPassword: string, username: string = "admin"): boolean {
  return changePassword(username, newPassword);
}

/**
 * Admin Master redefine senha de outro usuário
 */
export function adminResetUserPassword(
  requesterUsername: string,
  targetUsername: string,
  newPassword: string
): { success: boolean; error?: string } {
  const requester = findUserByIdentifier(requesterUsername);
  if (!requester || requester.role !== "master") {
    return { success: false, error: "Apenas Administrador Master pode redefinir senhas de outros usuários." };
  }

  const target = findUserByIdentifier(targetUsername);
  if (!target) {
    return { success: false, error: `Usuário '${targetUsername}' não encontrado.` };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "A nova senha deve ter no mínimo 6 caracteres." };
  }

  const ok = changePassword(target.username, newPassword);
  return ok
    ? { success: true }
    : { success: false, error: "Falha ao gravar nova senha no servidor." };
}

/**
 * Atualiza o e-mail cadastrado de um usuário
 */
export function updateUserEmail(username: string, newEmail: string): boolean {
  if (!username || !newEmail || !newEmail.includes("@")) return false;

  const config = getStoredAuthConfig();
  const user = findUserByIdentifier(username);
  if (!user) return false;

  config.users[user.username] = {
    ...user,
    email: newEmail.trim().toLowerCase(),
    updatedAt: new Date().toISOString(),
  };

  return saveAuthConfig(config);
}

/**
 * Lista sumária dos usuários cadastrados (sem expor hash/salt)
 */
export function listUsersSummary(): AuthUser[] {
  const config = getStoredAuthConfig();
  return Object.values(config.users).map((u) => ({
    username: u.username,
    email: u.email,
    role: u.role,
    updatedAt: u.updatedAt,
  }));
}

/**
 * Gera código de 6 dígitos para recuperação por e-mail (15 minutos)
 */
export function generatePasswordResetCode(identifier: string): {
  success: boolean;
  code?: string;
  email?: string;
  username?: string;
  error?: string;
} {
  const user = findUserByIdentifier(identifier);
  if (!user) {
    return {
      success: false,
      error: "Usuário ou e-mail não encontrado no sistema.",
    };
  }

  // Gera código aleatório numérico de 6 dígitos (100000 a 999999)
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

  // Salva no registro de códigos ativos
  activeResetCodes.set(user.username.toLowerCase(), {
    code,
    username: user.username,
    email: user.email,
    expiresAt,
    attempts: 0,
  });

  return {
    success: true,
    code,
    email: user.email,
    username: user.username,
  };
}

/**
 * Valida o código de 6 dígitos e redefine a senha
 */
export function verifyAndResetPasswordWithCode(
  identifier: string,
  code: string,
  newPassword: string
): { success: boolean; error?: string } {
  const user = findUserByIdentifier(identifier);
  if (!user) {
    return { success: false, error: "Usuário não encontrado." };
  }

  const cleanUsername = user.username.toLowerCase();
  const activeReset = activeResetCodes.get(cleanUsername);

  if (!activeReset) {
    return {
      success: false,
      error: "Nenhum código de recuperação ativo. Solicite um novo código.",
    };
  }

  if (Date.now() > activeReset.expiresAt) {
    activeResetCodes.delete(cleanUsername);
    return {
      success: false,
      error: "O código de recuperação expirou (limite de 15 minutos). Solicite um novo.",
    };
  }

  activeReset.attempts += 1;
  if (activeReset.attempts > 5) {
    activeResetCodes.delete(cleanUsername);
    return {
      success: false,
      error: "Limite de tentativas excedido. Solicite um novo código.",
    };
  }

  // Validação segura de tempo constante do código
  const cleanCode = (code || "").trim();
  const isCodeMatch =
    cleanCode.length === 6 &&
    crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(activeReset.code));

  if (!isCodeMatch) {
    return { success: false, error: "Código de verificação incorreto." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  const changed = changePassword(user.username, newPassword);
  if (changed) {
    activeResetCodes.delete(cleanUsername);
    return { success: true };
  }

  return { success: false, error: "Falha ao gravar nova senha no servidor." };
}

/**
 * Redefine senha usando a Chave Mestra de Emergência
 */
export function resetPasswordWithRecoveryKey(
  identifier: string,
  recoveryKeyInput: string,
  newPassword?: string,
  restoreDefault: boolean = false
): { success: boolean; error?: string; username?: string } {
  if (!recoveryKeyInput) {
    return { success: false, error: "Informe a Chave Mestra de Recuperação." };
  }

  const expectedKey = DEFAULT_RECOVERY_KEY;
  const isKeyValid =
    recoveryKeyInput.length === expectedKey.length &&
    crypto.timingSafeEqual(Buffer.from(recoveryKeyInput), Buffer.from(expectedKey));

  if (!isKeyValid) {
    return { success: false, error: "Chave Mestra de Recuperação inválida." };
  }

  const user = findUserByIdentifier(identifier);
  if (!user) {
    return { success: false, error: `Usuário '${identifier}' não encontrado.` };
  }

  let finalPassword = newPassword;

  if (restoreDefault || !finalPassword) {
    finalPassword = user.role === "master" ? "arsenal@admin2026" : "arsenal@dolar2026";
  }

  if (finalPassword.length < 6) {
    return { success: false, error: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  const changed = changePassword(user.username, finalPassword);
  if (changed) {
    // Invalida eventuais códigos pendentes
    activeResetCodes.delete(user.username.toLowerCase());
    return { success: true, username: user.username };
  }

  return { success: false, error: "Falha ao atualizar senha." };
}

/**
 * Restaura todas as credenciais de fábrica
 */
export function resetAllToFactoryDefaults(): boolean {
  const defaultConfig: MultiUserAuthConfig = {
    version: 2,
    users: getDefaultUsers(),
    updatedAt: new Date().toISOString(),
  };
  activeResetCodes.clear();
  return saveAuthConfig(defaultConfig);
}

/**
 * Cria token de sessão HMAC incluindo role
 */
export function createSessionToken(
  username: string,
  expiresInHours: number = 24,
  role?: UserRole
): string {
  const user = findUserByIdentifier(username);
  const userRole = role || user?.role || (username.toLowerCase() === "admin" ? "master" : "dolar_operator");
  const exp = Date.now() + expiresInHours * 60 * 60 * 1000;

  const payload = Buffer.from(
    JSON.stringify({
      username: username.trim().toLowerCase(),
      role: userRole,
      exp,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Verifica token de sessão HMAC e retorna dados do usuário
 */
export function verifySessionToken(
  token: string | null | undefined
): { username: string; role: UserRole } | null {
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
      const role: UserRole = data.role === "dolar_operator" ? "dolar_operator" : "master";
      return { username: data.username, role };
    }
  } catch {
    return null;
  }

  return null;
}
