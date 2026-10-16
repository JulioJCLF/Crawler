"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { PricingConfig } from "@/types";
import { DEFAULT_PRICING_CONFIG, calculateBRLPrice } from "@/lib/pricingConfig";

interface PricingContextType {
  pricingConfig: PricingConfig;
  isLoading: boolean;
  calculatePrice: (
    usdPriceStr: string | null | undefined,
    category: string,
    fixedBrlPrice?: number | null
  ) => {
    amount: number;
    formatted: string;
    usdAmount: number;
    exchangeRate: number;
    markup: number;
    marginPercent: number;
  } | null;
  refreshPricing: () => Promise<void>;
}

const PricingContext = createContext<PricingContextType>({
  pricingConfig: DEFAULT_PRICING_CONFIG,
  isLoading: false,
  calculatePrice: (usdPriceStr, category, fixedBrlPrice) =>
    calculateBRLPrice(usdPriceStr, category, DEFAULT_PRICING_CONFIG, fixedBrlPrice),
  refreshPricing: async () => {},
});

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPricing = useCallback(async () => {
    try {
      const res = await fetch("/api/pricing");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.exchangeRate === "number") {
          setPricingConfig(data);
        }
      }
    } catch {
      // Falha silenciosa: usa o DEFAULT_PRICING_CONFIG sem quebrar a vitrine
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const calculatePrice = useCallback(
    (usdPriceStr: string | null | undefined, category: string, fixedBrlPrice?: number | null) => {
      return calculateBRLPrice(usdPriceStr, category, pricingConfig, fixedBrlPrice);
    },
    [pricingConfig]
  );


  return (
    <PricingContext.Provider
      value={{
        pricingConfig,
        isLoading,
        calculatePrice,
        refreshPricing: fetchPricing,
      }}
    >
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
}
