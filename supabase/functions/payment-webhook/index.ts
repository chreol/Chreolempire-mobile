import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Campay POSTs here when a payment status changes.
// Payload: { status, reference, external_reference, amount, currency, operator, phone_number }
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    console.log("Campay webhook:", JSON.stringify(body));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (body.status === "SUCCESSFUL") {
      // Find order by Campay reference or by the external_reference we passed
      const { data: order, error } = await supabase
        .from("orders")
        .select("id, push_token, client_email, client_name, summary, total, payment_method")
        .or(`payment_reference.eq.${body.reference},id.eq.${body.external_reference}`)
        .maybeSingle();

      if (error || !order) {
        console.error("Order not found:", body.reference, body.external_reference);
        return new Response("not found", { status: 404 });
      }

      // Marque le paiement comme confirmé
      await supabase
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", order.id);

      // Déclenche email + push + changement de statut via admin-update-order
      await supabase.functions.invoke("admin-update-order", {
        body: {
          adminSecret: Deno.env.get("ADMIN_SECRET"),
          orderId: order.id,
          status: "processing",
        },
      });

    } else if (body.status === "FAILED") {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .or(`payment_reference.eq.${body.reference},id.eq.${body.external_reference}`);
    }

    return new Response("ok");
  } catch (err) {
    console.error("payment-webhook error:", err);
    return new Response(String(err), { status: 500 });
  }
});
