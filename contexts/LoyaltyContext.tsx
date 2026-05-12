import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "@chreolempire_loyalty_v1";
export const STAMPS_FOR_REWARD = 10;

export interface LoyaltyData {
  stamps: number;       // total stamps ever earned
  redeemed: number;     // total rewards redeemed
}

interface LoyaltyContextType {
  stamps: number;
  activeStamps: number; // stamps % STAMPS_FOR_REWARD (position on current card)
  redeemed: number;
  addStamp: () => Promise<void>;
  redeemReward: () => Promise<void>;
  canRedeem: boolean;
}

const LoyaltyContext = createContext<LoyaltyContextType | null>(null);

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LoyaltyData>({ stamps: 0, redeemed: 0 });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setData(JSON.parse(raw)); } catch { /* ignore */ }
      }
    });
  }, []);

  const persist = async (next: LoyaltyData) => {
    setData(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addStamp = useCallback(async () => {
    setData(prev => {
      const next = { ...prev, stamps: prev.stamps + 1 };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const redeemReward = useCallback(async () => {
    setData(prev => {
      const totalEarned = prev.stamps;
      const totalRedeemable = Math.floor(totalEarned / STAMPS_FOR_REWARD);
      if (prev.redeemed >= totalRedeemable) return prev;
      const next = { ...prev, redeemed: prev.redeemed + 1 };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const totalRedeemable = Math.floor(data.stamps / STAMPS_FOR_REWARD);
  const canRedeem = totalRedeemable > data.redeemed;
  const activeStamps = data.stamps % STAMPS_FOR_REWARD;

  return (
    <LoyaltyContext.Provider value={{ stamps: data.stamps, activeStamps, redeemed: data.redeemed, addStamp, redeemReward, canRedeem }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error("useLoyalty must be used within LoyaltyProvider");
  return ctx;
}
