import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_KEY = Deno.env.get("BREVO_API_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { email, name } = await req.json();
    if (!email) return new Response("missing email", { status: 400 });

    const firstName = name?.trim() || "cher client";

    const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Bienvenue chez Chreol Empire</title></head>
<body style="margin:0;padding:0;background:#0A0B0F;font-family:Arial,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:32px 16px;">

  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:48px;">👑</div>
    <h1 style="color:#C9A84C;font-size:22px;font-weight:900;margin:12px 0 4px;">Chreol Empire</h1>
    <p style="color:#666;font-size:13px;margin:0;">N°1 au Cameroun pour vos biens numériques</p>
  </div>

  <div style="background:#141519;border-radius:16px;border:1px solid #2A2B30;padding:28px;margin-bottom:16px;">
    <h2 style="color:#FFFFFF;font-size:20px;margin:0 0 12px;">Bienvenue ${firstName} ! 🎉</h2>
    <p style="color:#AAAAAA;font-size:14px;line-height:22px;margin:0 0 20px;">
      Merci de rejoindre la communauté Chreol Empire. Vous avez maintenant accès à tous nos services depuis l'application mobile.
    </p>
    <div style="background:#0A0B0F;border-radius:12px;padding:16px;margin-bottom:16px;">
      <p style="color:#C9A84C;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 12px;">Nos services</p>
      <p style="color:#AAAAAA;font-size:13px;line-height:20px;margin:0;">
        🎮 Cartes Cadeaux — PSN, iTunes, Roblox, Steam, Nintendo<br>
        🎟️ Coupons — PCS Mastercard &amp; Transcash en FCFA<br>
        ₿ Crypto &amp; PayPal — USDT, BTC, TRX, USDC, PayPal Europe<br>
        📺 Factures — Canal+, Eneo, Camwater, StarTimes<br>
        🏦 UBA Cameroun — Achat &amp; recharge carte bancaire
      </p>
    </div>
    <div style="background:#1A2A1A;border-radius:12px;border:1px solid #25D36644;padding:14px;">
      <p style="color:#25D366;font-size:13px;font-weight:700;margin:0 0 4px;">💬 Livraison express 15–30 min</p>
      <p style="color:#7DCF9F;font-size:12px;margin:0;">Commandes traitées sur WhatsApp · <strong>+237 697 657 734</strong></p>
    </div>
  </div>

  <div style="background:#1A1500;border-radius:16px;border:1px solid #C9A84C44;padding:18px;margin-bottom:16px;text-align:center;">
    <p style="color:#C9A84C;font-size:14px;font-weight:800;margin:0 0 6px;">🎁 Carte de fidélité offerte</p>
    <p style="color:#888;font-size:12px;margin:0;">Gagnez des tampons à chaque commande et obtenez des réductions exclusives.</p>
  </div>

  <div style="background:#0A1200;border-radius:16px;border:1px solid #25D36633;padding:18px;margin-bottom:16px;text-align:center;">
    <p style="color:#FFFFFF;font-size:14px;font-weight:800;margin:0 0 6px;">⭐ Satisfait de nos services ?</p>
    <p style="color:#AAAAAA;font-size:12px;margin:0 0 14px;">Laissez-nous un avis sur Google Maps — cela nous aide énormément !</p>
    <a href="https://www.google.com/maps/search/?api=1&query=Chreol+Empire+Douala+Cameroun" style="display:inline-block;background:#4285F4;color:#FFFFFF;font-size:13px;font-weight:800;text-decoration:none;padding:10px 22px;border-radius:100px;">
      🗺️ Laisser un avis Google
    </a>
  </div>

  <div style="text-align:center;padding-top:20px;border-top:1px solid #1A1B20;">
    <p style="color:#444;font-size:12px;margin:0 0 6px;">Chreol Empire · Vallée 3, Boutiques Deido, Douala, Cameroun</p>
    <p style="color:#444;font-size:12px;margin:0;">
      <a href="https://chreolempire.com" style="color:#C9A84C;text-decoration:none;">chreolempire.com</a>
      &nbsp;·&nbsp; WhatsApp : +237 697 657 734
    </p>
  </div>

</div>
</body>
</html>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: "Chreol Empire", email: "chreolempire00@gmail.com" },
        to: [{ email, name: name?.trim() || "client" }],
        subject: `👑 Bienvenue chez Chreol Empire, ${firstName} !`,
        htmlContent: html,
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
