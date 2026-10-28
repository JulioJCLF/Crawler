"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { siteConfig } from "@/config/site";
import { buildCartWhatsAppUrl } from "@/lib/whatsappUtils";

export function FloatingCart() {
  const { items, totalItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const sellers = siteConfig.whatsappSellers;
  const [selectedSellerId, setSelectedSellerId] = useState<string>(
    sellers[0]?.id ?? "vendedor-1"
  );

  const selectedSeller =
    sellers.find((seller) => seller.id === selectedSellerId) ??
    sellers[0] ?? {
      id: "vendedor-1",
      name: "Vendedor 1",
      number: siteConfig.whatsappNumber,
    };

  // Função para montar a URL do Zap com todos os produtos para o vendedor escolhido
  const generateWhatsAppOrder = () => {
    return buildCartWhatsAppUrl(items, totalItems, selectedSeller.number);
  };

  return (
    <>
      {/* Botão Flutuante */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex items-center justify-center w-12 h-12 bg-accent text-accent-foreground border border-accent shadow-none hover:opacity-95 transition-opacity"
          aria-label="Abrir carrinho"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground font-mono px-1.5 py-0.5 text-[11px] border border-destructive">
            {totalItems}
          </span>
        </button>
      )}

      {/* Drawer do Carrinho */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col bg-card border-l border-border p-6 sm:p-8 rounded-none">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle className="font-display uppercase text-lg font-medium flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-accent" />
              Seu Carrinho
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground font-mono text-sm text-center">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              O carrinho está vazio.<br/>Adicione itens pelo catálogo.
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6 py-4">
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-start border-b border-border pb-4">
                      <div className="w-16 h-16 bg-muted/20 border border-border flex items-center justify-center p-1 shrink-0">
                        {item.product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product.image} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-[8px] font-mono text-muted-foreground">SEM IMG</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-sm font-medium leading-tight line-clamp-2">{item.product.name}</h4>
                        <div className="text-[10px] text-muted-foreground font-mono uppercase mt-1">Ref: {item.product.id}</div>
                        <div className="font-mono text-primary font-bold mt-1 text-sm">{item.product.price || "Sob Consulta"}</div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 bg-background border border-border rounded">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 hover:bg-muted text-foreground">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 hover:bg-muted text-foreground">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t border-border pt-4 mt-auto">
                <div className="mb-3">
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Enviar pedido para:
                  </span>
                  <div
                    className="grid grid-cols-2 gap-2"
                    role="radiogroup"
                    aria-label="Escolher vendedor do WhatsApp"
                  >
                    {sellers.map((seller) => {
                      const isSelected = selectedSeller.id === seller.id;
                      return (
                        <button
                          key={seller.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedSellerId(seller.id)}
                          className={`py-2 px-3 text-xs font-mono uppercase border transition-colors flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? "border-accent bg-accent/15 text-accent font-bold"
                              : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{seller.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <a 
                  href={generateWhatsAppOrder()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-accent text-accent-foreground font-mono uppercase font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Finalizar Orçamento ({totalItems})
                </a>
                <button 
                  onClick={clearCart}
                  className="w-full text-center mt-3 text-xs font-mono text-muted-foreground hover:text-destructive uppercase underline"
                >
                  Esvaziar Carrinho
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
