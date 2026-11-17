import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getPublicRaffles } from "@/app/api/raffles/route";
import { GET as getPublicRaffleById } from "@/app/api/raffles/[id]/route";
import { POST as reserveQuotasRoute } from "@/app/api/raffles/[id]/reserve/route";
import { GET as getAdminRaffles, POST as createAdminRaffle } from "@/app/api/admin/raffles/route";
import { GET as getAdminRaffleById } from "@/app/api/admin/raffles/[id]/route";
import { POST as manageAdminQuotas } from "@/app/api/admin/raffles/[id]/quotas/route";
import { POST as drawFederalLotteryRoute } from "@/app/api/admin/raffles/[id]/draw/route";
import { NextRequest } from "next/server";

// Mock de autenticação
vi.mock("@/lib/auth", () => ({
  SESSION_COOKIE_NAME: "admin_session",
  verifySessionToken: vi.fn((token) => {
    if (token === "valid-master-token") {
      return { username: "admin", role: "master" };
    }
    if (token === "valid-cambio-token") {
      return { username: "cambio", role: "dolar_operator" };
    }
    return null;
  }),
}));

const sampleRaffle = {
  id: "raffle-test-123",
  title: "Rifle Krytac Trident MK2",
  description: "Rifa especial de teste",
  pricePerQuota: 25,
  totalQuotas: 100,
  status: "active",
  images: ["/uploads/krytac.jpg"],
  createdAt: "2026-11-16T12:00:00.000Z",
  stats: {
    total: 100,
    available: 98,
    reserved: 1,
    paid: 1,
    percentPaid: 1,
    percentReserved: 1,
  },
};

const sampleQuotas = [
  { number: "100", status: "paid", buyerName: "Carlos Alberto", buyerPhone: "11988887777" },
  { number: "01", status: "reserved", buyerName: "João Silva", buyerPhone: "45999991111" },
  { number: "02", status: "available" },
];

// Mock do raffleService
vi.mock("@/lib/raffleService", () => {
  return {
    getRaffles: vi.fn(() => [sampleRaffle]),
    getRaffleById: vi.fn((id: string) => (id === "raffle-test-123" ? sampleRaffle : null)),
    calculateRaffleStats: vi.fn(() => ({
      total: 100,
      available: 98,
      reserved: 1,
      paid: 1,
      percentPaid: 1,
      percentReserved: 1,
    })),
    createRaffle: vi.fn((input) => ({
      success: true,
      raffle: {
        ...sampleRaffle,
        id: "raffle-created-456",
        title: input.title,
        pricePerQuota: input.pricePerQuota,
        totalQuotas: input.totalQuotas,
      },
    })),
    getRaffleQuotas: vi.fn((id: string) => (id === "raffle-test-123" ? sampleQuotas : [])),
    reserveQuotas: vi.fn((id, quotas, customer) => {
      if (id !== "raffle-test-123") return { success: false, error: "Rifa não encontrada" };
      return {
        success: true,
        reservedNumbers: quotas,
        totalAmount: quotas.length * 25,
      };
    }),
    markQuotasAsPaid: vi.fn((id, quotas) => ({ success: true, count: quotas.length })),
    releaseQuotas: vi.fn((id, quotas) => ({ success: true, count: quotas.length })),
    drawFederalLottery: vi.fn((id, drawInput) => {
      return {
        success: true,
        result: {
          winningQuota: "100",
          winner: { name: "Carlos Alberto", phone: "11988887777" },
          raffle: {
            ...sampleRaffle,
            status: "drawn",
            winnerQuota: "100",
            winnerName: "Carlos Alberto",
          },
        },
      };
    }),
  };
});

