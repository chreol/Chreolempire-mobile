import { useState, useEffect } from "react";
import type { Order } from "@/lib/types";

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "true";

const DEMO_ORDERS: Order[] = [
  {
    id: "aabb1122-demo",
    user_id: "demo-user-123",
    user_email: "demo@chreolempire.com",
    product_id: "robux-400",
    product_name: "Robux",
    amount_fcfa: 2500,
    amount_label: "400 Robux",
    payment_method: "orange_money",
    status: "delivered",
    code: "RBXD-7X9K-M2PL-4QWR",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "ccdd3344-demo",
    user_id: "demo-user-123",
    user_email: "demo@chreolempire.com",
    product_id: "psn-eu",
    product_name: "PlayStation (PSN)",
    amount_fcfa: 13000,
    amount_label: "20€",
    payment_method: "mtn_momo",
    status: "paid",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "eeff5566-demo",
    user_id: "demo-user-123",
    user_email: "demo@chreolempire.com",
    product_id: "netflix",
    product_name: "Netflix",
    amount_fcfa: 13000,
    amount_label: "1 mois Premium",
    payment_method: "crypto",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    if (DEMO_MODE) {
      const t = setTimeout(() => {
        setOrders(DEMO_ORDERS);
        setLoading(false);
      }, 800);
      return () => clearTimeout(t);
    }

    // Mode production: Supabase Realtime
    let channel: ReturnType<typeof import("@supabase/supabase-js").createClient>["channel"] | undefined;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data) setOrders(data as Order[]);
        setLoading(false);

        channel = supabase
          .channel(`orders:${userId}`)
          .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${userId}`,
          }, (payload) => {
            if (payload.eventType === "INSERT") {
              setOrders((prev) => [payload.new as Order, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setOrders((prev) =>
                prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
              );
            }
          })
          .subscribe();
      } catch {
        setLoading(false);
      }
    })();

    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ supabase }) => {
          supabase.removeChannel(channel as Parameters<typeof supabase.removeChannel>[0]);
        });
      }
    };
  }, [userId]);

  return { orders, loading };
}
