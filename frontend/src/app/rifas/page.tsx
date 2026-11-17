"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Raffle } from "@/types";

export default function PublicRafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/raffles");
      if (!res.ok) throw new Error("Erro ao carregar lista de rifas");
      const data = await res.json();
      setRaffles(data.raffles || []);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao carregar rifas");
    } finally {
      setLoading(false);
    }
  };

  const activeRaffles = raffles.filter((r) => r.status === "active");
  const pastRaffles = raffles.filter(
    (r) => r.status === "drawn" || r.status === "completed" || r.status === "cancelled"
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Catálogo</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Logo className="h-8 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sorteios pela Loteria Federal
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-border bg-gradient-to-b from-card to-background py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h1 className="font-heading text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-foreground">
            RIFA HUNTING
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Participe dos nossos sorteios exclusivos com transparência total e segurança máxima. 
            O ganhador é definido com base na extração oficial da <strong>Loteria Federal (Caixa Econômica)</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto text-left">
            <div className="p-3 bg-card/60 border border-border rounded-lg">
              <div className="text-accent font-bold text-xs uppercase font-heading">100% Auditável</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Regra matemática pública baseada nos bilhetes oficiais da Caixa.
              </p>
            </div>
            <div className="p-3 bg-card/60 border border-border rounded-lg">
              <div className="text-accent font-bold text-xs uppercase font-heading">PIX Direto</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Confirmação ágil com nossos vendedores Matheus e Alexandre via WhatsApp.
              </p>
            </div>
            <div className="p-3 bg-card/60 border border-border rounded-lg">
              <div className="text-accent font-bold text-xs uppercase font-heading">Cotas Limitadas</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Apenas 100 ou 1000 números para aumentar suas chances de vitória.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-mono text-sm text-muted-foreground">Carregando sorteios disponíveis...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl border border-destructive/40 bg-destructive/10 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="font-heading font-bold uppercase text-foreground">Falha ao Carregar</h3>
            <p className="text-xs font-mono text-muted-foreground">{error}</p>
            <button
              onClick={fetchRaffles}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-mono rounded hover:bg-primary/90"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {/* Seção 1: Rifas em Andamento */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-foreground">
                    Sorteios Ativos
                  </h2>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {activeRaffles.length} {activeRaffles.length === 1 ? "ação disponível" : "ações disponíveis"}
                </span>
              </div>

              {activeRaffles.length === 0 ? (
                <div className="p-10 border border-dashed border-border rounded-xl text-center space-y-2 bg-card/30">
                  <Ticket className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                  <p className="font-heading font-bold text-foreground uppercase text-sm">
                    Nenhuma rifa ativa no momento
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Fique atento ao nosso canal no WhatsApp para o lançamento da próxima ação entre amigos!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeRaffles.map((raffle) => {
                    const stats = raffle.stats || {
                      total: raffle.totalQuotas,
                      available: raffle.totalQuotas,
                      reserved: 0,
                      paid: 0,
                      percentPaid: 0,
                      percentReserved: 0,
                    };

                    const primaryImage =
                      raffle.images && raffle.images.length > 0
                        ? raffle.images[0]
                        : null;

                    const progressTotal = Math.min(100, stats.percentPaid + stats.percentReserved);

                    return (
                      <div
                        key={raffle.id}
                        className="bg-card border border-border hover:border-accent/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                      >
                        {/* Imagem do Prêmio */}
                        <div className="relative aspect-video bg-muted/40 overflow-hidden flex items-center justify-center">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={raffle.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                              <Ticket className="w-12 h-12 stroke-[1.5] text-accent/40" />
                              <span className="text-[11px] font-mono uppercase">Prêmio Oficial</span>
                            </div>
                          )}

                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur border border-white/10 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Ativa
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur border border-white/10 text-white font-mono text-[11px] font-bold">
                              {raffle.totalQuotas} Cotas
                            </span>
                          </div>
                        </div>

                        {/* Detalhes */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                              {raffle.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {raffle.description || "Participe desta ação exclusiva Hunting World com extração pela Loteria Federal."}
                            </p>
                          </div>

                          {/* Preço e Barra de Progresso */}
                          <div className="space-y-3 pt-2 border-t border-border/50">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-mono text-muted-foreground uppercase">Valor da cota:</span>
                              <div className="font-mono text-xl font-bold text-accent">
                                R$ {raffle.pricePerQuota.toFixed(2).replace(".", ",")}
                              </div>
                            </div>

                            {/* Barra de Progresso */}
                            <div>
                              <div className="flex justify-between text-[11px] font-mono text-muted-foreground mb-1">
                                <span>{stats.paid} pagas ({stats.percentPaid}%)</span>
                                <span>{stats.available} livres</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-emerald-500 transition-all"
                                  style={{ width: `${stats.percentPaid}%` }}
                                  title={`${stats.percentPaid}% Pagas`}
                                />
                                <div
                                  className="h-full bg-amber-400 transition-all"
                                  style={{ width: `${stats.percentReserved}%` }}
                                  title={`${stats.percentReserved}% Reservadas`}
                                />
                              </div>
                            </div>

                            {/* Info Loteria Federal */}
                            <div className="p-2.5 rounded-lg bg-background border border-border text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-accent" />
                                <span>Sorteio:</span>
                              </div>
                              <span className="text-foreground font-semibold">
                                {raffle.drawDate
                                  ? new Date(raffle.drawDate).toLocaleDateString("pt-BR")
                                  : "Ao fechar 100% das cotas"}
                              </span>
                            </div>
                          </div>

                          {/* Botão de Ação */}
                          <Link
                            href={`/rifas/${raffle.id}`}
                            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-heading text-xs uppercase tracking-wider font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer shadow-sm"
                          >
                            <span>Escolher Meus Números</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Seção 2: Sorteios Anteriores / Ganhadores */}
            {pastRaffles.length > 0 && (
              <section className="space-y-6 pt-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-foreground">
                      Sorteios Concluídos & Vencedores
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {pastRaffles.length} {pastRaffles.length === 1 ? "concluído" : "concluídos"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastRaffles.map((raffle) => {
                    const primaryImage =
                      raffle.images && raffle.images.length > 0
                        ? raffle.images[0]
                        : null;

                    return (
                      <div
                        key={raffle.id}
                        className="bg-card border border-border rounded-2xl overflow-hidden opacity-95 flex flex-col justify-between"
                      >
                        <div className="relative aspect-video bg-muted/40 overflow-hidden flex items-center justify-center">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={raffle.title}
                              className="w-full h-full object-cover grayscale-50"
                            />
                          ) : (
                            <Trophy className="w-12 h-12 text-amber-400/40" />
                          )}
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold uppercase flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              Concluída
                            </span>
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          <div>
                            <h3 className="font-heading text-base font-bold uppercase tracking-tight text-foreground line-clamp-1">
                              {raffle.title}
                            </h3>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {raffle.totalQuotas} Cotas • R$ {raffle.pricePerQuota.toFixed(2).replace(".", ",")} cada
                            </span>
                          </div>

                          {/* Caixa do Vencedor */}
                          {raffle.winnerQuota || raffle.drawResults?.winningQuota ? (
                            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                                  Cota Campeã
                                </span>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {(raffle.drawnAt || raffle.drawResults?.drawnAt)
                                    ? new Date(raffle.drawnAt || raffle.drawResults!.drawnAt).toLocaleDateString("pt-BR")
                                    : ""}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-amber-500 text-black font-mono font-extrabold text-xl flex items-center justify-center shadow-md">
                                  {raffle.winnerQuota || raffle.drawResults?.winningQuota}
                                </div>
                                <div>
                                  <div className="font-heading font-bold text-sm text-foreground">
                                    {raffle.winnerName || raffle.drawResults?.winner?.name || "Participante Contemplado"}
                                  </div>
                                  <div className="font-mono text-[11px] text-muted-foreground">
                                    {raffle.drawResults
                                      ? `Concurso Caixa #${raffle.drawResults.contestNumber} (${raffle.drawResults.prizeOrigin})`
                                      : raffle.federalLotteryDraw
                                      ? `Concurso Caixa #${raffle.federalLotteryDraw.drawNumber} (${raffle.federalLotteryDraw.winningPrizeOrdinal}º prêmio)`
                                      : "Extração Oficial Caixa"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-muted text-xs font-mono text-muted-foreground text-center">
                              Rifa encerrada
                            </div>
                          )}

                          <Link
                            href={`/rifas/${raffle.id}`}
                            className="block text-center py-2 px-3 rounded-lg border border-border text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                          >
                            Ver Grade Completa e Regras
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Como Funciona a Loteria Federal (FAQ / Transparência) */}
            <section className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-5">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-accent" />
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-foreground">
                  Como Funciona o Sorteio pela Loteria Federal?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground leading-relaxed">
                <div className="space-y-2">
                  <div className="font-mono font-bold text-foreground uppercase tracking-wider">
                    1. Extração Oficial da Caixa
                  </div>
                  <p>
                    O sorteio não utiliza softwares geradores internos ou roletas. Aguardamos a extração oficial
                    da Loteria Federal realizada pela Caixa Econômica Federal nos dias estipulados (geralmente quartas e sábados).
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-mono font-bold text-foreground uppercase tracking-wider">
                    2. Regra de Dezenas / Centenas
                  </div>
                  <p>
                    Para rifas de <strong>100 números (01 a 100)</strong>, o ganhador é o titular da cota correspondente aos <strong>últimos 2 dígitos</strong> do 1º prêmio (onde o final 00 contempla o número 100). Para rifas de <strong>1000 números (001 a 1000)</strong>, utilizam-se os <strong>últimos 3 dígitos</strong> (onde 000 contempla o número 1000).
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-mono font-bold text-foreground uppercase tracking-wider">
                    3. Regra de Cascata (1º ao 5º Prêmio)
                  </div>
                  <p>
                    Caso o número contemplado pelo 1º prêmio não tenha sido comprado e pago, a apuração segue sucessivamente para o 2º, 3º, 4º e 5º prêmios da mesma extração, garantindo chances reais.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-xs font-mono text-muted-foreground bg-card/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Hunting World • Catálogo & Ações Táticas</span>
          <Link href="/" className="hover:text-accent transition-colors">
            Voltar à Loja Principal
          </Link>
        </div>
      </footer>
    </div>
  );
}
