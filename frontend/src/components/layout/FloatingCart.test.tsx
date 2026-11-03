import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { CartProvider, useCart } from "@/providers/CartProvider";
import { FloatingCart } from "./FloatingCart";
import { ProductCard } from "@/components/ProductCard";

function CartWithInitialItem() {
  const { addToCart } = useCart();

  useEffect(() => {
    addToCart({
      id: "999",
      name: "PISTOLA GBB GLOCK G17",
      price: "R$ 1.250,00",
      url: "https://example.com/p/999",
      image: "",
      category: "replicas",
      categoryLabel: "Réplicas",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <FloatingCart />;
}

describe("FloatingCart - Seleção de vendedor (REQ-014 / PM-011)", () => {
  it("pré-seleciona Matheus por padrão e altera o link ao escolher Alexandre", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartWithInitialItem />
      </CartProvider>
    );

    const seller1Btn = await screen.findByRole("radio", { name: /Matheus/i });
    const seller2Btn = await screen.findByRole("radio", { name: /Alexandre/i });
    const checkoutLink = await screen.findByRole("link", {
      name: /Finalizar Orçamento/i,
    });

    expect(seller1Btn).toHaveAttribute("aria-checked", "true");
    expect(seller2Btn).toHaveAttribute("aria-checked", "false");
    expect(checkoutLink.getAttribute("href")).toContain(
      "https://wa.me/5545999858096?text="
    );

    await user.click(seller2Btn);

    expect(seller1Btn).toHaveAttribute("aria-checked", "false");
    expect(seller2Btn).toHaveAttribute("aria-checked", "true");
    expect(checkoutLink.getAttribute("href")).toContain(
      "https://wa.me/554598454109?text="
    );
  });

  it("ao clicar em 'Pedir via WhatsApp' no ProductCard, adiciona 1 unidade ao carrinho e abre o fluxo de escolha de vendedor", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <ProductCard
          product={{
            id: "777",
            name: "RIFLE SNIPER SPRING VSR-10",
            price: "100.00",
            url: "https://example.com/p/777",
            image: "",
            category: "sniper",
            categoryLabel: "Sniper",
          }}
        />
        <FloatingCart />
      </CartProvider>
    );

    const pedirBtn = screen.getByRole("button", { name: /Pedir via WhatsApp/i });
    await user.click(pedirBtn);

    const checkoutLink = await screen.findByRole("link", {
      name: /Finalizar Orçamento \(1\)/i,
    });
    expect(checkoutLink.getAttribute("href")).toContain(
      "https://wa.me/5545999858096?text="
    );
    expect(decodeURIComponent(checkoutLink.getAttribute("href") || "")).toContain(
      "RIFLE SNIPER SPRING VSR-10"
    );
  });

  it("exibe o SKU real no card e no link do WhatsApp quando disponível (REQ-025)", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <ProductCard
          product={{
            id: "11996",
            sku: "329859",
            name: "ACTION ARMY INNER BARREL",
            price: "100.00",
            url: "https://example.com/p/11996",
            image: "",
            category: "rifles-gas",
            categoryLabel: "Peças para Rifles a Gás",
          }}
        />
        <FloatingCart />
      </CartProvider>
    );

    expect(screen.getByText(/REF\. 329859/i)).toBeInTheDocument();

    const pedirBtn = screen.getByRole("button", { name: /Pedir via WhatsApp/i });
    await user.click(pedirBtn);

    const checkoutLink = await screen.findByRole("link", {
      name: /Finalizar Orçamento \(1\)/i,
    });
    const decodedUrl = decodeURIComponent(checkoutLink.getAttribute("href") || "");
    expect(decodedUrl).toContain("Ref: 329859");
    expect(decodedUrl).not.toContain("Ref: 11996");
  });

  it("calcula e exibe o Subtotal somando os itens e quantidades no carrinho e no link (PM-013)", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartWithInitialItem />
      </CartProvider>
    );

    // Initial item: PISTOLA GBB GLOCK G17 (1x R$ 1.250,00)
    expect(await screen.findByText(/Subtotal \(1 item\):/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1\.250,00/).length).toBeGreaterThanOrEqual(1);

    const checkoutLink = await screen.findByRole("link", {
      name: /Finalizar Orçamento \(1\)/i,
    });
    const decodedUrl = decodeURIComponent(checkoutLink.getAttribute("href") || "").replace(/\u00a0/g, " ");
    expect(decodedUrl).toContain("Subtotal: R$ 1.250,00");

    // Incrementa a quantidade para 2
    const buttons = screen.getAllByRole("button");
    const incrementBtn = buttons.find((btn) => btn.querySelector("svg.lucide-plus"));
    if (incrementBtn) {
      await user.click(incrementBtn);
      expect(await screen.findByText(/Subtotal \(2 itens\):/i)).toBeInTheDocument();
      expect(screen.getByText(/2\.500,00/)).toBeInTheDocument();
    }
  });

  it("não renderiza links de redirecionamento para o site da arsenal no card do produto (PM-013)", () => {
    render(
      <CartProvider>
        <ProductCard
          product={{
            id: "555",
            name: "RIFLE AEG TESTE",
            price: "100.00",
            url: "https://arsenalsports.com/item/555",
            image: "",
            category: "replicas",
            categoryLabel: "Réplicas",
          }}
        />
      </CartProvider>
    );

    // O título não deve ser um link <a> com destino à arsenal
    const arsenalLinks = screen.queryAllByRole("link").filter((link) => {
      const href = link.getAttribute("href");
      return href && href.includes("arsenalsports.com");
    });
    expect(arsenalLinks.length).toBe(0);
  });
});
