"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  Trophy,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shuffle,
  Trash2,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  Lock,
  Share2,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Raffle, QuotaEntry } from "@/types";
import { siteConfig } from "@/config/site";

export default function RaffleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [quotas, setQuotas] = useState<QuotaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Seleção de cotas pelo usuário
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [filterState, setFilterState] = useState<"all" | "available" | "selected" | "reserved" | "paid">("all");
  const [searchNumber, setSearchNumber] = useState("");

  // Modal de Reserva
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [selectedSellerId, setSelectedSellerId] = useState<string>(
    siteConfig.whatsappSellers[0]?.id || "vendedor-1"
  );
  const [reserving, setReserving] = useState(false);
  const [reservationFeedback, setReservationFeedback] = useState<{
    success: boolean;
    message: string;
    waUrl?: string;
    reservedNumbers?: string[];
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadRaffleData();
    }
  }, [id]);

  const loadRaffleData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/raffles/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Rifa não encontrada ou encerrada.");
        throw new Error("Erro ao carregar detalhes da rifa.");
      }
      const data = await res.json();
      setRaffle(data.raffle);
      setQuotas(data.quotas || []);
    } catch (err: any) {
      setError(err.message || "Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  // Mapa de cotas por número para busca rápida
  const quotaMap = useMemo(() => {
    const map = new Map<string, QuotaEntry>();
    for (const q of quotas) {
      map.set(q.number, q);
    }
    return map;
  }, [quotas]);

  // Lista de todas as cotas com filtros aplicados
  const displayedQuotas = useMemo(() => {
    return quotas.filter((q) => {
      // Filtro de status
      if (filterState === "available" && q.status !== "available") return false;
      if (filterState === "reserved" && q.status !== "reserved") return false;
      if (filterState === "paid" && q.status !== "paid") return false;
      if (filterState === "selected" && !selectedNumbers.includes(q.number)) return false;

      // Filtro de busca numérica
      if (searchNumber.trim()) {
        const query = searchNumber.trim();
        if (!q.number.includes(query)) return false;
      }

      return true;
    });
  }, [quotas, filterState, searchNumber, selectedNumbers]);

  // Total a pagar pelas cotas selecionadas
  const totalPrice = useMemo(() => {
    if (!raffle) return 0;
    return selectedNumbers.length * raffle.pricePerQuota;
  }, [selectedNumbers, raffle]);

  // Alternar seleção de uma cota
  const toggleQuota = (number: string) => {
    const entry = quotaMap.get(number);
    if (!entry || entry.status !== "available") return;

    setSelectedNumbers((prev) =>
      prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
    );
  };

  // Surpresinha / Seleção aleatória
  const pickRandom = (count: number) => {
    const availableNumbers = quotas
      .filter((q) => q.status === "available" && !selectedNumbers.includes(q.number))
      .map((q) => q.number);

    if (availableNumbers.length === 0) return;

    // Embaralhar e selecionar
    const shuffled = [...availableNumbers].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count);
    setSelectedNumbers((prev) => [...prev, ...picked]);
  };

  // Limpar seleção
  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  // Vendedor selecionado
  const activeSeller = useMemo(() => {
    return (
      siteConfig.whatsappSellers.find((s) => s.id === selectedSellerId) ||
      siteConfig.whatsappSellers[0]
    );
  }, [selectedSellerId]);

  // Enviar Reserva
  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert("Por favor, preencha seu nome e número de WhatsApp.");
      return;
    }

    if (selectedNumbers.length === 0) {
      alert("Nenhum número selecionado.");
      return;
    }

    try {
      setReserving(true);
      const res = await fetch(`/api/raffles/${id}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotas: selectedNumbers,
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao reservar números.");
      }

      // Monta mensagem do WhatsApp
      const numbersListStr = selectedNumbers.sort().join(", ");
      const msg = [
        `🎯 *RESERVA DE RIFA - ${raffle?.title?.toUpperCase()}*`,
        ``,
        `👤 *Nome:* ${buyerName.trim()}`,
        `📱 *WhatsApp:* ${buyerPhone.trim()}`,
        `🎟️ *Cotas Reservadas (${selectedNumbers.length}):* ${numbersListStr}`,
        `💰 *Valor Total:* R$ ${totalPrice.toFixed(2).replace(".", ",")}`,
        ``,
        `Estou enviando o comprovante do PIX para confirmação dos bilhetes!`,
      ].join("\n");

      const waNumber = activeSeller?.number || siteConfig.whatsappNumber;
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

      setReservationFeedback({
        success: true,
        message: `Suas cotas foram pré-reservadas com sucesso! Envie a mensagem no WhatsApp para o vendedor ${activeSeller?.name} para confirmação do PIX.`,
        waUrl,
        reservedNumbers: selectedNumbers,
      });

      // Abre o WhatsApp imediatamente em nova aba
      window.open(waUrl, "_blank");

      // Atualiza os dados da rifa na tela
      loadRaffleData();
    } catch (err: any) {
      alert(err.message || "Falha na reserva.");
    } finally {
      setReserving(false);
    }
  };

  const handleFinishAndReset = () => {
    setShowReserveModal(false);
    setReservationFeedback(null);
    setSelectedNumbers([]);
    setBuyerName("");
    setBuyerPhone("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-sm text-muted-foreground">Carregando rifa e grade de cotas...</p>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="font-heading text-xl font-bold uppercase text-foreground">Sorteio Indisponível</h2>
        <p className="text-sm font-mono text-muted-foreground max-w-md">{error}</p>
        <Link
          href="/rifas"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-xs rounded-lg uppercase font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Rifas
        </Link>
      </div>
    );
  }

  const stats = raffle.stats || {
    total: raffle.totalQuotas,
    available: raffle.totalQuotas,
    reserved: 0,
    paid: 0,
    percentPaid: 0,
    percentReserved: 0,
  };

  const isDrawn = raffle.status === "drawn" || raffle.status === "completed";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28">
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/rifas"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Todas as Rifas</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Logo className="h-8 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Loteria Federal
            </span>
          </div>
        </div>
      </header>

      {/* Detalhes do Prêmio e Regras */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: Imagem Principal */}
          <div className="lg:col-span-1 space-y-4">
            <div className="aspect-square bg-muted/40 rounded-2xl overflow-hidden border border-border flex items-center justify-center relative">
              {raffle.images && raffle.images.length > 0 ? (
                <img
                  src={raffle.images[0]}
                  alt={raffle.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Ticket className="w-16 h-16 text-muted-foreground opacity-40" />
              )}

              {isDrawn && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
                  <span className="font-heading font-extrabold text-2xl uppercase text-amber-300">
                    Sorteio Realizado!
                  </span>
                  <div className="bg-amber-400 text-black px-4 py-1.5 rounded-lg font-mono font-black text-xl">
                    Cota Vencedora: {raffle.winnerQuota || raffle.drawResults?.winningQuota}
                  </div>
                  <span className="font-mono text-xs text-white/90">
                    Ganhador: {raffle.winnerName || raffle.drawResults?.winner?.name || "Contemplado"}
                  </span>
                </div>
              )}
            </div>

            {/* Galeria de miniaturas se houver mais de 1 foto */}
            {raffle.images && raffle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {raffle.images.slice(1).map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg border border-border overflow-hidden bg-muted"
                  >
                    <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coluna 2 e 3: Informações, Progresso e Regras */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {isDrawn ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs uppercase font-bold">
                    Concluída
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Ativa
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-mono text-xs">
                  {raffle.totalQuotas} Cotas
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground">
                {raffle.title}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-xs font-mono text-muted-foreground uppercase">Valor por cota:</span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-accent">
                  R$ {raffle.pricePerQuota.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* Descrição */}
            {raffle.description && (
              <div className="p-4 bg-card border border-border rounded-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {raffle.description}
              </div>
            )}

            {/* Barra de Progresso e Métricas */}
            <div className="p-5 bg-card border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Progresso de Vendas:</span>
                <span className="font-bold text-foreground">
                  {stats.paid} confirmadas ({stats.percentPaid}%) • {stats.reserved} reservadas
                </span>
              </div>

              <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
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

              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2 bg-background border border-border rounded-lg">
                  <div className="font-mono text-base font-bold text-emerald-400">{stats.available}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Disponíveis</div>
                </div>
                <div className="p-2 bg-background border border-border rounded-lg">
                  <div className="font-mono text-base font-bold text-amber-400">{stats.reserved}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Reservadas</div>
                </div>
                <div className="p-2 bg-background border border-border rounded-lg">
                  <div className="font-mono text-base font-bold text-foreground">{stats.paid}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Pagas</div>
                </div>
              </div>
            </div>

            {/* Banner da Loteria Federal */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase font-heading text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Critério Oficial de Sorteio (Loteria Federal)</span>
              </div>
              <p>
                O ganhador será definido pelos <strong>{raffle.totalQuotas === 100 ? "últimos 2 dígitos" : "últimos 3 dígitos"}</strong> do 1º prêmio da Loteria Federal da Caixa Econômica Federal.
                Caso o número sorteado não pertença a uma cota paga, o prêmio passará sucessivamente para o 2º, 3º, 4º e 5º prêmios da mesma extração.
              </p>
            </div>
          </div>
        </div>

        {/* Grade Interativa de Cotas */}
        <section className="space-y-6 pt-4 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wider text-foreground">
                Escolha Seus Números da Sorte
              </h2>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                Clique nos números para selecionar ou use a surpresinha abaixo para escolha automática.
              </p>
            </div>

            {/* Botões de Ação Rápida (Surpresinha) */}
            {!isDrawn && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground uppercase mr-1">Surpresinha:</span>
                <button
                  type="button"
                  onClick={() => pickRandom(1)}
                  className="px-3 py-1.5 bg-card hover:bg-muted border border-border rounded-lg text-xs font-mono font-bold text-foreground cursor-pointer transition-colors"
                >
                  +1 Cota
                </button>
                <button
                  type="button"
                  onClick={() => pickRandom(5)}
                  className="px-3 py-1.5 bg-card hover:bg-muted border border-border rounded-lg text-xs font-mono font-bold text-foreground cursor-pointer transition-colors"
                >
                  +5 Cotas
                </button>
                <button
                  type="button"
                  onClick={() => pickRandom(10)}
                  className="px-3 py-1.5 bg-card hover:bg-muted border border-border rounded-lg text-xs font-mono font-bold text-foreground cursor-pointer transition-colors"
                >
                  +10 Cotas
                </button>
                {selectedNumbers.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="p-1.5 text-muted-foreground hover:text-destructive border border-transparent hover:border-destructive/30 rounded-lg cursor-pointer"
                    title="Limpar seleção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filtros e Legenda da Grade */}
          <div className="p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Abas de filtro */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setFilterState("all")}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  filterState === "all"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Todas ({quotas.length})
              </button>
              <button
                onClick={() => setFilterState("available")}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  filterState === "available"
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Livres ({stats.available})
              </button>
              {selectedNumbers.length > 0 && (
                <button
                  onClick={() => setFilterState("selected")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    filterState === "selected"
                      ? "bg-accent text-accent-foreground font-bold"
                      : "bg-background text-accent hover:bg-accent/10 border border-accent/40"
                  }`}
                >
                  Minhas ({selectedNumbers.length})
                </button>
              )}
              <button
                onClick={() => setFilterState("reserved")}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  filterState === "reserved"
                    ? "bg-amber-600 text-white font-bold"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Reservadas ({stats.reserved})
              </button>
              <button
                onClick={() => setFilterState("paid")}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  filterState === "paid"
                    ? "bg-muted text-foreground font-bold"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                Pagas ({stats.paid})
              </button>
            </div>

            {/* Campo de Busca Numérica */}
            <div className="w-full sm:w-48">
              <input
                type="text"
                placeholder="Buscar número..."
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Grid de Cotas */}
          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-2 max-h-[550px] overflow-y-auto p-4 bg-card/40 border border-border rounded-2xl">
            {displayedQuotas.map((q) => {
              const isSelected = selectedNumbers.includes(q.number);
              const isWinner = (raffle.winnerQuota || raffle.drawResults?.winningQuota) === q.number;
              const isAvailable = q.status === "available";
              const isReserved = q.status === "reserved";
              const isPaid = q.status === "paid";

              let btnStyle = "bg-background border-border text-foreground hover:border-accent hover:scale-105";

              if (isWinner) {
                btnStyle = "bg-amber-400 text-black border-amber-300 font-extrabold shadow-lg shadow-amber-400/30 scale-110 z-10";
              } else if (isSelected) {
                btnStyle = "bg-accent text-accent-foreground border-accent font-extrabold scale-105 shadow-md shadow-accent/20";
              } else if (isPaid) {
                btnStyle = "bg-muted/40 border-border/40 text-muted-foreground/40 cursor-not-allowed opacity-60";
              } else if (isReserved) {
                btnStyle = "bg-amber-950/20 border-amber-500/30 text-amber-400/80 cursor-not-allowed";
              } else if (isAvailable) {
                btnStyle = "bg-background border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 cursor-pointer";
              }

              return (
                <button
                  key={q.number}
                  type="button"
                  disabled={!isAvailable || isDrawn}
                  onClick={() => toggleQuota(q.number)}
                  className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-1 font-mono text-xs sm:text-sm font-semibold transition-all select-none ${btnStyle}`}
                  title={`Cota ${q.number}: ${
                    isWinner
                      ? "Cota Vencedora!"
                      : isSelected
                      ? "Selecionada"
                      : isPaid
                      ? "Paga"
                      : isReserved
                      ? "Reservada"
                      : "Disponível para compra"
                  }`}
                >
                  <span>{q.number}</span>

                  {isWinner ? (
                    <Trophy className="w-3 h-3 absolute top-1 right-1 text-black" />
                  ) : isSelected ? (
                    <Check className="w-3 h-3 absolute top-1 right-1 text-accent-foreground stroke-[3]" />
                  ) : isPaid ? (
                    <Lock className="w-2.5 h-2.5 absolute top-1 right-1 text-muted-foreground/40" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {displayedQuotas.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-muted-foreground">
              Nenhuma cota corresponde aos filtros selecionados.
            </div>
          )}
        </section>
      </div>

      {/* Floating Bottom Action Bar (Aparece quando o usuário seleciona 1 ou mais cotas) */}
      {!isDrawn && selectedNumbers.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase">
                  {selectedNumbers.length} {selectedNumbers.length === 1 ? "cota selecionada" : "cotas selecionadas"}:
                </div>
                <div className="font-mono text-xs text-accent font-bold max-w-xs truncate">
                  {selectedNumbers.sort().join(", ")}
                </div>
              </div>

              <div className="h-8 w-px bg-border hidden sm:block" />

              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase">Total a pagar:</div>
                <div className="font-mono text-xl sm:text-2xl font-extrabold text-foreground">
                  R$ {totalPrice.toFixed(2).replace(".", ",")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={clearSelection}
                className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-mono uppercase tracking-wider font-bold cursor-pointer"
              >
                Limpar
              </button>

              <button
                type="button"
                onClick={() => setShowReserveModal(true)}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-heading text-sm uppercase tracking-wider font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reservar via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reserva e Contato WhatsApp */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowReserveModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm font-mono cursor-pointer"
            >
              ✕
            </button>

            {!reservationFeedback ? (
              <form onSubmit={handleReserveSubmit} className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <Ticket className="w-5 h-5 text-accent" />
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    Confirmar Reserva de Cotas
                  </h3>
                </div>

                <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rifa:</span>
                    <span className="font-bold text-foreground line-clamp-1">{raffle.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cotas Selecionadas:</span>
                    <span className="font-bold text-accent">{selectedNumbers.sort().join(", ")}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/50 text-sm">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-bold text-foreground">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                {/* Campos do Comprador */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                      Seu WhatsApp / Telefone *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: (45) 99999-8888"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Escolha do Vendedor para Atendimento */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                      Falar com qual vendedor?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {siteConfig.whatsappSellers.map((seller) => (
                        <button
                          key={seller.id}
                          type="button"
                          onClick={() => setSelectedSellerId(seller.id)}
                          className={`p-3 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-colors ${
                            selectedSellerId === seller.id
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div>
                            <div className="font-heading font-bold text-xs uppercase">{seller.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">WhatsApp Oficial</div>
                          </div>
                          {selectedSellerId === seller.id && (
                            <CheckCircle2 className="w-4 h-4 text-accent" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
                  ⚠️ Suas cotas ficarão pré-reservadas no sistema. Para garantir sua participação definitiva,
                  envie o comprovante de pagamento PIX no WhatsApp do vendedor.
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReserveModal(false)}
                    className="px-4 py-2 rounded-lg border border-border text-xs font-mono uppercase text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={reserving}
                    className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-heading text-xs uppercase tracking-wider font-bold hover:bg-accent/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {reserving ? (
                      "Reservando..."
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>Confirmar e Abrir WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Tela de Sucesso da Reserva */
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="font-heading text-xl font-bold uppercase text-foreground">
                  Reserva Pré-Confirmada!
                </h3>

                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  {reservationFeedback.message}
                </p>

                <div className="p-4 bg-muted/30 border border-border rounded-xl font-mono text-xs space-y-1">
                  <div className="text-muted-foreground uppercase text-[10px]">Cotas Reservadas:</div>
                  <div className="font-bold text-accent text-sm">
                    {reservationFeedback.reservedNumbers?.join(", ")}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {reservationFeedback.waUrl && (
                    <a
                      href={reservationFeedback.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Reabrir Conversa no WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleFinishAndReset}
                    className="w-full py-2.5 px-4 rounded-xl border border-border text-xs font-mono uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Concluir e Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
