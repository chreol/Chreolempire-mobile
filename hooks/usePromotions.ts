import { useState, useEffect } from "react";

export interface Promo {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  badge?: string;
}

const FALLBACK_PROMOS: Promo[] = [
  { id: "1", emoji: "🎮", title: "PSN 10€ — 7 500 FCFA", subtitle: "Livraison immédiate par WhatsApp", color: "#003791", badge: "🔥 Top vente" },
  { id: "2", emoji: "💵", title: "USDT — 580 FCFA/$", subtitle: "Vente rapide, paiement Mobile Money", color: "#26A17B", badge: "📈 Taux du jour" },
  { id: "3", emoji: "💶", title: "PayPal — 700 FCFA/€", subtitle: "Achetez votre solde PayPal Europe", color: "#003087", badge: "✅ Disponible" },
  { id: "4", emoji: "🎟️", title: "PCS Mastercard — 440 FCFA/€", subtitle: "Échange coupon PCS instantané", color: "#C9A84C", badge: "⚡ Express" },
  { id: "5", emoji: "🏦", title: "Recharge UBA dès 1 500 FCFA", subtitle: "Carte UBA Segment I, II, III", color: "#8B0000", badge: "🆕 Service" },
];

const PROMOS_URL = "https://chreolempirev1.vercel.app/promos.json";

export function usePromotions() {
  const [promos, setPromos] = useState<Promo[]>(FALLBACK_PROMOS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(PROMOS_URL, { signal: AbortSignal.timeout?.(4000) })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setPromos(data);
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { promos, loading };
}
