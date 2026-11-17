import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  createRaffle,
  getRaffles,
  getRaffleById,
  getRaffleQuotas,
  reserveQuotas,
  markQuotasAsPaid,
  releaseQuotas,
  drawFederalLottery,
  extractCandidateQuota,
  calculateRaffleStats,
  resetRafflesForTesting,
} from "./raffleService";
import { setDataDirForTesting } from "./catalogService";

const TEST_DATA_DIR = path.join(
  os.tmpdir(),
  `crawler-raffle-test-${process.pid}-${Date.now()}`
);

describe("raffleService - Gestão de Rifas e Sorteio via Loteria Federal", () => {
  beforeEach(() => {
    setDataDirForTesting(TEST_DATA_DIR);
    resetRafflesForTesting();
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    resetRafflesForTesting();
    setDataDirForTesting(null);
    try {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {
      // Ignora erro
    }
  });

  it("extrai corretamente a cota candidata da Loteria Federal para 100 e 1000 números", () => {
    // 100 números (01 a 100) -> 2 últimos dígitos (00 equivale a 100)
    expect(extractCandidateQuota("73948", 100)).toBe("48");
    expect(extractCandidateQuota("05", 100)).toBe("05");
    expect(extractCandidateQuota("7", 100)).toBe("07");
    expect(extractCandidateQuota("84.500", 100)).toBe("100");

    // 1000 números (001 a 1000) -> 3 últimos dígitos (000 equivale a 1000)
    expect(extractCandidateQuota("73948", 1000)).toBe("948");
    expect(extractCandidateQuota("025", 1000)).toBe("025");
    expect(extractCandidateQuota("12", 1000)).toBe("012");
    expect(extractCandidateQuota("84.000", 1000)).toBe("1000");
  });

  it("cria uma nova rifa de 100 números e inicializa as cotas de 01 a 100", () => {
    const res = createRaffle({
      title: "Rifa Especial Amoeba M4 CQB",
      description: "Rifle elétrico full metal com gatilho eletrônico EFCS.",
      image: "https://exemplo.com/m4.jpg",
      pricePerQuota: 25.0,
      totalQuotas: 100,
    });

    expect(res.success).toBe(true);
    expect(res.raffle).toBeDefined();
    expect(res.raffle?.id).toMatch(/^rifa-/);
    expect(res.raffle?.totalQuotas).toBe(100);

    const quotas = getRaffleQuotas(res.raffle!.id);
    expect(quotas.length).toBe(100);
    expect(quotas[0].number).toBe("01");
    expect(quotas[99].number).toBe("100");
    expect(quotas[0].status).toBe("available");

    const stats = calculateRaffleStats(res.raffle!, quotas);
    expect(stats.totalQuotas).toBe(100);
    expect(stats.availableCount).toBe(100);
    expect(stats.paidCount).toBe(0);
    expect(stats.percentPaid).toBe(0);
  });

  it("cria rifa de 1000 números com cotas de 001 a 1000", () => {
    const res = createRaffle({
      title: "Super Rifa Kit Completo HPA",
      image: "https://exemplo.com/hpa.jpg",
      pricePerQuota: 10.0,
      totalQuotas: 1000,
    });

    expect(res.success).toBe(true);
    const quotas = getRaffleQuotas(res.raffle!.id);
    expect(quotas.length).toBe(1000);
    expect(quotas[0].number).toBe("001");
    expect(quotas[999].number).toBe("1000");
  });

  it("permite reservar cotas e bloqueia reserva de números já ocupados", () => {
    const raffle = createRaffle({
      title: "Rifa Teste Reserva",
      image: "https://exemplo.com/foto.jpg",
      pricePerQuota: 20.0,
      totalQuotas: 100,
    }).raffle!;

    // Reserva 07 e 48 para o cliente João
    const resReserve = reserveQuotas(raffle.id, ["07", "48"], {
      name: "João Silva",
      phone: "11999998888",
      sellerId: "matheus",
    });

    expect(resReserve.success).toBe(true);
    expect(resReserve.totalAmount).toBe(40.0);

    const quotas = getRaffleQuotas(raffle.id);
    const q07 = quotas.find((q) => q.number === "07")!;
    expect(q07.status).toBe("reserved");
    expect(q07.customerName).toBe("João Silva");

    // Tentativa de reservar 07 novamente deve falhar
    const failReserve = reserveQuotas(raffle.id, ["07"], {
      name: "Outro Comprador",
      phone: "11988887777",
    });

    expect(failReserve.success).toBe(false);
    expect(failReserve.error).toContain("já foi reservado");
  });

  it("permite marcar cotas como pagas e liberar cotas", () => {
    const raffle = createRaffle({
      title: "Rifa Pagamento e Liberação",
      image: "https://exemplo.com/foto.jpg",
      pricePerQuota: 30.0,
      totalQuotas: 100,
    }).raffle!;

    reserveQuotas(raffle.id, ["12", "15"], {
      name: "Carlos",
      phone: "21999990000",
    });

    // Marca 12 como paga
    const payRes = markQuotasAsPaid(raffle.id, ["12"]);
    expect(payRes.success).toBe(true);

    let quotas = getRaffleQuotas(raffle.id);
    expect(quotas.find((q) => q.number === "12")?.status).toBe("paid");
    expect(quotas.find((q) => q.number === "15")?.status).toBe("reserved");

    // Libera 15 de volta para available
    const relRes = releaseQuotas(raffle.id, ["15"]);
    expect(relRes.success).toBe(true);

    quotas = getRaffleQuotas(raffle.id);
    const q15 = quotas.find((q) => q.number === "15")!;
    expect(q15.status).toBe("available");
    expect(q15.customerName).toBeUndefined();
  });

  it("apura vencedor pelo 1º Prêmio da Loteria Federal", () => {
    const raffle = createRaffle({
      title: "Rifa Federal 100 Cotas",
      image: "https://exemplo.com/foto.jpg",
      pricePerQuota: 50.0,
      totalQuotas: 100,
    }).raffle!;

    // Participante comprou o número 48
    reserveQuotas(raffle.id, ["48"], {
      name: "Marcos Vencedor",
      phone: "11977776666",
    });
    markQuotasAsPaid(raffle.id, ["48"]);

    // Resultado da Caixa: 1º Prêmio = 73.948 -> dezena final 48!
    const drawRes = drawFederalLottery(raffle.id, {
      contestNumber: "5912",
      drawDate: "2026-11-18",
      firstPrize: "73948",
    });

    expect(drawRes.success).toBe(true);
    expect(drawRes.result?.winningQuota).toBe("48");
    expect(drawRes.result?.prizeOrigin).toBe("1º Prêmio");
    expect(drawRes.result?.winner.name).toBe("Marcos Vencedor");
    expect(drawRes.result?.winner.phone).toBe("11977776666");

    // Verifica que a rifa foi atualizada para "completed"
    const finishedRaffle = getRaffleById(raffle.id)!;
    expect(finishedRaffle.status).toBe("completed");
    expect(finishedRaffle.drawResults?.winningQuota).toBe("48");
  });

  it("aplica regra de suplência: usa 2º Prêmio caso o 1º não tenha sido pago", () => {
    const raffle = createRaffle({
      title: "Rifa Suplência Federal",
      image: "https://exemplo.com/foto.jpg",
      pricePerQuota: 50.0,
      totalQuotas: 100,
    }).raffle!;

    // Ninguém comprou o 48 (1º prêmio).
    // Mas alguém comprou o 23 (2º prêmio)!
    reserveQuotas(raffle.id, ["23"], {
      name: "Ana Vencedora Suplente",
      phone: "21988881111",
    });
    markQuotasAsPaid(raffle.id, ["23"]);

    const drawRes = drawFederalLottery(raffle.id, {
      contestNumber: "5913",
      drawDate: "2026-11-21",
      firstPrize: "73948", // 48 não foi comprado
      secondPrize: "14823", // 23 FOI comprado!
    });

    expect(drawRes.success).toBe(true);
    expect(drawRes.result?.winningQuota).toBe("23");
    expect(drawRes.result?.prizeOrigin).toBe("2º Prêmio");
    expect(drawRes.result?.winner.name).toBe("Ana Vencedora Suplente");
  });

  it("retorna erro informativo se nenhum dos 5 prêmios foi pago", () => {
    const raffle = createRaffle({
      title: "Rifa Sem Ganhador na Rodada",
      image: "https://exemplo.com/foto.jpg",
      pricePerQuota: 50.0,
      totalQuotas: 100,
    }).raffle!;

    // Comprou apenas o 99
    reserveQuotas(raffle.id, ["99"], {
      name: "Pedro",
      phone: "11988880000",
    });
    markQuotasAsPaid(raffle.id, ["99"]);

    const drawRes = drawFederalLottery(raffle.id, {
      contestNumber: "5914",
      drawDate: "2026-11-25",
      firstPrize: "12301", // 01
      secondPrize: "12302", // 02
      thirdPrize: "12303", // 03
      fourthPrize: "12304", // 04
      fifthPrize: "12305", // 05
    });

    expect(drawRes.success).toBe(false);
    expect(drawRes.error).toContain("Nenhum dos prêmios informados correspondeu a uma cota PAGA");
  });
});
