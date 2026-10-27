"use client";

import { Package } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background border-b border-border py-8 px-6 md:py-10 md:px-10">
      <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <div className="corner-ticks w-16 h-16 md:w-20 md:h-20 bg-card border border-border p-2 flex items-center justify-center">
              <Logo className="w-full h-full object-contain filter drop-shadow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-accent inline-block"></span>
              SYS.01 // INTELLIGENCE &amp; TRACKING
            </div>
            
            <h1 className="font-display font-medium text-3xl md:text-4xl tracking-[-0.03em] uppercase text-foreground mb-2">
              Catálogo Hunting World
            </h1>
            
            <p className="text-muted-foreground text-xs md:text-sm max-w-xl leading-relaxed">
              Monitoramento tático de equipamentos, preços e disponibilidade. Identificação precisa de reposições de estoque em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-card border border-border px-3 py-2 flex items-center gap-2.5 font-mono text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-accent inline-block"></span>
            Status: <span className="text-foreground font-medium">ONLINE</span>
          </div>

          <Link
            href="/admin"
            className="bg-card border border-border px-3 py-2 flex items-center gap-2 font-mono text-xs text-foreground hover:border-accent hover:text-accent transition-colors"
            title="Acessar Gerenciador de Catálogo e Painel Administrativo"
          >
            <Package className="w-3.5 h-3.5 text-accent" />
            <span className="uppercase tracking-wider text-[11px]">Gerenciar Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
