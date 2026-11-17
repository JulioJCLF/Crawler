"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Ticket,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  DollarSign,
  Trophy,
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Calendar,
  MessageCircle,
  Users,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { Raffle, QuotaEntry, CreateRaffleInput, FederalDrawResult } from "@/types";

export function RaffleManager() {
  const [loading, setLoading] = useState(true);
  const [raffles, setRaffles] = useState<(Raffle & { stats?: any })[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [quotas, setQuotas] = useState<QuotaEntry[]>([]);
  const [loadingQuotas, setLoadingQuotas] = useState(false);

  // Filtros de cotas na rifa selecionada
  const [quotaFilter, setQuotaFilter] = useState<"all" | "available" | "reserved" | "paid">("all");
  const [quotaSearch, setQuotaSearch] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

  // Feedback e Toasts
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal de Criação / Edição de Rifa
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formTotalQuotas, setFormTotalQuotas] = useState<100 | 1000>(100);
  const [formDrawDate, setFormDrawDate] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formImageMode, setFormImageMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal de Apuração da Loteria Federal
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [drawingRaffle, setDrawingRaffle] = useState<Raffle | null>(null);
  const [drawContest, setDrawContest] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [draw1st, setDraw1st] = useState("");
  const [draw2nd, setDraw2nd] = useState("");
  const [draw3rd, setDraw3rd] = useState("");
  const [draw4th, setDraw4th] = useState("");
  const [draw5th, setDraw5th] = useState("");
  const [drawSubmitting, setDrawSubmitting] = useState(false);
  const [drawSuccessResult, setDrawSuccessResult] = useState<FederalDrawResult | null>(null);

  // Modal de Reserva Manual pelo Admin
  const [showManualReserveModal, setShowManualReserveModal] = useState(false);
  const [manualNumber, setManualNumber] = useState<string>("");
  const [manualBuyerName, setManualBuyerName] = useState("");
  const [manualBuyerPhone, setManualBuyerPhone] = useState("");

  // Carregar lista de rifas
  const fetchRaffles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/raffles");
      if (!res.ok) throw new Error("Falha ao carregar rifas");
      const data = await res.json();
      setRaffles(data.raffles || []);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao carregar rifas." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRaffles();
  }, [fetchRaffles]);

  // Carregar cotas de uma rifa selecionada
  const loadQuotas = async (raffleId: string) => {
    setLoadingQuotas(true);
    setSelectedNumbers([]);
    try {
      const res = await fetch(`/api/admin/raffles/${raffleId}`);
      if (!res.ok) throw new Error("Falha ao carregar cotas");
      const data = await res.json();
      setSelectedRaffle(data.raffle);
      setQuotas(data.quotas || []);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao carregar cotas." });
    } finally {
      setLoadingQuotas(false);
    }
  };

  // Upload de Imagem
  const handleImageFileChange = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/catalog/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar foto.");
      setFormImage(data.url);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao fazer upload da imagem." });
    } finally {
      setUploadingImage(false);
    }
  };

  // Abrir Modal de Criação
  const handleOpenCreateRaffle = () => {
    setEditingRaffle(null);
    setFormTitle("");
    setFormDescription("");
    setFormPrice("25.00");
    setFormTotalQuotas(100);
    setFormDrawDate("");
    setFormImage("");
    setFormImageMode("upload");
    setShowRaffleModal(true);
  };

  // Salvar Rifa
  const handleSaveRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFeedback({ type: "error", message: "O título da rifa é obrigatório." });
      return;
    }
    const parsedPrice = parseFloat(formPrice.replace(",", "."));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFeedback({ type: "error", message: "Informe um valor de cota válido." });
      return;
    }
    if (!formImage.trim()) {
      setFeedback({ type: "error", message: "A foto do prêmio é obrigatória." });
      return;
    }

    setActionLoading(true);
    try {
      const payload: CreateRaffleInput = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        pricePerQuota: parsedPrice,
        totalQuotas: formTotalQuotas,
        drawDate: formDrawDate.trim() || undefined,
        image: formImage.trim(),
      };

      let res: Response;
      if (editingRaffle) {
        res = await fetch(`/api/admin/raffles/${editingRaffle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/raffles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao salvar rifa.");

      setShowRaffleModal(false);
      setFeedback({
        type: "success",
        message: editingRaffle ? "Rifa atualizada com sucesso!" : "Nova rifa criada e aberta para apostas!",
      });
      fetchRaffles();
      if (selectedRaffle && selectedRaffle.id === data.raffle?.id) {
        setSelectedRaffle(data.raffle);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao salvar rifa." });
    } finally {
      setActionLoading(false);
    }
  };

  // Excluir Rifa
  const handleDeleteRaffle = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a rifa "${title}" e todas as suas cotas? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/raffles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao excluir.");

      setFeedback({ type: "success", message: "Rifa e cotas excluídas com sucesso." });
      if (selectedRaffle?.id === id) {
        setSelectedRaffle(null);
      }
      fetchRaffles();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao excluir." });
    } finally {
      setActionLoading(false);
    }
  };

  // Ações de Cotas (Pagar, Liberar)
  const handleQuotasAction = async (action: "pay" | "release", numbers: string[]) => {
    if (!selectedRaffle || numbers.length === 0) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/raffles/${selectedRaffle.id}/quotas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, numbers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao processar cotas.");

      setFeedback({ type: "success", message: data.message });
      loadQuotas(selectedRaffle.id);
      fetchRaffles();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao atualizar cotas." });
    } finally {
      setActionLoading(false);
    }
  };

  // Reserva Manual pelo Admin
  const handleConfirmManualReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRaffle || !manualNumber) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/raffles/${selectedRaffle.id}/quotas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reserve_manual",
          numbers: [manualNumber],
          customer: {
            name: manualBuyerName.trim(),
            phone: manualBuyerPhone.trim(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na reserva manual.");

      setShowManualReserveModal(false);
      setFeedback({ type: "success", message: `Cota ${manualNumber} reservada para ${manualBuyerName}!` });
      loadQuotas(selectedRaffle.id);
      fetchRaffles();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao reservar." });
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir Modal de Apuração da Loteria Federal
  const handleOpenDrawModal = (raffle: Raffle) => {
    setDrawingRaffle(raffle);
    setDrawContest(raffle.federalLotteryContest || "");
    setDrawDate(raffle.drawDate || new Date().toISOString().slice(0, 10));
    setDraw1st("");
    setDraw2nd("");
    setDraw3rd("");
    setDraw4th("");
    setDraw5th("");
    setDrawSuccessResult(null);
    setShowDrawModal(true);
  };

  // Executar Apuração da Loteria Federal
  const handleExecuteDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawingRaffle) return;

    if (!drawContest.trim()) {
      setFeedback({ type: "error", message: "Informe o número do concurso da Loteria Federal." });
      return;
    }
    if (!draw1st.trim()) {
      setFeedback({ type: "error", message: "Informe o bilhete sorteado do 1º Prêmio." });
      return;
    }

    setDrawSubmitting(true);
    try {
      const res = await fetch(`/api/admin/raffles/${drawingRaffle.id}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestNumber: drawContest.trim(),
          drawDate: drawDate.trim(),
          firstPrize: draw1st.trim(),
          secondPrize: draw2nd.trim() || undefined,
          thirdPrize: draw3rd.trim() || undefined,
          fourthPrize: draw4th.trim() || undefined,
          fifthPrize: draw5th.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na apuração.");

      setDrawSuccessResult(data.result);
      setFeedback({
        type: "success",
        message: `Sorteio realizado! Ganhador(a): ${data.result?.winner?.name} (Cota ${data.result?.winningQuota}).`,
      });
      fetchRaffles();
      if (selectedRaffle && selectedRaffle.id === drawingRaffle.id) {
        loadQuotas(selectedRaffle.id);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro na apuração do sorteio." });
    } finally {
      setDrawSubmitting(false);
    }
  };

  // Filtragem de cotas na tela
  const filteredQuotas = quotas.filter((q) => {
    if (quotaFilter !== "all" && q.status !== quotaFilter) return false;
    if (quotaSearch.trim()) {
      const s = quotaSearch.toLowerCase();
      const matchNum = q.number.includes(s);
      const matchName = q.customerName?.toLowerCase().includes(s);
      const matchPhone = q.customerPhone?.includes(s);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  // Estatísticas gerais
  const totalRafflesActive = raffles.filter((r) => r.status === "active").length;
  const totalRevenueAll = raffles.reduce((acc, r) => acc + (r.stats?.totalRevenue || 0), 0);
  const totalPaidAll = raffles.reduce((acc, r) => acc + (r.stats?.paidCount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Topo / Banner de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Rifas Ativas
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-primary">{totalRafflesActive}</span>
              <span className="text-[10px] font-mono text-muted-foreground">no ar</span>
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Receita Arrecadada
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenueAll)}
              </span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Cotas Confirmadas
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">{totalPaidAll}</span>
              <span className="text-[10px] font-mono text-muted-foreground">pagas</span>
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Apuração Oficial
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-sm font-bold font-mono text-accent">Loteria Federal</span>
            </div>
          </div>
          <div className="p-3 bg-accent/10 rounded-xl text-accent">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Alerta de feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : "bg-destructive/15 border-destructive/40 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-70 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Ações: Criar Rifa e Ver Vitrine */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <span>Campanhas de Rifas</span>
          </h3>
          <p className="text-xs font-mono text-muted-foreground">
            Gerencie bilhetes, aprove pagamentos do WhatsApp e apure os vencedores pela Caixa
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/rifas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border rounded-xl hover:bg-muted text-xs font-mono uppercase tracking-wider font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Vitrine /rifas</span>
          </a>

          <button
            onClick={fetchRaffles}
            className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateRaffle}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 shadow-md transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Rifa</span>
          </button>
        </div>
      </div>

      {/* Grid de Rifas */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Carregando rifas cadastradas...
          </span>
        </div>
      ) : raffles.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-full bg-muted border border-border text-muted-foreground">
            <Ticket className="w-8 h-8 text-primary" />
          </div>
          <span className="font-heading text-base font-bold uppercase tracking-wider">
            Nenhuma rifa cadastrada
          </span>
          <p className="font-mono text-xs text-muted-foreground max-w-sm">
            Clique no botão acima para criar sua primeira campanha de rifa interna para sortear uma réplica ou equipamento especial.
          </p>
          <button
            onClick={handleOpenCreateRaffle}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeira Rifa</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((raffle) => {
            const stats = raffle.stats || {
              totalQuotas: raffle.totalQuotas,
              paidCount: 0,
              reservedCount: 0,
              availableCount: raffle.totalQuotas,
              percentPaid: 0,
              totalRevenue: 0,
            };
            const isCompleted = raffle.status === "completed";
            const isSelected = selectedRaffle?.id === raffle.id;

            return (
              <div
                key={raffle.id}
                className={`bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                  isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                }`}
              >
                <div>
                  {/* Foto e Badges */}
                  <div className="relative h-48 bg-muted/20 border-b border-border flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={raffle.image}
                      alt={raffle.title}
                      className="w-full h-full object-contain p-3 transition-transform"
                    />

                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                      {isCompleted ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-amber-500 text-black font-bold border border-amber-400 flex items-center gap-1 shadow-sm">
                          <Trophy className="w-3 h-3" />
                          Concluída
                        </span>
                      ) : raffle.status === "awaiting_draw" ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 backdrop-blur-xs">
                          Aguardando Sorteio
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 backdrop-blur-xs">
                          Ao Vivo
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-background/90 backdrop-blur-xs border border-border text-foreground font-bold shadow-xs">
                        {raffle.totalQuotas} Cotas
                      </span>
                    </div>

                    <div className="absolute top-3.5 right-3.5">
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-primary text-primary-foreground shadow-md">
                        R$ {raffle.pricePerQuota.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="font-heading text-base font-bold uppercase tracking-wider line-clamp-1">
                        {raffle.title}
                      </h4>
                      {raffle.drawDate && (
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-primary" />
                          Extração prevista: {raffle.drawDate}
                        </span>
                      )}
                    </div>

                    {/* Vencedor (se concluída) */}
                    {isCompleted && raffle.drawResults && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold flex items-center gap-1 text-amber-300">
                            <Trophy className="w-3.5 h-3.5" />
                            Ganhador(a):
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black font-bold text-[10px]">
                            Cota {raffle.drawResults.winningQuota} ({raffle.drawResults.prizeOrigin})
                          </span>
                        </div>
                        <p className="text-xs font-bold font-heading uppercase text-foreground">
                          {raffle.drawResults.winner.name}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                          Concurso Federal nº {raffle.drawResults.contestNumber}
                        </p>
                      </div>
                    )}

                    {/* Progresso de Vendas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">Progresso de Cotas</span>
                        <span className="font-bold text-foreground">{stats.percentPaid}% pago</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 rounded-full"
                          style={{ width: `${stats.percentPaid}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>{stats.paidCount} pagas</span>
                        <span>{stats.reservedCount} reservadas</span>
                        <span>{stats.availableCount} livres</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rodapé de Ações do Card */}
                <div className="px-5 py-3.5 border-t border-border flex items-center justify-between gap-2 bg-muted/10">
                  <button
                    onClick={() => loadQuotas(raffle.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isSelected ? "Gerenciando" : "Gerenciar Cotas"}</span>
                  </button>

                  {!isCompleted && (
                    <button
                      onClick={() => handleOpenDrawModal(raffle)}
                      className="py-2 px-3 rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer"
                      title="Apurar resultado pela Loteria Federal"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteRaffle(raffle.id, raffle.title)}
                    className="p-2 rounded-xl border border-destructive/30 hover:bg-destructive/15 text-destructive transition-colors cursor-pointer"
                    title="Excluir rifa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Painel Detalhado de Cotas da Rifa Selecionada */}
      {selectedRaffle && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                  Gerenciamento de Cotas
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Ref: {selectedRaffle.id}
                </span>
              </div>
              <h3 className="font-heading text-xl font-bold uppercase tracking-wider mt-1">
                {selectedRaffle.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {!selectedRaffle.drawResults && (
                <button
                  onClick={() => handleOpenDrawModal(selectedRaffle)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 shadow-sm cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Apurar Loteria Federal</span>
                </button>
              )}
              <button
                onClick={() => setSelectedRaffle(null)}
                className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filtros da Grade de Cotas */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border text-xs font-mono overflow-x-auto">
              <button
                onClick={() => setQuotaFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  quotaFilter === "all" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Todas ({quotas.length})
              </button>
              <button
                onClick={() => setQuotaFilter("paid")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  quotaFilter === "paid" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pagas ({quotas.filter((q) => q.status === "paid").length})
              </button>
              <button
                onClick={() => setQuotaFilter("reserved")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  quotaFilter === "reserved" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Reservadas ({quotas.filter((q) => q.status === "reserved").length})
              </button>
              <button
                onClick={() => setQuotaFilter("available")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  quotaFilter === "available" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Livres ({quotas.filter((q) => q.status === "available").length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar número ou comprador..."
                value={quotaSearch}
                onChange={(e) => setQuotaSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Barra de Ações em Lote */}
          {selectedNumbers.length > 0 && (
            <div className="p-3 bg-muted/60 border border-border rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
              <span className="font-bold">
                {selectedNumbers.length} cota(s) selecionada(s): {selectedNumbers.join(", ")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuotasAction("pay", selectedNumbers)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Confirmar Pagamento
                </button>
                <button
                  onClick={() => handleQuotasAction("release", selectedNumbers)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted cursor-pointer"
                >
                  Liberar
                </button>
                <button
                  onClick={() => setSelectedNumbers([])}
                  className="px-2 py-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Desmarcar
                </button>
              </div>
            </div>
          )}

          {/* Grade Visual de Cotas */}
          {loadingQuotas ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span className="font-mono text-xs text-muted-foreground">Carregando mapa de cotas...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-20 gap-1.5 max-h-[460px] overflow-y-auto p-2 border border-border/60 rounded-xl bg-background/50">
                {filteredQuotas.map((q) => {
                  const isPaid = q.status === "paid";
                  const isReserved = q.status === "reserved";
                  const isChecked = selectedNumbers.includes(q.number);
                  const isWinner = selectedRaffle.drawResults?.winningQuota === q.number;

                  return (
                    <button
                      key={q.number}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedNumbers(selectedNumbers.filter((n) => n !== q.number));
                        } else {
                          setSelectedNumbers([...selectedNumbers, q.number]);
                        }
                      }}
                      className={`h-11 rounded-lg border font-mono text-xs flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                        isWinner
                          ? "bg-amber-400 text-black font-extrabold border-amber-300 ring-2 ring-amber-400 shadow-md animate-pulse"
                          : isChecked
                          ? "ring-2 ring-primary border-primary bg-primary/20 text-primary font-bold"
                          : isPaid
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400"
                          : isReserved
                          ? "bg-amber-950/40 border-amber-500/40 text-amber-300 hover:border-amber-400"
                          : "bg-muted/30 border-border text-muted-foreground hover:border-primary hover:text-foreground"
                      }`}
                      title={`${q.number} - ${q.status.toUpperCase()}${q.customerName ? ` (${q.customerName})` : ""}`}
                    >
                      <span className="font-bold">{q.number}</span>
                      <span className="text-[8px] uppercase tracking-tighter opacity-80 leading-none">
                        {isWinner ? "Ganhador" : isPaid ? "Pago" : isReserved ? "Reserva" : "Livre"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tabela de Participantes e Compradores */}
              <div className="border border-border rounded-xl overflow-hidden mt-6">
                <div className="bg-muted/40 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Participantes com Cotas Reservadas / Pagas
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Total de compradores:{" "}
                    {new Set(quotas.filter((q) => q.customerName).map((q) => q.customerPhone || q.customerName)).size}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                        <th className="py-2.5 px-4">Cota</th>
                        <th className="py-2.5 px-4">Nome do Participante</th>
                        <th className="py-2.5 px-4">WhatsApp</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Ação Rápida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {quotas
                        .filter((q) => q.customerName)
                        .map((q) => {
                          const isPaid = q.status === "paid";
                          return (
                            <tr key={q.number} className="hover:bg-muted/20">
                              <td className="py-2 px-4 font-bold text-foreground">
                                {q.number}
                              </td>
                              <td className="py-2 px-4 text-foreground font-sans font-medium">
                                {q.customerName}
                              </td>
                              <td className="py-2 px-4">
                                {q.customerPhone ? (
                                  <a
                                    href={`https://wa.me/55${q.customerPhone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>{q.customerPhone}</span>
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                {isPaid ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                    Pago
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                                    Aguardando PIX
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-4 text-right">
                                {isPaid ? (
                                  <button
                                    onClick={() => handleQuotasAction("release", [q.number])}
                                    className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                                  >
                                    Liberar cota
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleQuotasAction("pay", [q.number])}
                                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                                    >
                                      Aprovar Pagamento
                                    </button>
                                    <button
                                      onClick={() => handleQuotasAction("release", [q.number])}
                                      className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação / Edição de Rifa */}
      {showRaffleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider">
                    {editingRaffle ? "Editar Rifa" : "Criar Nova Rifa Interna"}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    Sorteio oficial apurado pela Loteria Federal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRaffleModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRaffle} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Título do Prêmio da Rifa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rifa Especial Rifle Amoeba M4 CQB Metal"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Quantidade de Cotas e Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Quantidade de Cotas *
                  </label>
                  <select
                    value={formTotalQuotas}
                    onChange={(e) => setFormTotalQuotas(Number(e.target.value) as 100 | 1000)}
                    disabled={Boolean(editingRaffle)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value={100}>100 Cotas (01 a 100 - Dezena Federal)</option>
                    <option value={1000}>1.000 Cotas (001 a 1000 - Centena Federal)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Valor por Cota (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-primary font-bold">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="25.00"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Data Prevista do Sorteio */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Data Prevista do Sorteio (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 28/11/2026 ou 'Ao atingir 100% das cotas pagas'"
                  value={formDrawDate}
                  onChange={(e) => setFormDrawDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Foto do Prêmio */}
              <div className="space-y-3 bg-muted/20 border border-border p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span>Foto do Prêmio</span>
                  </label>
                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setFormImageMode("upload")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        formImageMode === "upload" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormImageMode("url")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        formImageMode === "url" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"
                      }`}
                    >
                      Link URL
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFileChange(e.target.files[0]);
                    }
                  }}
                />

                {formImageMode === "upload" ? (
                  formImage ? (
                    <div className="flex items-center gap-3 p-2.5 bg-background border border-border rounded-xl">
                      <div className="w-16 h-16 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formImage} alt="Prévia" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Foto vinculada</span>
                        <p className="text-xs font-mono text-muted-foreground truncate">{formImage}</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-mono text-primary hover:underline mt-1 cursor-pointer"
                        >
                          Trocar foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-primary rounded-xl p-5 text-center cursor-pointer flex flex-col items-center gap-2"
                    >
                      <UploadCloud className="w-6 h-6 text-primary" />
                      <span className="text-xs font-mono text-muted-foreground">
                        {uploadingImage ? "Enviando imagem..." : "Clique para selecionar foto do prêmio"}
                      </span>
                    </div>
                  )
                ) : (
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto-do-premio.jpg"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Descrição e Itens Inclusos
                </label>
                <textarea
                  rows={4}
                  placeholder={`Insira os detalhes do equipamento, especificações, acompanhamentos e regras do frete.\nExemplo:\n- Acompanha bateria e carregador\n- Frete grátis para todo o Brasil`}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowRaffleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-mono uppercase tracking-wider hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Salvando..." : editingRaffle ? "Atualizar Rifa" : "Salvar e Ativar Rifa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Apuração da Loteria Federal */}
      {showDrawModal && drawingRaffle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 my-6 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider">
                    Apuração - Loteria Federal
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    {drawingRaffle.title} ({drawingRaffle.totalQuotas} Cotas)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resultado de Sucesso da Apuração */}
            {drawSuccessResult ? (
              <div className="space-y-5 text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/40">
                <div className="p-3 bg-amber-400 text-black rounded-full w-14 h-14 mx-auto flex items-center justify-center shadow-lg animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                    Temos um(a) Ganhador(a)!
                  </span>
                  <h4 className="text-2xl font-bold font-heading uppercase text-foreground">
                    {drawSuccessResult.winner.name}
                  </h4>
                  <p className="text-sm font-mono text-primary font-bold">
                    Cota Vencedora: #{drawSuccessResult.winningQuota} ({drawSuccessResult.prizeOrigin})
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    Concurso da Caixa nº {drawSuccessResult.contestNumber}
                  </p>
                </div>

                <div className="pt-3 flex flex-col gap-2">
                  {drawSuccessResult.winner.phone && (
                    <a
                      href={`https://wa.me/55${drawSuccessResult.winner.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `🎉 Parabéns ${drawSuccessResult.winner.name}! Você é o grande ganhador da ${drawingRaffle.title} com a cota ${drawSuccessResult.winningQuota} apurada pelo ${drawSuccessResult.prizeOrigin} da Loteria Federal!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-md transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Parabenizar Ganhador no WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={() => setShowDrawModal(false)}
                    className="px-4 py-2 border border-border rounded-xl text-xs font-mono uppercase text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Fechar e Ver Rifa Atualizada
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteDraw} className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs font-mono space-y-1 text-muted-foreground">
                  <p className="font-bold text-foreground">Como funciona o critério da Loteria Federal:</p>
                  <p>
                    • Para {drawingRaffle.totalQuotas} cotas, o sistema analisa os{" "}
                    <strong>{drawingRaffle.totalQuotas === 100 ? "2 últimos dígitos (dezena)" : "3 últimos dígitos (centena)"}</strong>{" "}
                    do 1º Prêmio da Caixa.
                  </p>
                  <p>
                    • Se a cota do 1º prêmio não foi paga, o sistema verifica automaticamente a suplência do 2º ao 5º prêmio.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                      Nº do Concurso *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 5912"
                      value={drawContest}
                      onChange={(e) => setDrawContest(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-muted-foreground uppercase font-bold">
                      Data da Extração
                    </label>
                    <input
                      type="date"
                      value={drawDate}
                      onChange={(e) => setDrawDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Bilhetes dos Prêmios da Caixa */}
                <div className="space-y-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-muted-foreground uppercase font-bold flex items-center justify-between">
                      <span>1º Prêmio da Caixa *</span>
                      <span className="text-primary text-[10px]">Principal</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 73948 (Cota final: 48)"
                      value={draw1st}
                      onChange={(e) => setDraw1st(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-muted-foreground uppercase">
                      2º Prêmio (Suplência 1)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 14823"
                      value={draw2nd}
                      onChange={(e) => setDraw2nd(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-muted-foreground uppercase">
                      3º Prêmio (Suplência 2)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 55012"
                      value={draw3rd}
                      onChange={(e) => setDraw3rd(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-muted-foreground uppercase">
                        4º Prêmio (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 89234"
                        value={draw4th}
                        onChange={(e) => setDraw4th(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-muted-foreground uppercase">
                        5º Prêmio (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 04567"
                        value={draw5th}
                        onChange={(e) => setDraw5th(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowDrawModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-mono uppercase tracking-wider hover:bg-muted cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={drawSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {drawSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Apurar Vencedor Oficial</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
