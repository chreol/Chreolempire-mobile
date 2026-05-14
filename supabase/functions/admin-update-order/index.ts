import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VALID_STATUSES = ["pending", "processing", "done", "cancelled"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { adminSecret, orderId, status, giftCode } = await req.json();

    if (adminSecret !== ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });
    }

    if (!orderId || !status) {
      return new Response(JSON.stringify({ error: "orderId and status are required" }), { status: 400, headers: CORS });
    }

    if (!VALID_STATUSES.includes(status)) {
      return new Response(
        JSON.stringify({ error: `Status invalide. Valeurs acceptées : ${VALID_STATUSES.join(", ")}` }),
        { status: 400, headers: CORS }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const updateData: Record<string, string> = { status };
    if (giftCode !== undefined && giftCode !== null) updateData.gift_code = giftCode;

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
