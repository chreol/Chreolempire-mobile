import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TYPE_LABELS: Record<string, string> = {
  achat: "Achat carte cadeau",
  coupon: "Échange coupon",
  "crypto-sell": "Vente crypto",
  "paypal-sell": "Vente PayPal",
  mixte: "Demande mixte",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { email, name, orderId, type, summary, total, paymentMethod } = await req.json();
    if (!email) return new Response("missing email", { status: 400 });

    const firstName = name?.trim() || "cher client";
    const typeLabel = TYPE_LABELS[type] ?? type;
    const isSell = ["coupon", "crypto-sell", "paypal-sell"].includes(type);
    const totalLabel = isSell ? "À recevoir" : "Total à payer";
    const dateStr = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Confirmation de commande — Chreol Empire</title></head>
<body style="margin:0;padding:0;background:#0A0B0F;font-family:Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:32px 16px;">

  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:48px;">${isSell ? "🔄" : "✅"}</div>
    <h1 style="color:#C9A84C;font-size:20px;font-weight:900;margin:12px 0 4px;">Chreol Empire</h1>
    <p style="color:#666;font-size:13px;margin:0;">Confirmation de commande</p>
  </div>

  <div style="background:#141519;border-radius:16px;border:1px solid #2A2B30;padding:28px;margin-bottom:16px;">
    <h2 style="color:#FFFFFF;font-size:18px;margin:0 0 6px;">
      ${isSell ? "Demande reçue !" : "Commande confirmée !"} ${firstName}
    </h2>
    <p style="color:#666;font-size:12px;margin:0 0 20px;">📅 ${dateStr}</p>

    <div style="background:#0A0B0F;border-radius:12px;padding:16px;margin-bottom:16px;">
      <p style="color:#C9A84C;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 12px;">Détails de la commande</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#666;font-size:12px;padding:6px 0;">Type</td>
          <td style="color:#FFFFFF;font-size:12px;font-weight:700;text-align:right;">${typeLabel}</td>
        </tr>
        <tr>
          <td style="color:#666;font-size:12px;padding:6px 0;">Détails</td>
          <td style="color:#AAAAAA;font-size:12px;text-align:right;">${summary}</td>
        </tr>
        ${paymentMethod ? `
        <tr>
          <td style="color:#666;font-size:12px;padding:6px 0;">Paiement</td>
          <td style="color:#FFFFFF;font-size:12px;font-weight:700;text-align:right;">💳 ${paymentMethod}</td>
        </tr>` : ""}
        <tr style="border-top:1px solid #2A2B30;">
          <td style="color:#AAAAAA;font-size:13px;font-weight:700;padding:10px 0 0;">${totalLabel}</td>
          <td style="color:${isSell ? "#25D366" : "#C9A84C"};font-size:18px;font-weight:900;text-align:right;padding:10px 0 0;">
            ${Number(total).toLocaleString("fr-FR")} FCFA
          </td>
        </tr>
      </table>
    </div>

    ${!isSell ? `
    <div style="background:#1A2A1A;border-radius:12px;border:1px solid #25D36644;padding:14px;margin-bottom:16px;">
      <p style="color:#25D366;font-size:13px;font-weight:700;margin:0 0 4px;">⏱️ Délai de livraison : 15 à 30 minutes</p>
      <p style="color:#7DCF9F;font-size:12px;margin:0;">
        Après confirmation de votre paiement, notre équipe vous enverra votre code sur WhatsApp et dans l'application.
      </p>
    </div>` : `
    <div style="background:#0D1A2A;border-radius:12px;border:1px solid #3B82F644;padding:14px;margin-bottom:16px;">
      <p style="color:#60A5FA;font-size:13px;font-weight:700;margin:0 0 4px;">📸 Envoyez votre preuve</p>
      <p style="color:#93C5FD;font-size:12px;margin:0;">
        Envoyez la photo ou capture d'écran de votre coupon/crypto/PayPal sur WhatsApp pour déclencher le traitement.
      </p>
    </div>`}

    <div style="text-align:center;padding:14px;background:#141519;border-radius:12px;border:1px solid #25D36633;">
      <p style="color:#AAAAAA;font-size:13px;margin:0 0 8px;">Une question ? Contactez-nous directement</p>
      <a href="https://wa.me/+237697657734" style="display:inline-block;background:#25D366;color:#FFFFFF;font-size:14px;font-weight:800;text-decoration:none;padding:10px 24px;border-radius:100px;">
        💬 WhatsApp +237 697 657 734
      </a>
    </div>
  </div>

  <div style="text-align:center;padding-top:20px;border-top:1px solid #1A1B20;">
    <p style="color:#444;font-size:12px;margin:0 0 6px;">Chreol Empire · Vallée 3, Boutiques Deido, Douala, Cameroun</p>
    <p style="color:#444;font-size:12px;margin:0;">
      <a href="https://chreolempire.com" style="color:#C9A84C;text-decoration:none;">chreolempire.com</a>
    </p>
  </div>

</div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Chreol Empire <no-reply@chreolempire.com>",
        to: [email],
        subject: `${isSell ? "🔄" : "✅"} Commande confirmée — Chreol Empire`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: res.ok ? 200 : 400,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
