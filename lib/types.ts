export type OrderStatus = "pending" | "paid" | "delivered" | "failed";
export type PaymentMethod = "orange_money" | "mtn_momo" | "crypto" | "paypal";

export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  product_id: string;
  product_name: string;
  amount_fcfa: number;
  amount_label: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  code?: string;
  moneroo_ref?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string;
  photo_url?: string;
  created_at: string;
  total_orders: number;
}

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id" | "created_at">>;
      };
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at" | "total_orders">;
        Update: Partial<Omit<UserProfile, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
