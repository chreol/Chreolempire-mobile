import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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
}

interface HistoryContextType {
  history: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "date" | "status">) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY = "@chreolempire_history_v1";
const HistoryContext = createContext<HistoryContextType | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setHistory(parsed.map((e: any) => ({ status: "pending", ...e })));
        } catch { /* ignore corrupt data */ }
      }
    });
  }, []);

  const persist = async (entries: HistoryEntry[]) => {
    setHistory(entries);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  };

  const addEntry = useCallback(async (entry: Omit<HistoryEntry, "id" | "date" | "status">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      status: "pending",
    };
    setHistory(prev => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    setHistory(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, status } : e);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
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
