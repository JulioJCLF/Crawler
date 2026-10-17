"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Shield, Package } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export function Hero() {
  const { theme } = useTheme();

  return (
    <div className="relative overflow-hidden bg-background border-b border-border py-8 px-6 md:py-12 md:px-10">
      {/* Glow effect for tactical themes */}
      {theme === "hunting" && (
        <div 
          className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)' }}
        />
      )}

    <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-card border border-border p-2 flex items-center justify-center shadow-lg shadow-black/20 group-hover:border-accent/40 transition-colors">
              <Logo className="w-full h-full object-contain filter drop-shadow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] tracking-[0.2em] uppercase text-accent">
              <span className="w-1.5 h-1.5 bg-accent inline-block"></span>
              Intelligence & Tracking
            </div>
            
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tight uppercase text-foreground mb-2">
              Catálogo <span className="text-accent">Hunting World</span>
            </h1>
            
            <p className="text-muted-foreground font-sans text-xs md:text-sm max-w-xl">
              Monitoramento tático de equipamentos, preços e disponibilidade. 
              Identificação em tempo real de novos itens e reposições de estoque.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-card border border-border rounded-md p-3 flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]"></span>
            Status: <strong className="text-foreground">Online</strong>
          </div>

          <Link
            href="/admin"
            className="bg-card border border-accent/40 rounded-md p-2.5 sm:px-3 flex items-center gap-2 font-mono text-xs text-foreground hover:bg-accent/10 hover:border-accent transition-all shadow-sm"
            title="Acessar Gerenciador de Catálogo e Painel Administrativo"
          >
            <Package className="w-3.5 h-3.5 text-accent" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Gerenciar Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
