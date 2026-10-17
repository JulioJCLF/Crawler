"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Percent,
  Save,
  RefreshCw,
  LogOut,
  Store,
  Calculator,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  ChevronRight,
  TrendingUp,
  Package,
  Lock,
  Mail,
  Users,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { CatalogManager } from "@/components/admin/CatalogManager";
import { PricingConfig, UserRole, AuthUser } from "@/types";
import {
  DEFAULT_PRICING_CONFIG,
  CATALOG_CATEGORIES_METADATA,
  markupToPercent,
  percentToMarkup,
  calculateBRLPrice,
} from "@/lib/pricingConfig";

// Amostra de produtos reais para o simulador ao vivo
const SAMPLE_PRODUCTS = [
  {
    id: "8345",
    name: "AMOEBA AEG M4 AM-014 CARBINE AIRSOFT RIFLE BLACK",
    category: "replicas",
    categoryLabel: "Réplicas",
    usdPrice: "USD 210,00",
  },
  {
    id: "9102",
    name: "MAGAZINE MID-CAP M4 140 BBS POLÍMERO PRETO",
    category: "magazines",
    categoryLabel: "Magazines",
    usdPrice: "USD 18,50",
  },
  {
    id: "5420",
    name: "BBs 0.25G BIODEGRADÁVEIS 4000 UNIDADES PRECISION",
    category: "bbs",
    categoryLabel: "BBs",
    usdPrice: "USD 15,00",
  },
  {
    id: "7741",
    name: "BUCKING MAPLE LEAF AUTOBOT 70 GRAUS AEG",
    category: "buckings",
    categoryLabel: "Buckings",
    usdPrice: "USD 12,00",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  // Estados de autenticação e perfil
  const [authLoading, setAuthLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<UserRole>("master");
  const [adminEmail, setAdminEmail] = useState<string>("");

  // Estados de precificação
  const [exchangeRateInput, setExchangeRateInput] = useState<string>("5.50");
  const [defaultMarginPercent, setDefaultMarginPercent] = useState<number>(50);
  const [categoryMargins, setCategoryMargins] = useState<Record<string, number>>({});
  const [lastSaved, setLastSaved] = useState<PricingConfig | null>(null);

  // Estados da interface
  const [activeTab, setActiveTab] = useState<"catalog" | "pricing">("catalog");
  const [categorySearch, setCategorySearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estados do Simulador
  const [simUsd, setSimUsd] = useState<string>("100.00");
  const [simCategory, setSimCategory] = useState<string>("replicas");

  // Estados do modal de senha e acessos
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalTab, setModalTab] = useState<"self" | "users">("self");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Estados de gestão de usuários (apenas Master)
  const [managedUsers, setManagedUsers] = useState<AuthUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [targetResetUser, setTargetResetUser] = useState<string>("cambio");
  const [targetNewPassword, setTargetNewPassword] = useState("");
  const [editingEmailUser, setEditingEmailUser] = useState<string | null>(null);
  const [editEmailValue, setEditEmailValue] = useState("");

  // 1. Verificar Autenticação
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setAdminUser(data.user?.username || "admin");
          const role: UserRole = data.user?.role === "dolar_operator" ? "dolar_operator" : "master";
          setAdminRole(role);
          setAdminEmail(data.user?.email || "");

          if (role === "master") {
            setActiveTab("catalog");
          } else {
            setActiveTab("pricing");
          }
          setAuthLoading(false);
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [router]);

  // Carregar lista de usuários para gestão pelo Master
  const loadManagedUsers = async () => {
    if (adminRole !== "master") return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/auth/change-password");
      if (res.ok) {
        const data = await res.json();
        setManagedUsers(data.users || []);
      }
    } catch (err) {
      console.error("Falha ao carregar usuários:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showPasswordModal && adminRole === "master" && modalTab === "users") {
      loadManagedUsers();
    }
  }, [showPasswordModal, modalTab, adminRole]);

  // 2. Carregar configuração atual de preços
  const loadPricingConfig = async () => {
    try {
      const res = await fetch("/api/pricing");
      if (res.ok) {
        const config: PricingConfig = await res.json();
        setLastSaved(config);
        setExchangeRateInput(config.exchangeRate.toString());
        setDefaultMarginPercent(markupToPercent(config.defaultMarkup));

        const catMap: Record<string, number> = {};
        for (const cat of CATALOG_CATEGORIES_METADATA) {
          const markup = config.categoryMarkups[cat.slug] ?? config.defaultMarkup;
          catMap[cat.slug] = markupToPercent(markup);
        }
        setCategoryMargins(catMap);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error("Falha ao carregar precificação:", err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadPricingConfig();
    }
  }, [authLoading]);

  // Configuração atual em tempo real para os cálculos
  const activeWorkingConfig: PricingConfig = useMemo(() => {
    const rate = parseFloat(exchangeRateInput) || 5.50;
    const defMarkup = percentToMarkup(defaultMarginPercent);
    const catMarkups: Record<string, number> = {};

    for (const [slug, percent] of Object.entries(categoryMargins)) {
      catMarkups[slug] = percentToMarkup(percent);
    }
    catMarkups["default"] = defMarkup;

    return {
      exchangeRate: rate,
      defaultMarkup: defMarkup,
      categoryMarkups: catMarkups,
    };
  }, [exchangeRateInput, defaultMarginPercent, categoryMargins]);

  // Manipuladores de alteração
  const handleExchangeRateChange = (val: string) => {
    setExchangeRateInput(val);
    setHasUnsavedChanges(true);
  };

  const handleDefaultMarginChange = (percent: number) => {
    if (adminRole === "dolar_operator") return;
    setDefaultMarginPercent(percent);
    setHasUnsavedChanges(true);
  };

  const handleCategoryMarginChange = (slug: string, percent: number) => {
    if (adminRole === "dolar_operator") return;
    setCategoryMargins((prev) => ({
      ...prev,
      [slug]: percent,
    }));
    setHasUnsavedChanges(true);
  };

  const applyDefaultToAllCategories = () => {
    if (adminRole === "dolar_operator") return;
    const updated: Record<string, number> = {};
    for (const cat of CATALOG_CATEGORIES_METADATA) {
      updated[cat.slug] = defaultMarginPercent;
    }
    setCategoryMargins(updated);
    setHasUnsavedChanges(true);
    setFeedback({
      type: "success",
      message: `Margem padrão de ${defaultMarginPercent}% aplicada em todas as categorias. Não esqueça de salvar.`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 3. Salvar no Servidor
  const handleSave = async () => {
    const rate = parseFloat(exchangeRateInput);
    if (isNaN(rate) || rate <= 0) {
      setFeedback({ type: "error", message: "Informe uma cotação de dólar válida (maior que zero)." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const isDolarOnly = adminRole === "dolar_operator";
    const payload: Partial<PricingConfig> = isDolarOnly
      ? { exchangeRate: rate }
      : {
          exchangeRate: rate,
          defaultMarkup: percentToMarkup(defaultMarginPercent),
          categoryMarkups: activeWorkingConfig.categoryMarkups,
        };

    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Erro ao salvar precificação." });
        setSaving(false);
        return;
      }

      setLastSaved(data.config);
      setHasUnsavedChanges(false);
      setFeedback({
        type: "success",
        message: isDolarOnly
          ? "Cotação do Dólar atualizada com sucesso! A vitrine já calcula com a nova taxa."
          : "Valores e porcentagens salvos com sucesso! A vitrine já reflete as novas regras.",
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch {
      setFeedback({ type: "error", message: "Erro de rede ao salvar as alterações." });
    } finally {
      setSaving(false);
    }
  };

  // 4. Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  // 5. Alteração da própria senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    setChangingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordFeedback({ type: "error", message: data.error || "Erro ao trocar senha." });
        setChangingPassword(false);
        return;
      }

      setPasswordFeedback({ type: "success", message: "Sua senha foi alterada com sucesso!" });
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setPasswordFeedback(null);
      }, 1800);
    } catch {
      setPasswordFeedback({ type: "error", message: "Erro de rede ao trocar senha." });
    } finally {
      setChangingPassword(false);
    }
  };

  // 6. Admin Master redefinindo senha de outro usuário
  const handleMasterResetTargetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    setChangingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUsername: targetResetUser,
          newPassword: targetNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordFeedback({ type: "error", message: data.error || "Erro ao redefinir senha." });
        setChangingPassword(false);
        return;
      }

      setPasswordFeedback({
        type: "success",
        message: `Senha do usuário '${targetResetUser}' redefinida com sucesso!`,
      });
      setTargetNewPassword("");
      setTimeout(() => setPasswordFeedback(null), 3500);
    } catch {
      setPasswordFeedback({ type: "error", message: "Erro ao processar redefinição." });
    } finally {
      setChangingPassword(false);
    }
  };

  // 7. Admin Master atualizando e-mail de recuperação
  const handleSaveUserEmail = async (targetUsername: string) => {
    if (!editEmailValue || !editEmailValue.includes("@")) {
      setPasswordFeedback({ type: "error", message: "Informe um e-mail válido." });
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_email",
          targetUsername,
          newEmail: editEmailValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordFeedback({ type: "error", message: data.error || "Erro ao atualizar e-mail." });
        return;
      }

      setPasswordFeedback({
        type: "success",
        message: `E-mail de '${targetUsername}' atualizado com sucesso.`,
      });
      setEditingEmailUser(null);
      setEditEmailValue("");
      loadManagedUsers();
      setTimeout(() => setPasswordFeedback(null), 3500);
    } catch {
      setPasswordFeedback({ type: "error", message: "Erro de conexão ao salvar e-mail." });
    }
  };

  // Categorias filtradas pela busca
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return CATALOG_CATEGORIES_METADATA;
    const q = categorySearch.toLowerCase();
    return CATALOG_CATEGORIES_METADATA.filter(
      (c) => c.label.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categorySearch]);

  // Cálculo da simulação em tempo real
  const simResult = useMemo(() => {
    const usd = parseFloat(simUsd) || 0;
    const rate = parseFloat(exchangeRateInput) || 5.50;
    const margin = categoryMargins[simCategory] ?? defaultMarginPercent;
    const markup = percentToMarkup(margin);

    const baseBrl = usd * rate;
    const finalBrl = baseBrl * markup;
    const marginValueBrl = finalBrl - baseBrl;

    const formattedFinal = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(finalBrl);

    const formattedBase = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(baseBrl);

    const formattedMargin = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(marginValueBrl);

    return {
      usd,
      rate,
      margin,
      markup,
      baseBrl,
      marginValueBrl,
      finalBrl,
      formattedFinal,
      formattedBase,
      formattedMargin,
    };
  }, [simUsd, simCategory, exchangeRateInput, categoryMargins, defaultMarginPercent]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="font-mono text-xs uppercase tracking-widest text-accent flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
          Verificando permissões...
        </div>
      </div>
    );
  }

  const isDolarOnly = adminRole === "dolar_operator";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Barra de Navegação Superior */}
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-card border border-border p-1.5 flex items-center justify-center">
              <Logo className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold tracking-wider uppercase block leading-none">
                  Hunting World Admin
                </span>
                {adminRole === "master" ? (
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 text-[10px] font-mono font-bold uppercase">
                    Master
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
                    Operador Câmbio
                  </span>
                )}
              </div>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {adminUser ? `Conectado como: ${adminUser}` : "Gestão de Fluxo de Valores"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-mono uppercase tracking-wider hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Vitrine</span>
            </Link>

            <button
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordFeedback(null);
                setModalTab("self");
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-mono uppercase tracking-wider hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {adminRole === "master" ? "Acessos & Senhas" : "Minha Senha"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-destructive/30 text-xs font-mono uppercase tracking-wider hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navegação por Abas Principais */}
        <div className="flex border-b border-border space-x-2">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-heading text-sm uppercase tracking-wider font-bold transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Gerenciador de Catálogo</span>
            {adminRole === "dolar_operator" && (
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-mono">
                Master
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("pricing")}
            className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-heading text-sm uppercase tracking-wider font-bold transition-all cursor-pointer ${
              activeTab === "pricing"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Precificação e Câmbio</span>
          </button>
        </div>

        {activeTab === "catalog" ? (
          adminRole === "master" ? (
            <CatalogManager />
          ) : (
            <div className="p-8 rounded-xl border border-amber-500/30 bg-amber-950/20 text-foreground space-y-4">
              <div className="flex items-center gap-3 text-amber-400 font-heading text-lg font-bold uppercase tracking-wider">
                <AlertCircle className="w-5 h-5" />
                <span>Gerenciador de Catálogo (Exclusivo Perfil Master)</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground">
                Você está atualmente autenticado como <strong>{adminUser}</strong> (Perfil: Operador de Câmbio).
                O gerenciamento de produtos (inserção, edição e ocultação) requer permissão de <strong>Admin Master</strong>.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-heading uppercase text-xs tracking-wider font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Sair e Entrar como Admin Master
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-8">
            {/* Aviso para Operador de Dólar */}
            {isDolarOnly && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Perfil Operador de Câmbio:</strong> Você tem permissão para ajustar a Cotação do Dólar
                    (USD / BRL). As margens por categoria estão travadas para edição e são gerenciadas pelo Admin Master.
                  </span>
                </div>
              </div>
            )}

            {/* Banner de Feedback */}
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
                  className="text-xs uppercase tracking-widest hover:underline opacity-80"
                >
                  Fechar
                </button>
              </div>
            )}

            {/* Barra de Ação Principal e Aviso de Modificação */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wider">
                    {isDolarOnly ? "Gestão da Taxa de Câmbio" : "Fluxo de Precificação Ativo"}
                  </h2>
                  {hasUnsavedChanges ? (
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold animate-pulse">
                      Alterações Pendentes
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold">
                      Sincronizado
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  Última atualização:{" "}
                  {lastSaved?.updatedAt
                    ? new Date(lastSaved.updatedAt).toLocaleString("pt-BR")
                    : "Padrão inicial"}
                  {lastSaved?.updatedBy ? ` · Por: ${lastSaved.updatedBy}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={loadPricingConfig}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-xs font-mono uppercase tracking-wider hover:bg-muted transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recarregar
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground text-xs font-mono font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isDolarOnly ? "Salvar Câmbio" : "Salvar Alterações"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Grade: Parâmetros Centrais (Câmbio e Margem Padrão) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card: Cotação do Dólar (editável por ambos) */}
              <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading text-lg font-bold uppercase tracking-wide">
                      Cotação do Dólar (USD / BRL)
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-emerald-400 uppercase font-bold">Editável</span>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Valor em reais (R$) usado para converter o preço original em dólar dos produtos da Arsenal Sports.
                </p>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-mono text-sm text-muted-foreground">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={exchangeRateInput}
                      onChange={(e) => handleExchangeRateChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-lg font-mono font-bold text-foreground focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  {/* Botões de ajuste rápido */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseFloat(exchangeRateInput) || 5.50;
                        handleExchangeRateChange((current - 0.10).toFixed(2));
                      }}
                      className="px-2.5 py-2.5 bg-background border border-border rounded-lg font-mono text-xs hover:bg-muted transition-colors cursor-pointer"
                      title="Diminuir R$ 0,10"
                    >
                      -0.10
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseFloat(exchangeRateInput) || 5.50;
                        handleExchangeRateChange((current + 0.10).toFixed(2));
                      }}
                      className="px-2.5 py-2.5 bg-background border border-border rounded-lg font-mono text-xs hover:bg-muted transition-colors cursor-pointer"
                      title="Aumentar R$ 0,10"
                    >
                      +0.10
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Exemplo: US$ 100,00 vira</span>
                  <span className="font-bold text-foreground">
                    R$ {(100 * (parseFloat(exchangeRateInput) || 5.5)).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>

              {/* Card: Margem Padrão Geral (desabilitado para dolar_operator) */}
              <div
                className={`bg-card border border-border rounded-xl p-6 relative overflow-hidden shadow-sm ${
                  isDolarOnly ? "opacity-60 bg-card/60" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                      <Percent className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading text-lg font-bold uppercase tracking-wide">
                      Margem Padrão Geral (%)
                    </h3>
                  </div>
                  {isDolarOnly ? (
                    <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground border border-border">
                      Apenas Master
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground uppercase">Fallback Geral</span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Porcentagem de acréscimo aplicada a qualquer categoria que não possua uma margem específica configurada.
                </p>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="300"
                      disabled={isDolarOnly}
                      value={defaultMarginPercent}
                      onChange={(e) => handleDefaultMarginChange(parseInt(e.target.value) || 0)}
                      className="w-full pl-4 pr-10 py-2.5 bg-background border border-border rounded-lg text-lg font-mono font-bold text-foreground focus:outline-none focus:border-accent transition-colors disabled:cursor-not-allowed"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center font-mono text-sm text-muted-foreground">
                      %
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isDolarOnly}
                    onClick={applyDefaultToAllCategories}
                    className="px-3 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-secondary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Aplica esse percentual em todas as categorias da tabela"
                  >
                    Aplicar a Todas
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Multiplicador equivalente</span>
                  <span className="font-bold text-foreground">
                    {percentToMarkup(defaultMarginPercent).toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>

            {/* Simulador Interativo em Tempo Real */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wide">
                    Simulador de Fluxo de Valores em Tempo Real
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Teste qualquer valor em dólares e veja exatamente como a cotação e a margem compõem o preço final.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                      Valor em Dólar (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-mono text-xs text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={simUsd}
                        onChange={(e) => setSimUsd(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-sm font-mono font-bold focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                      Categoria para Teste
                    </label>
                    <select
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono focus:outline-none focus:border-accent"
                    >
                      {CATALOG_CATEGORIES_METADATA.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.label} ({categoryMargins[c.slug] ?? defaultMarginPercent}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-background border border-border rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-3">
                      Composição do Preço Final
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                      <div className="p-3 bg-card border border-border rounded-lg">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block">
                          1. Custo Convertido
                        </span>
                        <span className="font-mono text-sm font-bold text-foreground">
                          {simResult.formattedBase}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                          ${simResult.usd} × R$ {simResult.rate.toFixed(2)}
                        </span>
                      </div>

                      <div className="p-3 bg-card border border-border rounded-lg">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block">
                          2. Margem de Lucro
                        </span>
                        <span className="font-mono text-sm font-bold text-accent">
                          +{simResult.formattedMargin}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                          +{simResult.margin}% sobre o custo
                        </span>
                      </div>

                      <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
                        <span className="text-[10px] font-mono text-accent uppercase font-bold block">
                          3. Preço Final
                        </span>
                        <span className="font-mono text-lg font-bold text-primary">
                          {simResult.formattedFinal}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                          Exibido na Vitrine
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-card border border-border rounded-lg text-xs font-mono">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                      Exemplo de mensagem gerada para o WhatsApp do cliente:
                    </span>
                    <p className="text-muted-foreground italic">
                      &ldquo;Olá, tenho interesse no produto... Preço: <strong className="text-foreground">{simResult.formattedFinal}</strong>&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Margens por Categoria */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-xl font-bold uppercase tracking-wider">
                      Porcentagens de Margem por Categoria
                    </h3>
                    {isDolarOnly && (
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground border border-border">
                        Somente Leitura
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {isDolarOnly
                      ? "Visualização dos percentuais ativos definidos pelo Administrador Master."
                      : "Defina a margem individual para cada categoria do catálogo."}
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Buscar categoria..."
                    className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((cat) => {
                  const currentPercent = categoryMargins[cat.slug] ?? defaultMarginPercent;
                  const markup = percentToMarkup(currentPercent);

                  return (
                    <div
                      key={cat.slug}
                      className={`p-4 bg-background border border-border rounded-lg transition-colors flex flex-col justify-between gap-3 ${
                        isDolarOnly ? "opacity-80" : "hover:border-accent/40 group"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium text-sm text-foreground block">
                            {cat.label}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">
                            {cat.slug}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                          {markup.toFixed(2)}x
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="200"
                            step="5"
                            disabled={isDolarOnly}
                            value={currentPercent}
                            onChange={(e) =>
                              handleCategoryMarginChange(cat.slug, parseInt(e.target.value) || 0)
                            }
                            className="flex-1 accent-accent disabled:opacity-40"
                          />
                          <div className="relative w-20">
                            <input
                              type="number"
                              min="0"
                              max="300"
                              disabled={isDolarOnly}
                              value={currentPercent}
                              onChange={(e) =>
                                handleCategoryMarginChange(cat.slug, parseInt(e.target.value) || 0)
                              }
                              className="w-full pr-6 pl-2 py-1 bg-card border border-border rounded text-xs font-mono font-bold text-right focus:outline-none focus:border-accent disabled:cursor-not-allowed"
                            />
                            <span className="absolute inset-y-0 right-1.5 flex items-center font-mono text-[10px] text-muted-foreground pointer-events-none">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amostra ao vivo com produtos reais */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-5 h-5 text-accent" />
                <h3 className="font-heading text-lg font-bold uppercase tracking-wide">
                  Prévia ao Vivo: Produtos Reais do Catálogo
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-4">
                Veja como a cotação de R$ {exchangeRateInput} altera instantaneamente o valor final exibido ao cliente.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SAMPLE_PRODUCTS.map((prod) => {
                  const calc = calculateBRLPrice(prod.usdPrice, prod.category, activeWorkingConfig);

                  return (
                    <div
                      key={prod.id}
                      className="p-4 bg-background border border-border rounded-lg space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase block">
                          {prod.categoryLabel}
                        </span>
                        <h4 className="font-medium text-xs text-foreground line-clamp-2 mt-1">
                          {prod.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                          <span>Original</span>
                          <span>{prod.usdPrice}</span>
                        </div>
                        <div className="font-mono text-base font-bold text-primary mt-1">
                          {calc?.formatted || "Sob Consulta"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Alterar Senha e Gestão de Acessos */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-accent" />
                <h3 className="font-heading text-lg font-bold uppercase tracking-wide">
                  {adminRole === "master" ? "Gestão de Acessos & Senhas" : "Alterar Minha Senha"}
                </h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Abas se for Master */}
            {adminRole === "master" && (
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => {
                    setModalTab("self");
                    setPasswordFeedback(null);
                  }}
                  className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    modalTab === "self"
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Minha Senha
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalTab("users");
                    setPasswordFeedback(null);
                  }}
                  className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    modalTab === "users"
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Usuários & Recuperação
                </button>
              </div>
            )}

            {passwordFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                  passwordFeedback.type === "success"
                    ? "bg-emerald-950/40 border border-emerald-500/50 text-emerald-300"
                    : "bg-destructive/15 border border-destructive/30 text-destructive"
                }`}
              >
                {passwordFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            {/* TAB 1: Minha Senha */}
            {modalTab === "self" && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Altere a senha da sua conta conectada (<strong className="text-foreground">{adminUser}</strong>).
                </p>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Digite sua senha atual"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                    Nova Senha (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Digite a nova senha"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-border rounded-lg text-xs font-mono uppercase hover:bg-muted cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-mono font-bold uppercase hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {changingPassword ? "Salvando..." : "Salvar Senha"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Gerenciar Usuários (Apenas Master) */}
            {modalTab === "users" && adminRole === "master" && (
              <div className="space-y-5">
                {/* Lista de Contas */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                    Contas de Acesso Cadastradas
                  </span>

                  {loadingUsers ? (
                    <div className="p-4 text-center text-xs font-mono text-muted-foreground">
                      Carregando usuários...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {managedUsers.map((u) => (
                        <div
                          key={u.username}
                          className="p-3 bg-background border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-foreground">
                                {u.username}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-muted text-muted-foreground border border-border">
                                {u.role === "master" ? "Admin Master" : "Operador Dólar"}
                              </span>
                            </div>

                            {editingEmailUser === u.username ? (
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="email"
                                  value={editEmailValue}
                                  onChange={(e) => setEditEmailValue(e.target.value)}
                                  placeholder="novo.email@exemplo.com"
                                  className="px-2 py-1 bg-card border border-border rounded text-xs font-mono focus:outline-none focus:border-accent"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveUserEmail(u.username)}
                                  className="px-2 py-1 bg-accent text-accent-foreground rounded text-[10px] font-mono font-bold uppercase cursor-pointer"
                                >
                                  Salvar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingEmailUser(null)}
                                  className="px-2 py-1 text-[10px] font-mono uppercase text-muted-foreground hover:underline cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="font-mono text-xs text-muted-foreground">
                                  {u.email || "Sem e-mail cadastrado"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingEmailUser(u.username);
                                    setEditEmailValue(u.email);
                                  }}
                                  className="text-[10px] font-mono text-accent hover:underline cursor-pointer"
                                >
                                  Alterar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulário: Master redefinindo a senha do operador */}
                <form
                  onSubmit={handleMasterResetTargetPassword}
                  className="pt-3 border-t border-border space-y-3"
                >
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
                    Redefinir Senha de Usuário pelo Master
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted-foreground mb-1">
                        Usuário Alvo
                      </label>
                      <select
                        value={targetResetUser}
                        onChange={(e) => setTargetResetUser(e.target.value)}
                        className="w-full px-2.5 py-2 bg-background border border-border rounded-lg text-xs font-mono focus:outline-none focus:border-accent"
                      >
                        <option value="cambio">cambio (Operador de Dólar)</option>
                        <option value="admin">admin (Admin Master)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted-foreground mb-1">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={targetNewPassword}
                        onChange={(e) => setTargetNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        className="w-full px-2.5 py-2 bg-background border border-border rounded-lg text-xs font-mono focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full py-2 bg-secondary text-secondary-foreground border border-border rounded-lg text-xs font-mono uppercase tracking-wider font-bold hover:bg-secondary/80 disabled:opacity-50 cursor-pointer"
                  >
                    {changingPassword ? "Gravando Senha..." : "Aplicar Nova Senha para Usuário"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
