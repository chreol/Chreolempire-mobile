import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://voiagfmtqezelocvjjcb.supabase.co";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_h1zlS_9W8IrLnNg75bAEYA_bK_S7obJ";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export type SupabaseOrder = {
  id: string;
  created_at: string;
  type: string;
  summary: string;
  total: number;
  payment_method: string | null;
  item_count: number;
  status: string;
  gift_code: string | null;
  push_token: string | null;
  client_name: string | null;
  client_city: string | null;
};
