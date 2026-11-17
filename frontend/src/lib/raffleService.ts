import fs from "fs";
import path from "path";
import {
  Raffle,
  QuotaEntry,
  CreateRaffleInput,
  FederalDrawResult,
  RaffleStats,
} from "@/types";
import { getDataDir } from "./catalogService";

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      // Ignora erro se já existir ou sistema somente leitura
    }
  }
}

function saveAtomic(filePath: string, data: any): void {
  ensureDirectoryExists(path.dirname(filePath));
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}

function getRafflesFile(): string {
  return path.join(getDataDir(), "raffles.json");
}

function getQuotasFile(raffleId: string): string {
  const safeId = raffleId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(getDataDir(), `raffle-quotas-${safeId}.json`);
}

// Caches em memória
let inMemoryRaffles: Raffle[] | null = null;
const inMemoryQuotas: Map<string, QuotaEntry[]> = new Map();

/**
 * Lê todas as rifas cadastradas.
 */
export function getRaffles(): Raffle[] {
  if (inMemoryRaffles) return inMemoryRaffles;

  try {
    ensureDirectoryExists(getDataDir());
    const file = getRafflesFile();
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        inMemoryRaffles = parsed;
        return inMemoryRaffles!;
      }
    }
  } catch (err) {
    console.warn("[raffleService] Erro ao carregar raffles.json:", err);
  }

  inMemoryRaffles = [];
  return inMemoryRaffles;
}

/**
 * Salva a lista de rifas.
 */
export function saveRaffles(raffles: Raffle[]): void {
  inMemoryRaffles = raffles;
  try {
    saveAtomic(getRafflesFile(), raffles);
  } catch (err) {
    console.error("[raffleService] Falha ao persistir raffles.json:", err);
  }
}

/**
 * Retorna uma rifa por ID.
 */
export function getRaffleById(id: string): Raffle | null {
  const list = getRaffles();
  return list.find((r) => r.id === id) || null;
}

/**
 * Lê as cotas de uma rifa específica.
 */
