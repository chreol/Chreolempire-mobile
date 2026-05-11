import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface OrderPayload {
  type: "UPDATE";
  table: string;
  record: {
    id: string;
    user_email: string;
    product_name: string;
    amount_label: string;
    amount_fcfa: number;
    payment_method: string;
    status: string;
    code?: string;
    created_at: string;
  };
  old_record: { status: string };
}

function buildEmailHtml(order: OrderPayload["record"]): string {
  const paymentLabel: Record<string, string> = {
    orange_money: "Orange Money",
    mtn_momo: "MTN MoMo",
    crypto: "Crypto (USDT)",
    paypal: "PayPal",
  };

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, 'Helvetica Neue', sans-serif; background: #0A0B0F; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 0 auto; padding: 32px 24px; }
    .logo { background: #2563EB; border-radius: 16px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #fff; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
    .subtitle { color: #9CA3AF; font-size: 15px; margin-bottom: 32px; line-height: 22px; }
    .card { background: #1A1B25; border-radius: 20px; padding: 24px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.08); }
    .card-title { font-size: 11px; font-weight: 700; color: #4B5563; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .row:last-child { border-bottom: none; }
    .row-label { color: #9CA3AF; font-size: 14px; }
    .row-value { font-weight: 600; font-size: 14px; color: #fff; }
    .code-box { background: rgba(16,185,129,0.12); border: 1.5px dashed rgba(16,185,129,0.5); border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 20px; }
    .code-label { font-size: 12px; color: #9CA3AF; margin-bottom: 8px; }
    .code { font-size: 28px; font-weight: 900; color: #10B981; letter-spacing: 4px; font-family: monospace; }
    .price-badge { color: #FACC15; font-size: 16px; font-weight: 800; }
    .footer { color: #4B5563; font-size: 12px; text-align: center; margin-top: 32px; line-height: 18px; }
    .ref { font-size: 11px; color: #4B5563; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">CE</div>

    <div class="title">✅ Code livré !</div>
    <div class="subtitle">
      Votre commande <strong style="color:#fff">${order.product_name}</strong> a été traitée avec succès.
      Retrouvez votre code ci-dessous.
    </div>

    ${order.code ? `
    <div class="code-box">
      <div class="code-label">🔑 Votre code d'activation</div>
      <div class="code">${order.code}</div>
    </div>
    ` : ""}

    <div class="card">
      <div class="card-title">Détails de la commande</div>
      <div class="row">
        <span class="row-label">Produit</span>
        <span class="row-value">${order.product_name}</span>
      </div>
      <div class="row">
        <span class="row-label">Montant</span>
        <span class="row-value">${order.amount_label}</span>
      </div>
      <div class="row">
        <span class="row-label">Total payé</span>
        <span class="price-badge">${order.amount_fcfa.toLocaleString("fr-FR")} FCFA</span>
      </div>
      <div class="row">
        <span class="row-label">Paiement</span>
        <span class="row-value">${paymentLabel[order.payment_method] ?? order.payment_method}</span>
      </div>
      <div class="row">
        <span class="row-label">Date</span>
        <span class="row-value">${new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>

    <div class="footer">
      Merci de faire confiance à <strong>Chreol Empire 🇨🇲</strong><br>
      Pour toute question, contactez-nous sur WhatsApp : +237 697 657 734<br><br>
      <span class="ref">Réf: #${order.id.slice(0, 8).toUpperCase()}</span>
    </div>
  </div>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  try {
    const payload: OrderPayload = await req.json();

    // Only trigger when status changes TO "delivered"
    if (
      payload.type !== "UPDATE" ||
      payload.record.status !== "delivered" ||
      payload.old_record.status === "delivered"
    ) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const order = payload.record;

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Chreol Empire <noreply@chreolempire.com>",
        to: [order.user_email],
        subject: `✅ Votre code ${order.product_name} est prêt !`,
        html: buildEmailHtml(order),
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      throw new Error(`Resend error: ${errText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-order-email error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
