import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_KEY = Deno.env.get("BREVO_API_KEY")!;

const VALID_STATUSES = ["pending", "processing", "done", "cancelled"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildReceiptHtml(order: any): string {
  const details = order.details ?? {};
  const detailType = details.type ?? "";
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const totalFmt = Number(order.total).toLocaleString("fr-FR");
  const giftCode = order.gift_code ?? null;

  let headerIcon = "✅";
  let headerTitle = "Commande Livrée";
  let headerSubtitle = "";
  let colorAccent = "#C9A84C";
  let totalLabel = "Total";
  let detailRows = "";
  let codeSection = "";

  if (detailType === "uba_recharge") {
    headerIcon = "🏦";
    headerTitle = "Reçu de Recharge UBA";
    headerSubtitle = "UBA Cameroun — Recharge de compte";
    totalLabel = "Montant rechargé";
    detailRows = `
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Carte</td><td style="color:#FFF;font-weight:700;text-align:right;font-family:monospace;">${details.card ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">ID Client</td><td style="color:#FFF;text-align:right;">${details.clientId ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Titulaire</td><td style="color:#FFF;text-align:right;">${details.name ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Téléphone</td><td style="color:#FFF;text-align:right;">${details.phone ?? "—"}</td></tr>`;
  } else if (detailType === "uba_card") {
    headerIcon = "💳";
    headerTitle = "Confirmation UBA";
    detailRows = `
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Titulaire</td><td style="color:#FFF;text-align:right;">${details.name ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Téléphone</td><td style="color:#FFF;text-align:right;">${details.phone ?? "—"}</td></tr>`;
  } else if (detailType === "crypto_buy") {
    headerIcon = "₿";
    headerTitle = "Preuve de Livraison Crypto";
    headerSubtitle = "Transaction blockchain confirmée";
    colorAccent = "#26A17B";
    totalLabel = "Valeur en FCFA";
    const w = details.wallet ?? "—";
    const walletDisplay = w.length > 20 ? `${w.slice(0, 10)}...${w.slice(-8)}` : w;
    detailRows = `
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Cryptomonnaie</td><td style="color:#26A17B;font-weight:700;text-align:right;">${details.cryptoType ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Adresse wallet</td><td style="color:#FFF;font-size:11px;text-align:right;font-family:monospace;">${walletDisplay}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Destinataire</td><td style="color:#FFF;text-align:right;">${details.name ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Téléphone</td><td style="color:#FFF;text-align:right;">${details.phone ?? "—"}</td></tr>`;
  } else if (detailType === "paypal_buy") {
    headerIcon = "💶";
    headerTitle = "Confirmation Envoi PayPal";
    headerSubtitle = "Paiement PayPal effectué";
    colorAccent = "#60A5FA";
    totalLabel = "Montant envoyé";
    detailRows = `
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Compte PayPal</td><td style="color:#60A5FA;text-align:right;">${details.paypalEmail ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Destinataire</td><td style="color:#FFF;text-align:right;">${details.name ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Téléphone</td><td style="color:#FFF;text-align:right;">${details.phone ?? "—"}</td></tr>`;
  } else if (detailType === "crypto_sell" || detailType === "paypal_sell") {
    headerIcon = "📲";
    headerTitle = "Confirmation de Versement";
    headerSubtitle = "Paiement Mobile Money effectué";
    const isOrange = details.operator === "Orange";
    colorAccent = isOrange ? "#FF6600" : "#FACC15";
    totalLabel = "Montant versé";
    detailRows = `
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Opérateur</td><td style="color:#FFF;font-weight:700;text-align:right;">${isOrange ? "🟠 Orange Money" : "🟡 MTN MoMo"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Numéro</td><td style="color:#FFF;text-align:right;">${details.momoNumber ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Bénéficiaire</td><td style="color:#FFF;text-align:right;">${details.name ?? "—"}</td></tr>`;
  } else if (detailType === "coupon_exchange") {
    headerIcon = "🎟️";
    headerTitle = "Bon de Livraison Coupon";
    colorAccent = "#A78BFA";
    totalLabel = "Montant échangé";
    const isOrange = details.operator === "Orange";
    detailRows = `
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Type de coupon</td><td style="color:#A78BFA;font-weight:700;text-align:right;">${details.couponType ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Opérateur</td><td style="color:#FFF;text-align:right;">${isOrange ? "🟠 Orange Money" : "🟡 MTN MoMo"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Numéro MoMo</td><td style="color:#FFF;text-align:right;">${details.momoNumber ?? "—"}</td></tr>
      <tr><td style="color:#666;font-size:12px;padding:8px 0;">Bénéficiaire</td><td style="color:#FFF;text-align:right;">${details.name ?? "—"}</td></tr>`;
  }

  if (giftCode) {
    codeSection = `
    <div style="background:linear-gradient(135deg,#1A1200,#0A0B0F);border-radius:12px;border:2px solid ${colorAccent};padding:20px;margin-bottom:16px;text-align:center;">
      <p style="color:${colorAccent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">🎁 Code de livraison</p>
      <p style="color:#FFFFFF;font-size:20px;font-family:monospace;font-weight:900;letter-spacing:4px;margin:0;word-break:break-all;">${giftCode}</p>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reçu — Chreol Empire</title></head>
<body style="margin:0;padding:0;background:#0A0B0F;font-family:Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:32px 16px;">

  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:48px;">${headerIcon}</div>
    <h1 style="color:#C9A84C;font-size:22px;font-weight:900;margin:12px 0 4px;">Chreol Empire</h1>
    <p style="color:#666;font-size:13px;margin:0;">Reçu officiel de transaction</p>
  </div>

  <div style="background:#0A2200;border-radius:12px;border:1px solid #25D36644;padding:14px;margin-bottom:20px;text-align:center;">
    <p style="color:#25D366;font-size:15px;font-weight:900;margin:0 0 4px;">✅ Commande traitée avec succès</p>
    <p style="color:#7DCF9F;font-size:12px;margin:0;">📅 ${dateStr}</p>
  </div>

  <div style="background:#141519;border-radius:16px;border:1px solid #2A2B30;padding:28px;margin-bottom:16px;">

    <div style="border-bottom:1px solid #2A2B30;padding-bottom:14px;margin-bottom:16px;">
      <p style="color:${colorAccent};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">${headerTitle}</p>
      ${headerSubtitle ? `<p style="color:#666;font-size:12px;margin:0;">${headerSubtitle}</p>` : ""}
    </div>

    <div style="background:#0A0B0F;border-radius:12px;padding:16px;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#666;font-size:12px;padding:8px 0;">N° Commande</td>
          <td style="color:#888;font-size:11px;font-family:monospace;text-align:right;">#${(order.id ?? "").slice(-8).toUpperCase()}</td>
        </tr>
        ${detailRows}
        ${order.payment_method ? `
        <tr>
          <td style="color:#666;font-size:12px;padding:8px 0;">Mode de paiement</td>
          <td style="color:#FFF;text-align:right;">💳 ${order.payment_method}</td>
        </tr>` : ""}
        <tr style="border-top:1px solid #2A2B30;">
          <td style="color:#AAAAAA;font-size:13px;font-weight:700;padding:14px 0 0;">${totalLabel}</td>
          <td style="color:${colorAccent};font-size:22px;font-weight:900;text-align:right;padding:14px 0 0;">${totalFmt} FCFA</td>
        </tr>
      </table>
    </div>

    ${codeSection}

    <div style="text-align:center;padding:14px;background:#0A0B0F;border-radius:12px;border:1px solid #25D36633;">
      <p style="color:#AAAAAA;font-size:12px;margin:0 0 10px;">Une question ? Notre équipe est disponible sur WhatsApp.</p>
      <a href="https://wa.me/+237697657734" style="display:inline-block;background:#25D366;color:#FFFFFF;font-size:14px;font-weight:800;text-decoration:none;padding:10px 24px;border-radius:100px;">
        💬 WhatsApp +237 697 657 734
      </a>
    </div>
  </div>

  <div style="background:#0A1200;border-radius:16px;border:1px solid #25D36633;padding:18px;margin-bottom:16px;text-align:center;">
    <p style="color:#FFFFFF;font-size:14px;font-weight:800;margin:0 0 6px;">⭐ Satisfait de nos services ?</p>
    <p style="color:#AAAAAA;font-size:12px;margin:0 0 14px;">Votre avis aide d'autres clients à nous faire confiance.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
      <a href="https://www.google.com/maps/search/?api=1&query=Chreol+Empire+Douala+Cameroun" style="display:inline-block;background:#4285F4;color:#FFFFFF;font-size:13px;font-weight:800;text-decoration:none;padding:10px 18px;border-radius:100px;margin:4px;">
        🗺️ Avis Google
      </a>
      <a href="https://www.trustpilot.com/review/monelecam.fr" style="display:inline-block;background:#00B67A;color:#FFFFFF;font-size:13px;font-weight:800;text-decoration:none;padding:10px 18px;border-radius:100px;margin:4px;">
        ★ Avis Trustpilot
      </a>
    </div>
  </div>

  <div style="text-align:center;padding-top:20px;border-top:1px solid #1A1B20;">
    <p style="color:#444;font-size:12px;margin:0 0 4px;">Chreol Empire · Vallée 3, Boutiques Deido, Douala, Cameroun</p>
    <p style="color:#444;font-size:12px;margin:0;">
      <a href="https://chreolempire.com" style="color:#C9A84C;text-decoration:none;">chreolempire.com</a>
    </p>
  </div>

</div>
</body>
</html>`;
}

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

    // Send receipt email when order is marked done
    if (status === "done") {
      try {
        const { data: order } = await supabase
          .from("orders")
          .select("id, type, summary, total, payment_method, client_name, client_email, details, gift_code")
          .eq("id", orderId)
          .single();

        console.log("[receipt] order.client_email =", order?.client_email);

        if (order?.client_email) {
          const orderWithCode = { ...order, gift_code: giftCode ?? order.gift_code };
          const html = buildReceiptHtml(orderWithCode);

          const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              sender: { name: "Chreol Empire", email: "noreply@chreolempire.com" },
              to: [{ email: order.client_email, name: order.client_name || "client" }],
              subject: "✅ Votre commande a été traitée — Chreol Empire",
              htmlContent: html,
            }),
          });

          const brevoBody = await brevoRes.text();
          console.log("[receipt] Brevo status =", brevoRes.status, "body =", brevoBody);
        }
      } catch (emailErr) {
        console.error("[receipt] error =", String(emailErr));
      }
    }

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
