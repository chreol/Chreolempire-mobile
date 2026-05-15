import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BREVO_KEY = Deno.env.get("BREVO_API_KEY") ?? "";

async function sendExpoPush(token: string | null, title: string, body: string) {
  if (!token || !token.startsWith("ExponentPushToken")) return;
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ to: token, title, body, sound: "default" }),
    });
  } catch { /* silencieux */ }
}

function buildReminderEmail(order: any): string {
  const shortId = (order.id ?? "").slice(-8).toUpperCase();
  const totalFmt = Number(order.total).toLocaleString("fr-FR");
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Votre commande vous attend — Chreol Empire</title></head>
<body style="margin:0;padding:0;background:#0A0B0F;font-family:Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:32px 16px;">

  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:52px;">⚡</div>
    <h1 style="color:#C9A84C;font-size:22px;font-weight:900;margin:12px 0 4px;">Chreol Empire</h1>
    <p style="color:#666;font-size:13px;margin:0;">Votre commande est en attente de paiement</p>
  </div>

  <div style="background:#1A1200;border-radius:12px;border:1px solid #C9A84C44;padding:16px;margin-bottom:20px;text-align:center;">
    <p style="color:#C9A84C;font-size:15px;font-weight:900;margin:0 0 4px;">⏳ Paiement non approuvé</p>
    <p style="color:#888;font-size:12px;margin:0;">Votre commande sera annulée dans 20 minutes si aucune action n'est effectuée.</p>
  </div>

  <div style="background:#141519;border-radius:16px;border:1px solid #2A2B30;padding:28px;margin-bottom:20px;">
    <p style="color:#FFFFFF;font-size:18px;font-weight:900;margin:0 0 8px;">Votre commande vous attend !</p>
    <p style="color:#AAAAAA;font-size:13px;line-height:21px;margin:0 0 20px;">
      Il ne reste qu'une étape. Ouvrez votre téléphone et approuvez la demande
      de paiement Mobile Money pour finaliser votre commande <strong style="color:#C9A84C;">#${shortId}</strong>.
    </p>

    <div style="background:#0A0B0F;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#666;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Votre commande</p>
      <p style="color:#FFF;font-size:13px;margin:0 0 10px;">${order.summary ?? "—"}</p>
      <p style="color:#C9A84C;font-size:24px;font-weight:900;margin:0;">${totalFmt} FCFA</p>
    </div>

    <div style="text-align:center;">
      <a href="https://wa.me/+237697657734?text=${encodeURIComponent(`Bonjour, je souhaite finaliser ma commande #${shortId}`)}"
         style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-size:16px;font-weight:900;text-decoration:none;padding:16px 36px;border-radius:100px;letter-spacing:0.3px;">
        ⚡ Finaliser ma commande →
      </a>
    </div>

    <p style="color:#444;font-size:11px;text-align:center;margin:20px 0 0;line-height:17px;">
      Si vous avez déjà approuvé le paiement, ignorez cet email.<br>
      Une question ? Répondez à ce message ou contactez-nous sur WhatsApp.
    </p>
  </div>

  <div style="text-align:center;padding-top:16px;border-top:1px solid #1A1B20;">
    <p style="color:#444;font-size:12px;margin:0 0 4px;">Chreol Empire · Vallée 3, Boutiques Deido, Douala, Cameroun</p>
    <p style="color:#444;font-size:12px;margin:0;"><a href="https://chreolempire.com" style="color:#C9A84C;text-decoration:none;">chreolempire.com</a></p>
  </div>

</div>
</body>
</html>`;
}

async function sendBrevo(to: string, name: string, subject: string, html: string) {
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Chreol Empire", email: "noreply@chreolempire.com" },
        to: [{ email: to, name: name || "client" }],
        subject,
        htmlContent: html,
      }),
    });
  } catch { /* silencieux */ }
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const now = new Date();
    const tenMinAgo  = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

    // Commandes à rappeler : entre 10 et 30 min sans approbation
    const { data: toRemind } = await supabase
      .from("orders")
      .select("id, summary, total, push_token, client_email, client_name")
      .eq("payment_status", "pending_campay")
      .eq("status", "pending")
      .lt("created_at", tenMinAgo)
      .gt("created_at", thirtyMinAgo);

    // Commandes à annuler : 30 min+ sans approbation
    const { data: toCancel } = await supabase
      .from("orders")
      .select("id")
      .eq("payment_status", "pending_campay")
      .eq("status", "pending")
      .lt("created_at", thirtyMinAgo);

    let reminded = 0;
    for (const order of (toRemind ?? [])) {
      await sendExpoPush(
        order.push_token,
        "⚡ Votre commande vous attend !",
        "Approuvez le paiement Mobile Money pour recevoir votre commande en 15 min.",
      );
      if (order.client_email) {
        await sendBrevo(
          order.client_email,
          order.client_name || "client",
          "⚡ Votre commande Chreol Empire est en attente — Finalisez maintenant",
          buildReminderEmail(order),
        );
      }
      reminded++;
    }

    let cancelled = 0;
    if (toCancel && toCancel.length > 0) {
      await supabase
        .from("orders")
        .update({ status: "cancelled", payment_status: "expired" })
        .in("id", toCancel.map(o => o.id));
      cancelled = toCancel.length;
    }

    console.log(`Reminder: ${reminded} rappels envoyés, ${cancelled} commandes annulées`);
    return new Response(JSON.stringify({ reminded, cancelled }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("payment-reminder error:", err);
    return new Response(String(err), { status: 500 });
  }
});
