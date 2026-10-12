/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONFIGURAÇÃO DO SITE (White-label)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Este é o ÚNICO lugar que você precisa editar para configurar a aparência e a
 *  marca do catálogo. Nada aqui aparece para o cliente final como um controle na
 *  tela — tudo é definido por código, aqui, antes do deploy.
 *
 *  Depois de editar, faça commit/push que o deploy aplica automaticamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ThemeName = "hunting" | "minimal" | "dark" | "light";
export type LayoutMode = "sidebar" | "topbar" | "drawer";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? (process.env.STATIC_EXPORT === "true" ? "/crawler" : "");

/** Monta o caminho de um asset local respeitando o basePath. */
export const asset = (path: string) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${cleanPath}`;
};

export interface SiteConfig {
  /** Nome da marca (usado em textos e no alt da logo). */
  brandName: string;

  /** Logo da marca (arquivo em /public). */
  logo: {
    src: string;
    alt: string;
  };

  /** Tema visual aplicado no site. Ver classes .theme-* em globals.css. */
  theme: ThemeName;

  /** Layout dos filtros: "sidebar" (lateral) ou "topbar" (barra no topo). */
  layout: LayoutMode;

  /** Número de WhatsApp (só dígitos, com DDI+DDD) para os botões de pedido. */
  whatsappNumber: string;

  /**
   * Mostra os botões de troca de Tema/Layout na tela.
   * DEIXE SEMPRE `false` em produção — servem apenas para você testar layouts
   * localmente. O cliente final nunca deve ver isso.
   */
  showDevTools: boolean;
}

export const siteConfig: SiteConfig = {
  brandName: "Hunting World",
  logo: {
    src: asset("/hunting-logo.png"),
    alt: "Hunting World — Tactical Gear",
  },
  theme: "hunting",
  layout: "sidebar",
  whatsappNumber: "5545999858096",
  showDevTools: false,
};
