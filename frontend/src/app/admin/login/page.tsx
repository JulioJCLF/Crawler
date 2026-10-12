"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, ArrowRight, AlertCircle, Store } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Sucesso: redireciona para o painel administrativo
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erro de rede ao conectar com o servidor.");
      setLoading(false);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Usuário Administrador
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent font-mono transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Senha de Acesso
            </label>
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
            className="w-full mt-2 py-3 bg-accent text-accent-foreground font-mono text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
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

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
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
    </div>
  );
}
