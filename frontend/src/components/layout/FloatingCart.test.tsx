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
  it("pré-seleciona o Vendedor 1 por padrão e altera o link ao escolher o Vendedor 2", async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartWithInitialItem />
      </CartProvider>
    );

    const seller1Btn = await screen.findByRole("radio", { name: /Vendedor 1/i });
    const seller2Btn = await screen.findByRole("radio", { name: /Vendedor 2/i });
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
      "https://wa.me/5545999999999?text="
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
});
