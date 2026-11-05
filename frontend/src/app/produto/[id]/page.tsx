"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/providers/CartProvider";
import { usePricing } from "@/providers/PricingProvider";
import { cleanProductName } from "@/lib/cleanUtils";
import { siteConfig } from "@/config/site";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingCart,
  ShieldCheck,
  FileText,
  Sliders,
  Tag,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const { addToCart } = useCart();
  const { calculatePrice } = usePricing();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/products/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (data?.product) {
          setProduct(data.product);
          setActiveImageIdx(0);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setNotFound(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="font-mono text-xs animate-pulse uppercase tracking-widest text-accent flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          Carregando ficha técnica do equipamento...
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 gap-4">
        <div className="font-mono text-sm uppercase tracking-wider text-destructive border border-destructive/40 bg-destructive/10 px-4 py-3">
          [ERRO 404] Equipamento não localizado no acervo.
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 border border-border bg-card hover:border-accent hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para a Vitrine
        </Link>
      </div>
    );
  }

  const productName = cleanProductName(product.name);
  const currentBrl = calculatePrice(product.price, product.category, product.fixedBrlPrice);
  const previousBrl = calculatePrice(product.previousPrice, product.category);
  const productRef = product.sku || product.id;

  let discountPercentage = 0;
  if (currentBrl && previousBrl && currentBrl.amount < previousBrl.amount) {
    discountPercentage = Math.round(
      ((previousBrl.amount - currentBrl.amount) / previousBrl.amount) * 100
    );
  }

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const currentImage = galleryImages[activeImageIdx] || product.image || null;

  const handleAdd = () => {
    addToCart({
      ...product,
      price: currentBrl ? currentBrl.formatted : product.price,
    });
  };

  // Parse description lines into paragraphs and bullet lists safely (no innerHTML)
  const descriptionLines = (product.description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // Merge specs with base metadata so table is always informative
  const specEntries: Array<[string, string]> = [];
  const seenKeys = new Set<string>();

  const pushSpec = (k: string, v?: string) => {
    if (!v || !v.trim()) return;
    const norm = k.toLowerCase();
    if (seenKeys.has(norm)) return;
    seenKeys.add(norm);
    specEntries.push([k, v.trim()]);
  };

  pushSpec("SKU / Referência", productRef);
  pushSpec("Categoria", product.categoryLabel || product.category);

  if (product.specs) {
    for (const [key, val] of Object.entries(product.specs)) {
      pushSpec(key, val);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar / Breadcrumb */}
      <header className="border-b border-border bg-card/60 sticky top-0 z-30 backdrop-blur-xs">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Acervo</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground truncate">
            <span className="uppercase px-2 py-0.5 bg-muted border border-border text-foreground">
              {product.categoryLabel || product.category}
            </span>
            <span>//</span>
            <span className="text-accent font-bold">REF. {productRef}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1300px] mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Hero Grid: Image Gallery + Commercial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative h-72 sm:h-96 md:h-[440px] bg-card border border-border flex items-center justify-center p-6 overflow-hidden">
              {/* Status Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                {product.changeType === "new" && (
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 border border-accent text-accent bg-accent/10">
                    Novo
                  </span>
                )}
                {product.changeType === "restock" && (
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 border border-border text-foreground bg-muted">
                    Restock
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 border border-destructive text-destructive bg-destructive/10">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="absolute top-3 right-3 z-10 font-mono text-[11px] text-muted-foreground bg-background/80 border border-border px-2 py-0.5">
                  FOTO {activeImageIdx + 1} / {galleryImages.length}
                </div>
              )}

              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
                  alt={productName}
                  fetchPriority="high"
                  className="object-contain max-h-full max-w-full transition-all"
                />
              ) : (
                <div className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                  Sem imagem disponível
                </div>
              )}

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() =>
                      setActiveImageIdx((prev) =>
                        prev === 0 ? galleryImages.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/90 border border-border text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima foto"
                    onClick={() =>
                      setActiveImageIdx((prev) =>
                        prev === galleryImages.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/90 border border-border text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((imgUrl, idx) => {
                  const isSelected = idx === activeImageIdx;
                  return (
                    <button
                      key={imgUrl + idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      aria-label={`Selecionar foto ${idx + 1}`}
                      className={`h-16 w-20 flex-shrink-0 bg-card border p-1.5 flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-accent ring-1 ring-accent"
                          : "border-border opacity-70 hover:opacity-100 hover:border-accent/60"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`${productName} - miniatura ${idx + 1}`}
                        loading="lazy"
                        className="object-contain max-h-full max-w-full"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Commercial Info & CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-card border border-border p-5 md:p-7 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-border pb-3">
                <span className="font-mono text-xs text-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  REF. {productRef}
                </span>
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  {product.categoryLabel || product.category}
                </span>
              </div>

              <h1
                style={{ textWrap: "balance" }}
                className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground leading-tight"
              >
                {productName}
              </h1>

              {/* Price Section */}
              <div className="bg-muted/20 border border-border p-4 flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Valor do Equipamento
                </span>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {currentBrl ? (
                    <span className="font-mono text-2xl md:text-3xl font-bold text-accent tabular-nums">
                      {currentBrl.formatted}
                    </span>
                  ) : (
                    <span className="font-mono text-lg text-muted-foreground uppercase">
                      Sob Consulta
                    </span>
                  )}

                  {previousBrl &&
                    currentBrl &&
                    previousBrl.amount > currentBrl.amount && (
                      <span className="font-mono text-sm text-muted-foreground line-through tabular-nums">
                        {previousBrl.formatted}
                      </span>
                    )}
                </div>
              </div>

              {/* Quick Highlights from Specs */}
              {specEntries.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {specEntries.slice(0, 6).map(([label, value]) => (
                    <div
                      key={label}
                      className="bg-background/60 border border-border px-3 py-2 flex flex-col"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                        {label}
                      </span>
                      <span className="font-mono text-xs font-medium text-foreground truncate">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mandatory Commercial CTAs */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground font-display text-sm uppercase font-semibold py-3 px-4 border border-accent transition-opacity hover:opacity-90 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Pedir via WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 flex items-center justify-center gap-2 bg-background text-foreground font-display text-sm uppercase font-semibold py-3 px-4 border border-border transition-colors hover:border-accent hover:bg-muted cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  + Carrinho
                </button>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
                <span>
                  Adicione ao orçamento e escolha o consultor da {siteConfig.brandName} no WhatsApp.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Details Section: Description & Technical Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 mt-8 md:mt-12">
          {/* Description Column */}
          <section className="lg:col-span-7 bg-card border border-border p-5 md:p-7">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-5">
              <FileText className="w-4 h-4 text-accent" />
              <h2
                style={{ textWrap: "balance" }}
                className="font-display text-lg md:text-xl uppercase font-semibold tracking-wider text-foreground"
              >
                Descrição do Equipamento
              </h2>
            </div>

            {descriptionLines.length > 0 ? (
              <div className="flex flex-col gap-2.5 text-sm leading-relaxed text-foreground/90">
                {descriptionLines.map((line, index) => {
                  const isBullet = line.startsWith("• ");
                  const isHeader =
                    !isBullet &&
                    (line.endsWith(":") ||
                      /^(\*as descri|caracter[ií]sticas|especifica[cç][oõ]es|itens inclusos)/i.test(
                        line
                      ));

                  if (isBullet) {
                    return (
                      <div
                        key={index}
                        style={{ textWrap: "pretty" }}
                        className="flex items-start gap-2.5 pl-2"
                      >
                        <span className="text-accent font-mono select-none">•</span>
                        <span>{line.slice(2)}</span>
                      </div>
                    );
                  }

                  if (isHeader) {
                    return (
                      <p
                        key={index}
                        style={{ textWrap: "pretty" }}
                        className="font-semibold text-foreground mt-2 first:mt-0"
                      >
                        {line}
                      </p>
                    );
                  }

                  return (
                    <p
                      key={index}
                      style={{ textWrap: "pretty" }}
                      className="text-muted-foreground"
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p
                style={{ textWrap: "pretty" }}
                className="font-mono text-xs text-muted-foreground"
              >
                Equipamento catalogado sob referência REF. {productRef} ({productName}). Utilize o botão de WhatsApp para solicitar informações adicionais à equipe técnica.
              </p>
            )}
          </section>

          {/* Technical Specifications Table Column */}
          <section className="lg:col-span-5 bg-card border border-border p-5 md:p-7">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-5">
              <Sliders className="w-4 h-4 text-accent" />
              <h2
                style={{ textWrap: "balance" }}
                className="font-display text-lg md:text-xl uppercase font-semibold tracking-wider text-foreground"
              >
                Especificações Técnicas
              </h2>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-labelledby="specs-table-caption"
              className="overflow-x-auto max-w-full border border-border"
            >
              <table className="w-full text-left border-collapse font-mono text-xs">
                <caption id="specs-table-caption" className="sr-only">
                  Especificações técnicas de {productName}
                </caption>
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th scope="col" className="py-2.5 px-3 uppercase text-muted-foreground font-semibold">
                      Atributo
                    </th>
                    <th scope="col" className="py-2.5 px-3 uppercase text-muted-foreground font-semibold">
                      Especificação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {specEntries.map(([label, value]) => (
                    <tr key={label} className="hover:bg-muted/20 transition-colors">
                      <th
                        scope="row"
                        className="py-2.5 px-3 font-medium text-muted-foreground uppercase bg-card/90 sticky left-0"
                      >
                        {label}
                      </th>
                      <td className="py-2.5 px-3 text-foreground font-semibold">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
