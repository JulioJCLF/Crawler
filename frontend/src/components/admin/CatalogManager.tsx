"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  Layers,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Product, AdminProductListResponse, CustomProductInput } from "@/types";
import { CATALOG_CATEGORIES_METADATA } from "@/lib/pricingConfig";

interface CatalogManagerProps {
  onCatalogChanged?: () => void;
}

export function CatalogManager({ onCatalogChanged }: CatalogManagerProps) {
  // Estados do catálogo
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalHidden: 0,
    totalManual: 0,
    totalCatalog: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Estados dos filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "hidden" | "manual">("all");

  // Estados de ações
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Estados do modal de produto
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("replicas");
  const [formPriceMode, setFormPriceMode] = useState<"usd" | "brl">("brl");
  const [formUsdPrice, setFormUsdPrice] = useState("");
  const [formBrlPrice, setFormBrlPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de confirmação de ocultação com motivo
  const [hidingProduct, setHidingProduct] = useState<Product | null>(null);
  const [hideReason, setHideReason] = useState("");

  // Debounce na digitação da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Carregar produtos da API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        status: selectedStatus,
      });

      if (debouncedQuery.trim()) {
        params.set("q", debouncedQuery.trim());
      }
      if (selectedCategory && selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }

      const res = await fetch(`/api/admin/catalog/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Erro ${res.status} ao carregar catálogo`);
      }

      const data: AdminProductListResponse = await res.json();
      setProducts(data.products || []);
      setStats(data.stats || { totalActive: 0, totalHidden: 0, totalManual: 0, totalCatalog: 0 });
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("Erro ao carregar catálogo:", err);
      setFeedback({ type: "error", message: "Falha ao carregar catálogo de produtos." });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto-dismiss de feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Abertura do modal para criar novo produto
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("replicas");
    setFormPriceMode("brl");
    setFormUsdPrice("");
    setFormBrlPrice("");
    setFormImage("");
    setFormUrl("");
    setFormError(null);
    setShowModal(true);
  };

  // Abertura do modal para editar produto manual existente
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    if (typeof p.fixedBrlPrice === "number" && p.fixedBrlPrice > 0) {
      setFormPriceMode("brl");
      setFormBrlPrice(p.fixedBrlPrice.toString());
      setFormUsdPrice(p.price || "");
    } else {
      setFormPriceMode("usd");
      setFormUsdPrice(p.price || "");
      setFormBrlPrice("");
    }
    setFormImage(p.image || "");
    setFormUrl(p.url || "");
    setFormError(null);
    setShowModal(true);
  };

  // Salvar produto (criar ou atualizar)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError("O nome do produto é obrigatório.");
      return;
    }

    let priceValue: string | null = null;
    let fixedBrlValue: number | undefined = undefined;

    if (formPriceMode === "usd") {
      if (!formUsdPrice.trim()) {
        setFormError("Informe o valor em Dólar (USD).");
        return;
      }
      priceValue = formUsdPrice.trim();
      if (!priceValue.toLowerCase().startsWith("usd")) {
        priceValue = `USD ${priceValue}`;
      }
    } else {
      const parsedBrl = parseFloat(formBrlPrice.replace(",", "."));
      if (isNaN(parsedBrl) || parsedBrl <= 0) {
        setFormError("Informe um valor válido em Reais (R$).");
        return;
      }
      fixedBrlValue = parsedBrl;
      priceValue = `R$ ${parsedBrl.toFixed(2).replace(".", ",")}`;
    }

    setFormSaving(true);

    try {
      const payload: CustomProductInput = {
        name: formName.trim(),
        category: formCategory,
        price: priceValue,
        fixedBrlPrice: fixedBrlValue,
        image: formImage.trim() || null,
        url: formUrl.trim() || undefined,
        status: "active",
      };

      let res: Response;
      if (editingProduct) {
        res = await fetch("/api/admin/catalog/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/catalog/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Falha ao salvar produto.");
        return;
      }

      setShowModal(false);
      setFeedback({
        type: "success",
        message: editingProduct
          ? "Produto manual atualizado com sucesso!"
          : "Novo produto cadastrado e visível na vitrine!",
      });

      fetchProducts();
      onCatalogChanged?.();
    } catch (err: any) {
      setFormError("Erro de comunicação ao salvar produto.");
    } finally {
      setFormSaving(false);
    }
  };

  // Confirmar Ocultação de produto
  const handleConfirmHide = async () => {
    if (!hidingProduct) return;
    setActionLoadingId(hidingProduct.id);

    try {
      const res = await fetch("/api/admin/catalog/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: hidingProduct.id,
          name: hidingProduct.name,
          reason: hideReason.trim() || "Ocultado pelo lojista",
          source: hidingProduct.source || "crawler",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao ocultar");
      }

      setFeedback({
        type: "success",
        message: `"${hidingProduct.name}" foi ocultado da vitrine com sucesso.`,
      });

      setHidingProduct(null);
      setHideReason("");
      fetchProducts();
      onCatalogChanged?.();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao ocultar produto." });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Restaurar produto oculto
  const handleUnhide = async (p: Product) => {
    setActionLoadingId(p.id);
    try {
      const res = await fetch("/api/admin/catalog/unhide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao restaurar");
      }

      setFeedback({
        type: "success",
        message: `"${p.name}" foi restaurado e voltou a aparecer na vitrine!`,
      });

      fetchProducts();
      onCatalogChanged?.();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao restaurar produto." });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Excluir permanentemente produto manual
  const handleDeleteCustom = async (p: Product) => {
    if (!confirm(`Deseja realmente excluir permanentemente o produto "${p.name}"?`)) {
      return;
    }

    setActionLoadingId(p.id);
    try {
      const res = await fetch(`/api/admin/catalog/products?id=${encodeURIComponent(p.id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao excluir");
      }

      setFeedback({
        type: "success",
        message: `Produto manual "${p.name}" foi excluído permanentemente.`,
      });

      fetchProducts();
      onCatalogChanged?.();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erro ao excluir produto." });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between font-mono text-sm animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
              : "bg-destructive/15 border-destructive/40 text-destructive"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs uppercase tracking-widest hover:underline opacity-80 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Cards de Métricas do Catálogo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Total Catálogo
            </span>
            <Layers className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{stats.totalCatalog.toLocaleString("pt-BR")}</span>
            <span className="text-[10px] font-mono text-muted-foreground">itens</span>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Ativos na Vitrine
            </span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {stats.totalActive.toLocaleString("pt-BR")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">visíveis</span>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
              Ocultados / Bloqueados
            </span>
            <EyeOff className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {stats.totalHidden.toLocaleString("pt-BR")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">fora do ar</span>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400">
              Criados Manualmente
            </span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-400">
              {stats.totalManual.toLocaleString("pt-BR")}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">próprios</span>
          </div>
        </div>
      </div>

      {/* Barra de Ferramentas / Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros em linha */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todas as Categorias</option>
            {CATALOG_CATEGORIES_METADATA.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any);
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Status: Todos</option>
            <option value="active">Somente Ativos na Vitrine</option>
            <option value="hidden">Somente Ocultados</option>
            <option value="manual">Somente Manuais</option>
          </select>

          {/* Botão Atualizar */}
          <button
            onClick={fetchProducts}
            className="p-2 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
            title="Recarregar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Botão Novo Produto */}
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Carregando catálogo de produtos...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Package className="w-10 h-10 text-muted-foreground opacity-40" />
            <span className="font-heading text-base font-bold uppercase tracking-wider">
              Nenhum produto encontrado
            </span>
            <p className="font-mono text-xs text-muted-foreground max-w-md">
              Nenhum item corresponde aos filtros selecionados. Tente limpar os filtros ou buscar por outro termo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4 w-16">Foto</th>
                  <th className="py-3 px-4">Produto / Ref</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço Original</th>
                  <th className="py-3 px-4">Status Vitrine</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {products.map((p) => {
                  const isHidden = p.status === "hidden";
                  const isManual = p.source === "manual";
                  const isActing = actionLoadingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isHidden ? "opacity-60 bg-muted/10" : ""
                      }`}
                    >
                      {/* Miniatura */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded bg-muted/20 border border-border flex items-center justify-center overflow-hidden shrink-0">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-[8px] font-mono text-muted-foreground text-center">
                              SEM FOTO
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Nome e Identificação */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 max-w-md">
                          <div className="font-medium text-xs md:text-sm line-clamp-2 leading-snug">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground uppercase">
                              Ref: {p.id}
                            </span>
                            {isManual ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                                Manual
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                                Robô
                              </span>
                            )}
                            {p.url && (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                title="Abrir link original"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider bg-muted border border-border">
                          {p.categoryLabel || p.category}
                        </span>
                      </td>

                      {/* Preço */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        {p.fixedBrlPrice ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-primary">
                              R$ {p.fixedBrlPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-[10px] text-muted-foreground">Fixo em R$</span>
                          </div>
                        ) : p.price ? (
                          <div className="flex flex-col">
                            <span className="font-bold">{p.price}</span>
                            <span className="text-[10px] text-muted-foreground">Conversão dinâmica</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sob Consulta</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        {isHidden ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold">
                              <EyeOff className="w-3.5 h-3.5" />
                              Ocultado
                            </span>
                            {p.hiddenReason && (
                              <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[150px]">
                                {p.hiddenReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Eye className="w-3.5 h-3.5" />
                            Ativo na Vitrine
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ações de Ocultar / Restaurar */}
                          {isHidden ? (
                            <button
                              onClick={() => handleUnhide(p)}
                              disabled={isActing}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                              title="Restaurar para a vitrine"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Restaurar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setHidingProduct(p);
                                setHideReason("");
                              }}
                              disabled={isActing}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-400 hover:border-rose-400/30 hover:bg-rose-500/10 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                              title="Ocultar produto da vitrine"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Ocultar</span>
                            </button>
                          )}

                          {/* Se for produto manual: botões de Editar e Excluir */}
                          {isManual && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                disabled={isActing}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                                title="Editar produto"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteCustom(p)}
                                disabled={isActing}
                                className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                title="Excluir permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé de Paginação */}
        {!loading && total > 0 && (
          <div className="border-t border-border px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-card font-mono text-xs text-muted-foreground">
            <div>
              Mostrando <span className="text-foreground font-bold">{products.length}</span> de{" "}
              <span className="text-foreground font-bold">{total}</span> itens encontrados
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2">
                Página <span className="text-foreground font-bold">{page}</span> de{" "}
                <span className="text-foreground font-bold">{totalPages}</span>
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Ocultação */}
      {hidingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <EyeOff className="w-5 h-5" />
                Ocultar da Vitrine
              </h3>
              <button
                onClick={() => setHidingProduct(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              O produto <strong className="text-foreground font-semibold">"{hidingProduct.name}"</strong> (Ref: {hidingProduct.id}) será imediatamente removido da vitrine pública.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-muted-foreground">
                Motivo (opcional para controle interno):
              </label>
              <input
                type="text"
                placeholder="Ex: Fora de estoque permanente, proibido, lote esgotado..."
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setHidingProduct(null)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-mono uppercase tracking-wider hover:bg-muted transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmHide}
                disabled={Boolean(actionLoadingId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
              >
                {actionLoadingId ? "Ocultando..." : "Confirmar Ocultação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Produto Manual */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-xl space-y-5 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {editingProduct ? "Editar Produto Manual" : "Cadastrar Novo Produto"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rifle Elétrico M4 CQB Metal Hunting"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Categoria *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary uppercase tracking-wider"
                >
                  {CATALOG_CATEGORIES_METADATA.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.label} ({cat.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Modo de Preço */}
              <div className="space-y-2 bg-muted/20 border border-border p-3.5 rounded-lg">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                  Modelo de Precificação *
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setFormPriceMode("brl")}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      formPriceMode === "brl"
                        ? "bg-primary/20 border-primary text-primary font-bold shadow-sm"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Preço Fixo em Reais (R$)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormPriceMode("usd")}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      formPriceMode === "usd"
                        ? "bg-primary/20 border-primary text-primary font-bold shadow-sm"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Dólar (USD) Automático
                  </button>
                </div>

                {formPriceMode === "brl" ? (
                  <div className="space-y-1 pt-2">
                    <label className="text-[11px] font-mono text-muted-foreground">
                      Valor Final de Venda em Reais (R$):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 899.90"
                        value={formBrlPrice}
                        onChange={(e) => setFormBrlPrice(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 pt-2">
                    <label className="text-[11px] font-mono text-muted-foreground">
                      Preço Base em Dólar (USD):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                        $
                      </span>
                      <input
                        type="text"
                        placeholder="Ex: 150.00"
                        value={formUsdPrice}
                        onChange={(e) => setFormUsdPrice(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      O valor em R$ será calculado automaticamente com a cotação e a margem da categoria.
                    </span>
                  </div>
                )}
              </div>

              {/* Imagem */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  URL da Imagem (opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto-do-produto.jpg"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />

                {formImage && (
                  <div className="mt-2 flex items-center gap-3 p-2 border border-border rounded-lg bg-muted/20">
                    <div className="w-12 h-12 rounded bg-background border flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Pré-visualização da imagem
                    </span>
                  </div>
                )}
              </div>

              {/* Link Original / Destino */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Link Externo do Produto (opcional)
                </label>
                <input
                  type="url"
                  placeholder="Deixe em branco para direcionar direto ao WhatsApp oficial"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-mono uppercase tracking-wider hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {formSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? "Atualizar Produto" : "Salvar Produto"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
