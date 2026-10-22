"use client";

import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/providers/CartProvider";
import { usePricing } from "@/providers/PricingProvider";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cleanProductName } from "@/lib/catalogService";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { calculatePrice } = usePricing();

  const productName = cleanProductName(product.name);
  const currentBrl = calculatePrice(product.price, product.category, product.fixedBrlPrice);
  const previousBrl = calculatePrice(product.previousPrice, product.category);

  const hasExternalUrl = Boolean(product.url && product.url.trim());
  const zapMessage = `Olá, tenho interesse no produto *${productName}* (Ref: ${product.id}).\n${currentBrl ? `Preço: ${currentBrl.formatted}` : `Qual o valor?`}${hasExternalUrl ? `\nLink Original: ${product.url}` : ""}`;
  const zapUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(zapMessage)}`;

  // Cálculo de Porcentagem de Desconto
  let discountPercentage = 0;
  if (currentBrl && previousBrl && currentBrl.amount < previousBrl.amount) {
    discountPercentage = Math.round(((previousBrl.amount - currentBrl.amount) / previousBrl.amount) * 100);
  }


  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
      <div className="relative h-48 md:h-52 bg-muted/20 flex items-center justify-center p-4">
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.changeType === "new" && (
            <Badge className="uppercase tracking-widest text-[10px]">
              Novo
            </Badge>
          )}
          {product.changeType === "restock" && (
            <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">
              Restock
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-destructive text-destructive-foreground uppercase tracking-widest text-[10px]">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
        
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={product.image} 
            alt={productName}
            className="object-contain max-h-full max-w-full mix-blend-multiply dark:mix-blend-normal"
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground font-mono text-xs tracking-widest">SEM IMAGEM</div>
        )}
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-sm font-medium leading-snug line-clamp-3">
          <a 
            href={hasExternalUrl ? product.url : zapUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4 flex items-start gap-1 group"
          >
            {productName}
            {hasExternalUrl && (
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
            )}
          </a>
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono uppercase">Ref: {product.id} · {product.categoryLabel || product.category}</span>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex justify-between items-end w-full">
          <div className="flex flex-col">
            {currentBrl ? (
              <span className="font-mono font-bold text-lg text-primary">{currentBrl.formatted}</span>
            ) : (
              <span className="font-mono text-muted-foreground text-sm">Sob Consulta</span>
            )}
            {previousBrl && currentBrl && previousBrl.amount > currentBrl.amount && (
              <span className="font-mono text-xs text-muted-foreground line-through">
                {previousBrl.formatted}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex w-full gap-2">
          <a 
            href={zapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center text-center bg-accent text-accent-foreground font-mono text-[10px] md:text-[11px] uppercase font-bold py-2 rounded-sm transition-colors hover:opacity-90 leading-tight"
          >
            Pedir via WhatsApp
          </a>
          
          <button 
            onClick={() => addToCart({ ...product, price: currentBrl ? currentBrl.formatted : product.price })}
            className="flex-1 flex items-center justify-center text-center bg-secondary text-secondary-foreground font-mono text-[10px] md:text-[11px] uppercase font-bold py-2 rounded-sm transition-colors hover:bg-secondary/80 border border-border leading-tight"
          >
            + Carrinho
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