export function getRaffleQuotas(raffleId: string): QuotaEntry[] {
  if (inMemoryQuotas.has(raffleId)) {
    return inMemoryQuotas.get(raffleId)!;
  }

  try {
    ensureDirectoryExists(getDataDir());
    const file = getQuotasFile(raffleId);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        inMemoryQuotas.set(raffleId, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[raffleService] Erro ao carregar cotas da rifa ${raffleId}:`, err);
  }

  // Se não existir arquivo ainda, tenta gerar a partir da definição da rifa
  const raffle = getRaffleById(raffleId);
  if (raffle) {
    const generated = generateInitialQuotas(raffle.totalQuotas);
    saveRaffleQuotas(raffleId, generated);
    return generated;
  }

  return [];
}

/**
 * Salva a lista de cotas de uma rifa.
 */
export function saveRaffleQuotas(raffleId: string, quotas: QuotaEntry[]): void {
  inMemoryQuotas.set(raffleId, quotas);
  try {
    saveAtomic(getQuotasFile(raffleId), quotas);
  } catch (err) {
    console.error(`[raffleService] Falha ao persistir cotas da rifa ${raffleId}:`, err);
  }
}

/**
 * Gera cotas sequenciais com zeros à esquerda:
 * - 100 cotas: "01" a "100"
 * - 1000 cotas: "001" a "1000"
 */
export function generateInitialQuotas(total: 100 | 1000): QuotaEntry[] {
  const padLength = total === 100 ? 2 : 3;
  const quotas: QuotaEntry[] = [];
  for (let i = 1; i <= total; i++) {
    const numberStr = i === total ? String(total) : String(i).padStart(padLength, "0");
    quotas.push({
      number: numberStr,
      status: "available",
    });
  }
  return quotas;
}

/**
 * Calcula estatísticas de progresso e receita de uma rifa.
 */
export function calculateRaffleStats(raffle: Raffle, quotas: QuotaEntry[]): RaffleStats {
  const totalQuotas = raffle.totalQuotas;
  let paidCount = 0;
  let reservedCount = 0;

  for (const q of quotas) {
    if (q.status === "paid") paidCount++;
    else if (q.status === "reserved") reservedCount++;
  }

  const availableCount = Math.max(0, totalQuotas - (paidCount + reservedCount));
  const percentPaid = totalQuotas > 0 ? Math.round((paidCount / totalQuotas) * 100) : 0;
  const totalRevenue = paidCount * raffle.pricePerQuota;

  return {
    totalQuotas,
    paidCount,
    reservedCount,
    availableCount,
    percentPaid,
    totalRevenue,
  };
}

/**
 * Cria uma nova rifa e inicializa suas cotas.
 */
export function createRaffle(input: CreateRaffleInput): {
  success: boolean;
  raffle?: Raffle;
  error?: string;
} {
  if (!input.title || !input.title.trim()) {
    return { success: false, error: "O título da rifa é obrigatório." };
  }

  if (typeof input.pricePerQuota !== "number" || input.pricePerQuota <= 0) {
    return { success: false, error: "Informe um valor de cota válido (R$ maior que zero)." };
  }

  if (input.totalQuotas !== 100 && input.totalQuotas !== 1000) {
    return { success: false, error: "A quantidade de cotas deve ser 100 ou 1000." };
  }

  if (!input.image || !input.image.trim()) {
    return { success: false, error: "A foto principal do prêmio é obrigatória." };
  }

  const now = new Date().toISOString();
  const id = `rifa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const newRaffle: Raffle = {
    id,
    title: input.title.trim(),
    description: input.description ? input.description.trim() : undefined,
    image: input.image.trim(),
    images: input.images && input.images.length > 0 ? input.images : [input.image.trim()],
    pricePerQuota: Number(input.pricePerQuota),
    totalQuotas: input.totalQuotas,
    status: "active",
    drawDate: input.drawDate ? input.drawDate.trim() : undefined,
    federalLotteryContest: input.federalLotteryContest ? input.federalLotteryContest.trim() : undefined,
    createdAt: now,
    updatedAt: now,
  };

  // Inicializa as cotas
  const quotas = generateInitialQuotas(newRaffle.totalQuotas);
  saveRaffleQuotas(id, quotas);

  // Adiciona a rifa
  const raffles = [newRaffle, ...getRaffles()];
  saveRaffles(raffles);

  return { success: true, raffle: newRaffle };
}

/**
 * Atualiza campos de uma rifa existente.
 */
export function updateRaffle(
  id: string,
  updates: Partial<Raffle>
): { success: boolean; raffle?: Raffle; error?: string } {
  if (!id) return { success: false, error: "ID da rifa é obrigatório." };

  const raffles = getRaffles();
  const index = raffles.findIndex((r) => r.id === id);

  if (index === -1) {
    return { success: false, error: "Rifa não encontrada." };
  }

  const existing = raffles[index];
  const updated: Raffle = {
    ...existing,
    ...(updates.title ? { title: updates.title.trim() } : {}),
    ...(updates.description !== undefined ? { description: updates.description ? updates.description.trim() : undefined } : {}),
    ...(updates.image ? { image: updates.image.trim() } : {}),
    ...(updates.images !== undefined ? { images: updates.images } : {}),
    ...(updates.pricePerQuota ? { pricePerQuota: Number(updates.pricePerQuota) } : {}),
    ...(updates.status ? { status: updates.status } : {}),
    ...(updates.drawDate !== undefined ? { drawDate: updates.drawDate ? updates.drawDate.trim() : undefined } : {}),
    ...(updates.federalLotteryContest !== undefined ? { federalLotteryContest: updates.federalLotteryContest ? updates.federalLotteryContest.trim() : undefined } : {}),
    updatedAt: new Date().toISOString(),
  };

  const newList = [...raffles];
  newList[index] = updated;
  saveRaffles(newList);

  return { success: true, raffle: updated };
}

/**
 * Exclui uma rifa e suas cotas do sistema.
 */
export function deleteRaffle(id: string): { success: boolean; error?: string } {
  if (!id) return { success: false, error: "ID da rifa é obrigatório." };

  const raffles = getRaffles();
  const filtered = raffles.filter((r) => r.id !== id);

  if (filtered.length === raffles.length) {
    return { success: false, error: "Rifa não encontrada para exclusão." };
  }

  saveRaffles(filtered);

  // Remove arquivo de cotas
  try {
    const file = getQuotasFile(id);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    inMemoryQuotas.delete(id);
  } catch (err) {
    console.warn(`[raffleService] Erro ao remover cotas da rifa ${id}:`, err);
  }

  return { success: true };
}

/**
 * Reserva cotas para um cliente.
 */
export function reserveQuotas(
  raffleId: string,
  numbers: string[],
  customer: {
    name: string;
    phone: string;
    sellerId?: string;
  }
): {
  success: boolean;
  reservedNumbers?: string[];
  totalAmount?: number;
  error?: string;
} {
  const raffle = getRaffleById(raffleId);
  if (!raffle) {
    return { success: false, error: "Rifa não encontrada." };
  }

  if (raffle.status !== "active") {
    return { success: false, error: "Esta rifa não está aberta para reservas no momento." };
  }

  if (!Array.isArray(numbers) || numbers.length === 0) {
    return { success: false, error: "Selecione ao menos um número de cota." };
  }

  if (!customer.name || !customer.name.trim()) {
    return { success: false, error: "Seu nome é obrigatório para a reserva." };
  }

  if (!customer.phone || !customer.phone.trim()) {
    return { success: false, error: "Seu WhatsApp é obrigatório para confirmação do bilhete." };
  }

  const quotas = getRaffleQuotas(raffleId);
  const quotaMap = new Map<string, QuotaEntry>();
  for (const q of quotas) {
    quotaMap.set(q.number, q);
  }

  // Validação: todos os números pedidos devem existir e estar disponíveis
  for (const num of numbers) {
    const entry = quotaMap.get(num);
    if (!entry) {
      return { success: false, error: `Número ${num} inválido para esta rifa.` };
    }
    if (entry.status !== "available") {
      return {
        success: false,
        error: `O número ${num} já foi ${entry.status === "paid" ? "comprado" : "reservado"} por outro participante.`,
      };
    }
  }

  // Aplica as reservas
  const now = new Date().toISOString();
  const cleanedName = customer.name.trim();
  const cleanedPhone = customer.phone.replace(/\D/g, "");

  for (const num of numbers) {
    const entry = quotaMap.get(num)!;
    entry.status = "reserved";
    entry.customerName = cleanedName;
    entry.customerPhone = cleanedPhone;
    entry.sellerId = customer.sellerId || "matheus";
    entry.reservedAt = now;
  }

  const updatedQuotas = Array.from(quotaMap.values());
  saveRaffleQuotas(raffleId, updatedQuotas);

  const totalAmount = numbers.length * raffle.pricePerQuota;

  return {
    success: true,
    reservedNumbers: numbers,
    totalAmount,
  };
}

/**
 * Marca cotas como PAGAS (confirmação pelo Administrador).
 */
export function markQuotasAsPaid(
  raffleId: string,
  numbers: string[]
): { success: boolean; error?: string } {
  const raffle = getRaffleById(raffleId);
  if (!raffle) return { success: false, error: "Rifa não encontrada." };

  const quotas = getRaffleQuotas(raffleId);
  const now = new Date().toISOString();
  let changed = false;

  for (const q of quotas) {
    if (numbers.includes(q.number)) {
      q.status = "paid";
      q.paidAt = now;
      changed = true;
    }
  }

  if (!changed) {
    return { success: false, error: "Nenhum número correspondente encontrado." };
  }

  saveRaffleQuotas(raffleId, quotas);

  // Se todas as cotas da rifa forem pagas, atualiza status para awaiting_draw
  const allPaid = quotas.every((q) => q.status === "paid");
  if (allPaid && raffle.status === "active") {
    updateRaffle(raffleId, { status: "awaiting_draw" });
  }

  return { success: true };
}

/**
 * Libera cotas reservadas de volta para 'available'.
 */
export function releaseQuotas(
  raffleId: string,
  numbers: string[]
): { success: boolean; error?: string } {
  const raffle = getRaffleById(raffleId);
  if (!raffle) return { success: false, error: "Rifa não encontrada." };

  const quotas = getRaffleQuotas(raffleId);
  let changed = false;

  for (const q of quotas) {
    if (numbers.includes(q.number)) {
      q.status = "available";
      q.customerName = undefined;
      q.customerPhone = undefined;
      q.reservedAt = undefined;
      q.paidAt = undefined;
      q.sellerId = undefined;
      changed = true;
    }
  }

  if (!changed) {
    return { success: false, error: "Nenhum número correspondente encontrado." };
  }

  saveRaffleQuotas(raffleId, quotas);
  return { success: true };
}

export interface FederalDrawInput {
  contestNumber: string;
  drawDate: string;
  firstPrize: string;
  secondPrize?: string;
  thirdPrize?: string;
  fourthPrize?: string;
  fifthPrize?: string;
}

/**
 * Extrai a cota candidata a partir do número sorteado pela Caixa:
 * - 100 cotas ("01" a "100"): pega os 2 últimos dígitos (ex: "73948" -> "48", e final "00" -> "100")
 * - 1000 cotas ("001" a "1000"): pega os 3 últimos dígitos (ex: "73948" -> "948", e final "000" -> "1000")
 */
export function extractCandidateQuota(prizeNumber: string, totalQuotas: 100 | 1000): string {
  const cleanDigits = prizeNumber.replace(/\D/g, "");
  const numDigits = totalQuotas === 100 ? 2 : 3;

  const candidate =
    cleanDigits.length < numDigits
      ? cleanDigits.padStart(numDigits, "0")
      : cleanDigits.slice(-numDigits);

  if (totalQuotas === 100 && candidate === "00") {
    return "100";
  }
  if (totalQuotas === 1000 && candidate === "000") {
    return "1000";
  }

  return candidate;
}

/**
 * Apuração oficial do sorteio com base na extração da Loteria Federal (Caixa Econômica).
 * Segue o critério padrão de suplência:
 * 1º Prêmio -> se cota não paga, 2º Prêmio -> 3º Prêmio -> 4º Prêmio -> 5º Prêmio.
 */
export function drawFederalLottery(
  raffleId: string,
  input: FederalDrawInput
): {
  success: boolean;
  result?: FederalDrawResult;
  error?: string;
} {
  const raffle = getRaffleById(raffleId);
  if (!raffle) return { success: false, error: "Rifa não encontrada." };

  if (!input.contestNumber || !input.contestNumber.trim()) {
    return { success: false, error: "Número do concurso da Loteria Federal é obrigatório." };
  }

  if (!input.firstPrize || !input.firstPrize.trim()) {
    return { success: false, error: "Número sorteado do 1º Prêmio é obrigatório." };
  }

  const quotas = getRaffleQuotas(raffleId);
  const quotaMap = new Map<string, QuotaEntry>();
  for (const q of quotas) {
    quotaMap.set(q.number, q);
  }

  // Lista ordenada de prêmios para teste de suplência
  const prizeOrder: Array<{
    origin: FederalDrawResult["prizeOrigin"];
    raw: string | undefined;
  }> = [
    { origin: "1º Prêmio", raw: input.firstPrize },
    { origin: "2º Prêmio", raw: input.secondPrize },
    { origin: "3º Prêmio", raw: input.thirdPrize },
    { origin: "4º Prêmio", raw: input.fourthPrize },
    { origin: "5º Prêmio", raw: input.fifthPrize },
  ];

  let winningEntry: QuotaEntry | null = null;
  let winningQuota = "";
  let prizeOrigin: FederalDrawResult["prizeOrigin"] = "1º Prêmio";

  for (const p of prizeOrder) {
    if (!p.raw || !p.raw.trim()) continue;
    const candidate = extractCandidateQuota(p.raw, raffle.totalQuotas);
    const entry = quotaMap.get(candidate);

    if (entry && entry.status === "paid" && entry.customerName) {
      winningEntry = entry;
      winningQuota = candidate;
      prizeOrigin = p.origin;
      break;
    }
  }

  if (!winningEntry) {
    return {
      success: false,
      error:
        "Nenhum dos prêmios informados correspondeu a uma cota PAGA. Conforme as regras da Loteria Federal, aguarde a próxima extração da Caixa.",
    };
  }

  const drawResult: FederalDrawResult = {
    contestNumber: input.contestNumber.trim(),
    drawDate: input.drawDate || new Date().toISOString().slice(0, 10),
    firstPrize: input.firstPrize.trim(),
    secondPrize: input.secondPrize ? input.secondPrize.trim() : undefined,
    thirdPrize: input.thirdPrize ? input.thirdPrize.trim() : undefined,
    fourthPrize: input.fourthPrize ? input.fourthPrize.trim() : undefined,
    fifthPrize: input.fifthPrize ? input.fifthPrize.trim() : undefined,
    winningQuota,
    prizeOrigin,
    winner: {
      name: winningEntry.customerName || "Participante",
      phone: winningEntry.customerPhone || "",
      quota: winningQuota,
    },
    drawnAt: new Date().toISOString(),
  };

  // Atualiza e finaliza a rifa
  const updatedRaffle: Raffle = {
    ...raffle,
    status: "completed",
    drawResults: drawResult,
    federalLotteryContest: input.contestNumber.trim(),
    updatedAt: new Date().toISOString(),
  };

  const raffles = getRaffles();
  const index = raffles.findIndex((r) => r.id === raffleId);
  if (index !== -1) {
    raffles[index] = updatedRaffle;
    saveRaffles(raffles);
  }

  return { success: true, result: drawResult };
}

/**
 * Limpa estado de rifas para testes.
 */
export function resetRafflesForTesting(): void {
  inMemoryRaffles = null;
  inMemoryQuotas.clear();
}
