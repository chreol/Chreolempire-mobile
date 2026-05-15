import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Switch to https://campay.net/api when CAMPAY_ENV=production
const CAMPAY_BASE = Deno.env.get("CAMPAY_ENV") === "production"
  ? "https://campay.net/api"
  : "https://demo.campay.net/api";

async function getCampayToken(): Promise<string> {
  const res = await fetch(`${CAMPAY_BASE}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: Deno.env.get("CAMPAY_USERNAME"),
      password: Deno.env.get("CAMPAY_PASSWORD"),
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Campay auth failed: ${JSON.stringify(data)}`);
  return data.token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { order_id, phone } = await req.json();

    if (!order_id || !phone) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Fetch amount from DB — never trust the client for financial amounts
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, total, status")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status !== "pending") {
      return new Response(JSON.stringify({ error: "Order already processed" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getCampayToken();

    const campayRes = await fetch(`${CAMPAY_BASE}/collect/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(order.total),
        currency: "XAF",
        from: phone,          // format: 237XXXXXXXXX
        description: "Commande Chreol Empire",
        external_reference: order_id,
        redirect_url: "",
      }),
    });

    const campayData = await campayRes.json();

    if (!campayRes.ok) {
      console.error("Campay collect error:", campayData);
      return new Response(JSON.stringify({ error: campayData.message ?? "Campay error" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store Campay reference + mark as auto payment
    await supabase
      .from("orders")
      .update({
        payment_reference: campayData.reference,
        payment_status: "pending_campay",
        payment_auto: true,
      })
      .eq("id", order_id);

    return new Response(
      JSON.stringify({ reference: campayData.reference, status: campayData.status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("initiate-payment error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
