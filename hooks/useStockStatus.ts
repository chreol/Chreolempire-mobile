import { useState, useEffect } from "react";

export type StockLevel = "available" | "limited" | "unavailable";

export interface StockStatus {
  level: StockLevel;
  label: string;
  color: string;
}

const STOCK_LABELS: Record<StockLevel, { label: string; color: string }> = {
  available:   { label: "✅ Disponible",   color: "#10B981" },
  limited:     { label: "⚠️ Stock limité", color: "#F97316" },
  unavailable: { label: "❌ Rupture",       color: "#EF4444" },
};

const DEFAULT_STOCK: Record<string, StockLevel> = {
  psn: "available", steam: "available", razer: "available",
  "roblox-eur": "available", nintendo: "available",
  itunes: "available", googleplay: "available", robux: "available",
};

const STOCK_URL = "https://chreolempirev1.vercel.app/stock.json";

export function useStockStatus() {
  const [stock, setStock] = useState<Record<string, StockLevel>>(DEFAULT_STOCK);

  useEffect(() => {
    let cancelled = false;
    fetch(STOCK_URL, { signal: AbortSignal.timeout?.(4000) })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data && typeof data === "object") setStock({ ...DEFAULT_STOCK, ...data });
      })
      .catch(() => { /* keep defaults */ });
    return () => { cancelled = true; };
  }, []);

  const getStatus = (id: string): StockStatus => {
    const level: StockLevel = stock[id] ?? "available";
    return { level, ...STOCK_LABELS[level] };
  };

  return { getStatus };
}
