"use client";

import { Product } from "@/types";
import { useCart } from "@/providers/CartProvider";
import { usePricing } from "@/providers/PricingProvider";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cleanProductName } from "@/lib/cleanUtils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { calculatePrice } = usePricing();

  const productName = cleanProductName(product.name);
  const currentBrl = calculatePrice(product.price, product.category, product.fixedBrlPrice);
  const previousBrl = calculatePrice(product.previousPrice, product.category);

  const hasExternalUrl = Boolean(product.url && product.url.trim());
  const zapMessage = `Olá, tenho interesse no produto *${productName}* (Ref: ${product.id}).\n${currentBrl ? `Preço: ${currentBrl.formatted}` : `Qual o valor?`}${hasExternalUrl ? `\nLink Original: ${product.url}` : ""}`;
  const zapUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(zapMessage)}`;
  const handleAddToCart = () => {
    addToCart({ ...product, price: currentBrl ? currentBrl.formatted : product.price });
  };

  // Cálculo de Porcentagem de Desconto
  let discountPercentage = 0;
  if (currentBrl && previousBrl && currentBrl.amount < previousBrl.amount) {
    discountPercentage = Math.round(((previousBrl.amount - currentBrl.amount) / previousBrl.amount) * 100);
  }

  return (
    <article className="flex flex-col h-full bg-card border border-border overflow-hidden transition-colors hover:border-accent">
      <div className="relative h-48 md:h-52 bg-muted/20 border-b border-border flex items-center justify-center p-4">
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.changeType === "new" && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-accent text-accent bg-accent/10">
              Novo
            </span>
          )}
          {product.changeType === "restock" && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-border text-foreground bg-muted">
              Restock
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-destructive text-destructive bg-destructive/10">
              -{discountPercentage}%
            </span>
          )}
        </div>
        
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={product.image} 
            alt={productName}
            className="object-contain max-h-full max-w-full"
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground font-mono text-xs tracking-widest">SEM IMAGEM</div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-sm font-medium leading-snug line-clamp-2">
          <a 
            href={hasExternalUrl ? product.url : zapUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors flex items-start gap-1 group"
          >
            <span>{productName}</span>
            {hasExternalUrl && (
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
            )}
          </a>
        </h3>
        <span className="text-[11px] text-muted-foreground font-mono">REF. {product.id} // {product.categoryLabel || product.category}</span>
      </div>
      
      <div className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex justify-between items-baseline w-full">
          <div className="flex flex-col">
            {currentBrl ? (
              <span className="font-mono text-lg font-bold text-accent tabular-nums">{currentBrl.formatted}</span>
            ) : (
              <span className="font-mono text-muted-foreground text-sm">Sob Consulta</span>
            )}
            {previousBrl && currentBrl && previousBrl.amount > currentBrl.amount && (
              <span className="font-mono text-xs text-muted-foreground line-through tabular-nums">
                {previousBrl.formatted}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex w-full gap-2">
          <button 
            type="button"
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center text-center bg-accent text-accent-foreground font-display text-xs uppercase font-medium py-2 transition-opacity hover:opacity-90 leading-tight border border-accent"
          >
            Pedir via WhatsApp
          </button>
          
          <button 
            type="button"
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center text-center bg-card text-foreground font-display text-xs uppercase font-medium py-2 transition-colors hover:bg-muted border border-border leading-tight"
          >
            + Carrinho
          </button>
        </div>
      </div>
    </article>
  );
}
