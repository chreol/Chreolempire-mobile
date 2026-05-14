import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { scheduleOrderNotification, getPushToken } from "@/hooks/usePushNotifications";
import * as StoreReview from "expo-store-review";

export type OrderType = "achat" | "coupon" | "crypto-sell" | "paypal-sell" | "mixte";
export type OrderStatus = "pending" | "processing" | "done" | "cancelled";

export interface HistoryEntry {
  id: string;
  date: string;
  type: OrderType;
  summary: string;
  total: number;
  paymentMethod?: string;
  itemCount: number;
  status: OrderStatus;
  giftCode?: string | null;
}

interface HistoryContextType {
  history: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "date" | "status" | "giftCode">) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY = "@chreolempire_history_v1";
const HistoryContext = createContext<HistoryContextType | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Chargement initial depuis AsyncStorage ──────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setHistory(parsed.map((e: any) => ({ status: "pending", giftCode: null, ...e })));
        } catch { /* ignore corrupt data */ }
      }
    });
  }, []);

  // ── Sync Supabase au démarrage + abonnement real-time ──────────────────────
  useEffect(() => {
    syncFromSupabase();
    subscribeRealtime();
    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  // Récupère les statuts + codes depuis Supabase et fusionne avec le local
  const syncFromSupabase = async () => {
    try {
      const token = await getPushToken();
      if (!token) return;

      const { data, error } = await supabase
        .from("orders")
        .select("id, status, gift_code")
        .eq("push_token", token);

      if (error || !data) return;

      setHistory(prev => {
        const updated = prev.map(entry => {
          const remote = data.find(r => r.id === entry.id);
          if (!remote) return entry;
          return {
            ...entry,
            status: (remote.status as OrderStatus) ?? entry.status,
            giftCode: remote.gift_code ?? entry.giftCode,
          };
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch { /* offline — ignore */ }
  };

  // Écoute les changements de statut en temps réel
  const subscribeRealtime = async () => {
    const token = await getPushToken();
    if (!token) return;

    channelRef.current = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `push_token=eq.${token}` },
        async (payload) => {
          const remote = payload.new as any;
          const newStatus = remote.status as OrderStatus;
          const giftCode = remote.gift_code as string | null;

          setHistory(prev => {
            const updated = prev.map(e =>
              e.id === remote.id ? { ...e, status: newStatus, giftCode } : e
            );
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });

          // Notification push locale selon le nouveau statut
          if (newStatus === "processing") {
            await scheduleOrderNotification("processing");
          } else if (newStatus === "done") {
            await scheduleOrderNotification("done", giftCode ?? undefined);
            // Demande d'avis après 3 secondes
            setTimeout(async () => {
              const canAsk = await StoreReview.hasAction();
              if (canAsk) StoreReview.requestReview();
            }, 3000);
          }
        }
      )
      .subscribe();
  };

  const persist = async (entries: HistoryEntry[]) => {
    setHistory(entries);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  };

  const addEntry = useCallback(async (entry: Omit<HistoryEntry, "id" | "date" | "status" | "giftCode">) => {
    const token = await getPushToken();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      status: "pending",
      giftCode: null,
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Sync vers Supabase + email de confirmation (silencieux si hors ligne)
    try {
      await supabase.from("orders").insert({
        id: newEntry.id,
        type: newEntry.type,
        summary: newEntry.summary,
        total: newEntry.total,
        payment_method: newEntry.paymentMethod ?? null,
        item_count: newEntry.itemCount,
        status: "pending",
        push_token: token,
      });

      // Email de confirmation si le profil a un email
      const profileRaw = await AsyncStorage.getItem("@chreolempire_profile_v1");
      if (profileRaw) {
        const profile = JSON.parse(profileRaw);
        if (profile?.email?.trim()) {
          supabase.functions.invoke("send-order-email", {
            body: {
              email: profile.email.trim(),
              name: profile.name?.trim(),
              orderId: newEntry.id,
              type: newEntry.type,
              summary: newEntry.summary,
              total: newEntry.total,
              paymentMethod: newEntry.paymentMethod,
            },
          }).catch(() => { /* silencieux si hors ligne */ });
        }
      }
    } catch { /* hors ligne — l'ordre est sauvegardé localement */ }
  }, []);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    setHistory(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, status } : e);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    // Mise à jour locale uniquement (le vrai statut vient de Supabase via real-time)
  }, []);

  const clearHistory = useCallback(async () => {
    await persist([]);
  }, []);

  return (
    <HistoryContext.Provider value={{ history, addEntry, updateStatus, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
