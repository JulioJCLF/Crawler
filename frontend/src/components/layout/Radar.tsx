"use client";

import { useState } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { ChevronDown, ChevronUp } from "lucide-react";

export function Radar({ products }: { products: Product[] }) {
  const [isOpen, setIsOpen] = useState(true);

  // Pegamos apenas produtos que tiveram mudança recente ou são novos
  const highlights = products.filter(p => p.changeType === "new" || p.changeType === "restock").slice(0, 10);

  if (highlights.length === 0) return null;

  return (
    <div className="bg-card border-b border-border transition-colors">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-accent inline-block" />
            <h2 className="font-display font-medium text-base uppercase tracking-wider text-foreground group-hover:text-accent transition-colors">
              Radar de Novidades
            </h2>
            <span className="font-mono text-xs text-muted-foreground ml-2 hidden sm:inline-block">
              [24H · {highlights.length} ITENS DETECTADOS]
            </span>
          </div>
          <button className="text-muted-foreground group-hover:text-accent transition-colors p-1" aria-label="Alternar radar">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isOpen && (
          <div className="flex gap-4 overflow-x-auto pt-4 pb-2 scrollbar-hide snap-x mt-2">
            {highlights.map(product => (
              <div key={product.id} className="snap-start flex-none w-[200px] sm:w-[220px]">
                <div className="scale-95 origin-top">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