describe("Raffle API Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Public Endpoints", () => {
    it("GET /api/raffles should return list of raffles with stats", async () => {
      const res = await getPublicRaffles();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.raffles).toBeDefined();
      expect(data.raffles.length).toBe(1);
      expect(data.raffles[0].title).toBe("Rifle Krytac Trident MK2");
      expect(data.raffles[0].stats).toBeDefined();
    });

    it("GET /api/raffles/[id] should return masked buyer details for privacy", async () => {
      const req = new NextRequest("http://localhost:3000/api/raffles/raffle-test-123");
      const res = await getPublicRaffleById(req, {
        params: Promise.resolve({ id: "raffle-test-123" }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.raffle.id).toBe("raffle-test-123");
      // Check privacy masking: names should not show full surname, phone numbers should be masked
      const paidQuota = data.quotas.find((q: any) => q.number === "100");
      expect(paidQuota.buyerName).toBe("Carlos A.");
      expect(paidQuota.buyerPhone).toContain("*****");
    });

    it("POST /api/raffles/[id]/reserve should validate buyer info and reserve quotas", async () => {
      const req = new NextRequest("http://localhost:3000/api/raffles/raffle-test-123/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotas: ["02"],
          buyerName: "Marcos Paulo",
          buyerPhone: "45988880000",
        }),
      });

      const res = await reserveQuotasRoute(req, {
        params: Promise.resolve({ id: "raffle-test-123" }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.reservedNumbers).toHaveLength(1);
    });

    it("POST /api/raffles/[id]/reserve should return 400 when missing name or phone", async () => {
      const req = new NextRequest("http://localhost:3000/api/raffles/raffle-test-123/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotas: ["02"],
          buyerName: "",
          buyerPhone: "",
        }),
      });

      const res = await reserveQuotasRoute(req, {
        params: Promise.resolve({ id: "raffle-test-123" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("Admin Endpoints & Authentication", () => {
    it("GET /api/admin/raffles should reject unauthorized requests with 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/raffles");
      const res = await getAdminRaffles(req);
      expect(res.status).toBe(401);
    });

    it("GET /api/admin/raffles should succeed with valid master auth token", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/raffles", {
        headers: {
          cookie: "admin_session=valid-master-token",
        },
      });
      const res = await getAdminRaffles(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.raffles).toHaveLength(1);
    });

    it("POST /api/admin/raffles should create a new raffle", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/raffles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "admin_session=valid-master-token",
        },
        body: JSON.stringify({
          title: "Pistola Glock G19 Gen5 VFC",
          description: "Edição limitada",
          image: "/uploads/glock.jpg",
          pricePerQuota: 15,
          totalQuotas: 100,
        }),
      });

      const res = await createAdminRaffle(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.raffle.title).toBe("Pistola Glock G19 Gen5 VFC");
    });

    it("GET /api/admin/raffles/[id] should return full unmasked buyer details for admin", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/raffles/raffle-test-123", {
        headers: {
          cookie: "admin_session=valid-master-token",
        },
      });

      const res = await getAdminRaffleById(req, {
        params: Promise.resolve({ id: "raffle-test-123" }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      const paidQuota = data.quotas.find((q: any) => q.number === "100");
      expect(paidQuota.buyerName).toBe("Carlos Alberto"); // Unmasked full name
      expect(paidQuota.buyerPhone).toBe("11988887777"); // Unmasked full phone
    });

    it("POST /api/admin/raffles/[id]/quotas should allow admin to mark quotas as paid", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/raffles/raffle-test-123/quotas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "admin_session=valid-master-token",
        },
        body: JSON.stringify({
          action: "pay",
          quotas: ["01"],
        }),
      });

      const res = await manageAdminQuotas(req, {
        params: Promise.resolve({ id: "raffle-test-123" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("POST /api/admin/raffles/[id]/draw should execute Federal Lottery draw and declare winner", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/raffles/raffle-test-123/draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: "admin_session=valid-master-token",
        },
        body: JSON.stringify({
          drawNumber: "5932",
          drawDate: "2026-11-18",
          firstPrize: "74300", // Last 2 digits: "00" matches Carlos Alberto (quota 100)
          secondPrize: "12345",
          thirdPrize: "23456",
          fourthPrize: "34567",
          fifthPrize: "45678",
        }),
      });

      const res = await drawFederalLotteryRoute(req, {
        params: Promise.resolve({ id: "raffle-test-123" }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result.winningQuota).toBe("100");
      expect(data.result.winner.name).toBe("Carlos Alberto");
      expect(data.result.raffle.status).toBe("drawn");
    });
  });
});
