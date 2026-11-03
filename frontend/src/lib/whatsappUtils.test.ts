import { describe, it, expect } from "vitest";
import { buildCartWhatsAppUrl } from "./whatsappUtils";
import { siteConfig } from "@/config/site";
import { CartItem } from "@/providers/CartProvider";

const mockItems: CartItem[] = [
  {
    product: {
      id: "101",
      name: "RIFLE AEG M4 NEPTUNE 10",
      price: "R$ 2.150,00",
      url: "https://example.com/p/101",
      image: "https://example.com/img/101.jpg",
      category: "replicas",
      categoryLabel: "Réplicas",
    },
    quantity: 1,
  },
  {
    product: {
      id: "202",
      name: "BBS 0.25G 4000UN",
      price: "R$ 85,00",
      url: "https://example.com/p/202",
      image: "https://example.com/img/202.jpg",
      category: "bbs",
      categoryLabel: "BBs",
    },
    quantity: 2,
  },
];

describe("buildCartWhatsAppUrl (REQ-014 / PM-011)", () => {
  it("possui ao menos 2 vendedores configurados em siteConfig.whatsappSellers", () => {
    expect(siteConfig.whatsappSellers.length).toBeGreaterThanOrEqual(2);
    expect(siteConfig.whatsappSellers[0].name).toBe("Matheus");
    expect(siteConfig.whatsappSellers[0].number).toBe("5545999858096");
    expect(siteConfig.whatsappSellers[1].name).toBe("Alexandre");
    expect(siteConfig.whatsappSellers[1].number).toBe("554598454109");
  });

  it("gera o link de orçamento para Matheus (vendedor 1)", () => {
    const seller1 = siteConfig.whatsappSellers[0];
    const url = buildCartWhatsAppUrl(mockItems, 3, seller1.number);

    expect(url.startsWith("https://wa.me/5545999858096?text=")).toBe(true);
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toContain("*NOVO ORÇAMENTO/PEDIDO*");
    expect(decoded).toContain("1. RIFLE AEG M4 NEPTUNE 10");
    expect(decoded).toContain("Ref: 101");
    expect(decoded).toContain("Qtd: 1");
    expect(decoded).toContain("Preço Listado: R$ 2.150,00");
    expect(decoded).toContain("2. BBS 0.25G 4000UN");
    expect(decoded).toContain("Qtd: 2");
    expect(decoded).toContain("Total de Itens: 3");
  });

  it("gera o link de orçamento para Alexandre (vendedor 2)", () => {
    const seller2 = siteConfig.whatsappSellers[1];
    const url = buildCartWhatsAppUrl(mockItems, 3, seller2.number);

    expect(url.startsWith("https://wa.me/554598454109?text=")).toBe(true);
    expect(seller2.number).not.toBe(siteConfig.whatsappSellers[0].number);
  });

  it("higieniza caracteres não numéricos caso o telefone tenha formatação", () => {
    const url = buildCartWhatsAppUrl(mockItems, 3, "+55 (45) 99985-8096");
    expect(url.startsWith("https://wa.me/5545999858096?text=")).toBe(true);
  });

  it("utiliza o sku do produto se disponível na mensagem de WhatsApp (REQ-025)", () => {
    const itemWithSku: CartItem[] = [
      {
        product: {
          id: "11996",
          sku: "329859",
          name: "CANO DE PRECISAO ACTION ARMY",
          price: "R$ 150,00",
          url: "https://example.com/p/11996",
          image: "",
          category: "rifles-gas",
          categoryLabel: "Peças para Rifles a Gás",
        },
        quantity: 1,
      },
    ];

    const url = buildCartWhatsAppUrl(itemWithSku, 1, "5545999858096");
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toContain("Ref: 329859");
    expect(decoded).not.toContain("Ref: 11996");
  });

  it("inclui a linha de Subtotal na mensagem quando fornecido (PM-013)", () => {
    const url = buildCartWhatsAppUrl(mockItems, 3, "5545999858096", "R$ 2.320,00");
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toContain("Total de Itens: 3");
    expect(decoded).toContain("Subtotal: R$ 2.320,00");
  });

  it("não inclui links que referenciam o site da arsenal na mensagem gerada", () => {
    const itemsWithArsenalUrl: CartItem[] = [
      {
        product: {
          id: "300",
          name: "PRODUTO TESTE",
          price: "R$ 50,00",
          url: "https://arsenalsports.com/item/300",
          image: "",
          category: "bbs",
          categoryLabel: "BBs",
        },
        quantity: 1,
      },
    ];
    const url = buildCartWhatsAppUrl(itemsWithArsenalUrl, 1, "5545999858096", "R$ 50,00");
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).not.toContain("arsenalsports.com");
  });
});
