"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Store,
  Mail,
  KeyRound,
  RefreshCw,
  HelpCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function AdminLoginPage() {
  const router = useRouter();

  // Estados de Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal de Recuperação de Senha
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryTab, setRecoveryTab] = useState<"email" | "masterKey">("email");

  // Estados do fluxo por e-mail
  const [emailStep, setEmailStep] = useState<"request" | "verify">("request");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados do fluxo por chave mestra
  const [masterTargetUser, setMasterTargetUser] = useState<"admin" | "cambio">("admin");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [masterNewPassword, setMasterNewPassword] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Falha ao realizar login.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erro de rede ao conectar com o servidor.");
      setLoading(false);
    }
  };

  // Solicitar envio do código de 6 dígitos por e-mail
  const handleRequestEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);
    setRecoveryLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: resetIdentifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRecoveryMessage({
          type: "error",
          text: data.error || "Falha ao enviar código de recuperação.",
        });
        setRecoveryLoading(false);
        return;
      }

      setRecoveryMessage({
        type: "success",
        text: data.message || "Código enviado com sucesso! Verifique sua caixa de entrada.",
      });
      setEmailStep("verify");
    } catch {
      setRecoveryMessage({
        type: "error",
        text: "Erro de conexão ao solicitar recuperação.",
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Confirmar código de e-mail e redefinir senha
  const handleVerifyEmailAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);

    if (newPassword !== confirmPassword) {
      setRecoveryMessage({ type: "error", text: "As senhas digitadas não coincidem." });
      return;
    }

    if (newPassword.length < 6) {
      setRecoveryMessage({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres." });
      return;
    }

    setRecoveryLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: resetIdentifier,
          code: resetCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRecoveryMessage({ type: "error", text: data.error || "Código inválido ou expirado." });
        setRecoveryLoading(false);
        return;
      }

      setRecoveryMessage({
        type: "success",
        text: "Senha redefinida com sucesso! Você já pode entrar com a nova senha.",
      });

      setTimeout(() => {
        setShowForgotModal(false);
        setEmailStep("request");
        setResetIdentifier("");
        setResetCode("");
        setNewPassword("");
        setConfirmPassword("");
        setRecoveryMessage(null);
      }, 2200);
    } catch {
      setRecoveryMessage({ type: "error", text: "Erro ao processar alteração de senha." });
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Resetar via Chave Mestra
  const handleResetWithMasterKey = async (restoreDefault: boolean = false) => {
    setRecoveryMessage(null);

    if (!restoreDefault && (!masterNewPassword || masterNewPassword.length < 6)) {
      setRecoveryMessage({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres." });
      return;
    }

    if (!recoveryKey) {
      setRecoveryMessage({ type: "error", text: "Informe a Chave Mestra de Recuperação." });
      return;
    }

    setRecoveryLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: masterTargetUser,
          recoveryKey,
          newPassword: masterNewPassword,
          restoreDefault,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRecoveryMessage({ type: "error", text: data.error || "Chave Mestra inválida." });
        setRecoveryLoading(false);
        return;
      }

      setRecoveryMessage({
        type: "success",
        text: data.message || "Senha redefinida com sucesso!",
      });

      setTimeout(() => {
        setShowForgotModal(false);
        setRecoveryKey("");
        setMasterNewPassword("");
        setRecoveryMessage(null);
      }, 2200);
    } catch {
      setRecoveryMessage({ type: "error", text: "Erro ao redefinir via Chave Mestra." });
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Detalhe tático decorativo no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-border p-2.5 shadow-lg mb-4">
            <Logo className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-wider uppercase text-foreground">
            Hunting World
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            Acesso Restrito · Gestão de Valores
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-destructive/15 border border-destructive/30 rounded-lg flex items-center gap-3 text-destructive text-sm font-mono animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Usuário (admin ou cambio)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin ou cambio"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent font-mono transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Senha de Acesso
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setRecoveryMessage(null);
                }}
                className="text-[11px] font-mono text-accent hover:underline cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent font-mono transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-accent text-accent-foreground font-mono text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? (
              <span className="animate-pulse">Autenticando...</span>
            ) : (
              <>
                Entrar no Painel
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guia rápido de perfis e acessos */}
        <div className="mt-6 pt-5 border-t border-border/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            <span>Credenciais de Acesso:</span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between">
              <div>
                <span className="font-bold text-primary">admin</span>
                <span className="block text-[10px] text-muted-foreground">Master · Catálogo Completo & Preços</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">arsenal@admin2026</span>
            </div>
            <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-400">cambio</span>
                <span className="block text-[10px] text-muted-foreground">Operador · Apenas Cotação do Dólar</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">arsenal@dolar2026</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            Voltar para a vitrine
          </Link>
          <span className="text-[10px] opacity-60">Sessão Segura (Railway)</span>
        </div>
      </div>

      {/* Modal Seguro de Recuperação de Senha */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            {/* Fechar */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider">
                  Recuperação de Senha
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Escolha o método para redefinir seu acesso.
                </p>
              </div>
            </div>

            {/* Abas do Modal */}
            <div className="flex border-b border-border mb-6">
              <button
                type="button"
                onClick={() => {
                  setRecoveryTab("email");
                  setRecoveryMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  recoveryTab === "email"
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Via E-mail
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecoveryTab("masterKey");
                  setRecoveryMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  recoveryTab === "masterKey"
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Chave Mestra
              </button>
            </div>

            {/* Mensagem de Feedback do Modal */}
            {recoveryMessage && (
              <div
                className={`mb-5 p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                  recoveryMessage.type === "success"
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-destructive/15 border-destructive/30 text-destructive"
                }`}
              >
                {recoveryMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{recoveryMessage.text}</span>
              </div>
            )}

            {/* ABA 1: Fluxo via E-mail */}
            {recoveryTab === "email" && (
              <div>
                {emailStep === "request" ? (
                  <form onSubmit={handleRequestEmailCode} className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Informe o seu nome de usuário (ex: <code className="text-foreground">admin</code> ou{" "}
                      <code className="text-foreground">cambio</code>) ou o e-mail cadastrado. Enviaremos um código
                      seguro de 6 dígitos válido por 15 minutos.
                    </p>

                    <div>
                      <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                        Usuário ou E-mail
                      </label>
                      <input
                        type="text"
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        placeholder="admin ou seu-email@exemplo.com"
                        required
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="w-full py-2.5 bg-accent text-accent-foreground font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      {recoveryLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Enviando Código...
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          Enviar Código de Recuperação
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyEmailAndReset} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">
                        Usuário: <strong className="text-foreground">{resetIdentifier}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEmailStep("request")}
                        className="text-[11px] font-mono text-accent hover:underline cursor-pointer"
                      >
                        Trocar usuário
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                        Código de 6 Dígitos
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="Ex: 489123"
                        required
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-center tracking-widest font-mono text-xl font-bold focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        required
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={recoveryLoading}
                      className="w-full py-2.5 bg-accent text-accent-foreground font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      {recoveryLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Redefinindo Senha...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Salvar Nova Senha
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ABA 2: Fluxo via Chave Mestra de Emergência */}
            {recoveryTab === "masterKey" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A <strong>Chave Mestra</strong> permite redefinir ou restaurar a senha de qualquer usuário caso o
                  e-mail esteja inacessível.
                </p>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Usuário a Redefinir
                  </label>
                  <select
                    value={masterTargetUser}
                    onChange={(e) => setMasterTargetUser(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                  >
                    <option value="admin">admin (Admin Master)</option>
                    <option value="cambio">cambio (Operador de Dólar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Chave Mestra de Recuperação
                  </label>
                  <input
                    type="password"
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                    placeholder="Chave configurada no servidor"
                    required
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-muted-foreground mb-1.5">
                    Nova Senha Desejada
                  </label>
                  <input
                    type="password"
                    value={masterNewPassword}
                    onChange={(e) => setMasterNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => handleResetWithMasterKey(false)}
                    disabled={recoveryLoading}
                    className="flex-1 py-2.5 bg-accent text-accent-foreground font-mono text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {recoveryLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Aplicar Nova Senha"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetWithMasterKey(true)}
                    disabled={recoveryLoading}
                    className="py-2.5 px-4 bg-muted border border-border text-foreground font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    title="Restaura a senha inicial de fábrica do usuário selecionado"
                  >
                    Restaurar Padrão
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
