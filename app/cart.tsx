import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Alert, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useHistory, OrderType } from "@/contexts/HistoryContext";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { useProfile } from "@/contexts/ProfileContext";
import { scheduleOrderNotification } from "@/hooks/usePushNotifications";
import * as StoreReview from "expo-store-review";

const IMG_NEERO = require("../assets/Neero paiement @blondelccde.webp");

const PAYIMG: Record<string, any> = {
  mtn:     require("../assets/MTN Mobile Money (MoMo) Payment .webp"),
  orange:  require("../assets/orange-money.webp"),
  paypal:  require("../assets/Paypal.webp"),
  neero:   require("../assets/neero paiement.webp"),
  especes: require("../assets/Espece.webp"),
  crypto:  require("../assets/Cryptomonnaies-visuel.webp"),
  uba:     require("../assets/ubaCameroun_logo.webp"),
};

const PAYMENT_METHODS = [
  { id: "mtn",     label: "MTN MoMo",     icon: "🟡", color: "#FACC15", short: "Flotte" },
  { id: "orange",  label: "Orange Money", icon: "🟠", color: "#FF6600", short: "Transfert UV" },
  { id: "paypal",  label: "PayPal",        icon: "🔵", color: "#003087", short: "Euros" },
  { id: "neero",   label: "Neero",         icon: "💜", color: "#8B5CF6", short: "@blondelccde" },
  { id: "especes", label: "Espèces Cash",  icon: "💵", color: "#25D366", short: "Bureau Douala" },
  { id: "crypto",  label: "Crypto",        icon: "₿",  color: "#26A17B", short: "Sur demande" },
  { id: "uba",     label: "Virement UBA",  icon: "🏦", color: "#C9A84C", short: "Sur demande" },
] as const;

type PaymentId = (typeof PAYMENT_METHODS)[number]["id"];

// ─── CardName parsers ─────────────────────────────────────────────────────────
function parseCouponCardName(cn: string) {
  return {
    couponType: cn.match(/^Échange (.+?) - Code/)?.[1] ?? "",
    code:       cn.match(/Code : (.+?) —/)?.[1] ?? "",
    benefName:  cn.match(/Bénéficiaire : (.+?) \(/)?.[1] ?? "",
    operator:   cn.match(/\((.+?) - Téléphone/)?.[1] ?? "",
    phone:      cn.match(/Téléphone : \+237(.+?)\)/)?.[1] ?? "",
  };
}
function parseCryptoSellCardName(cn: string) {
  return {
    cryptoName: cn.match(/Vente (.+?) —/)?.[1] ?? "",
    amount:     cn.match(/— ([\d.,]+)\$ via/)?.[1] ?? "",
    network:    cn.match(/via (.+?) — Hash/)?.[1] ?? "",
    txHash:     cn.match(/Hash: (.+?) —/)?.[1] ?? "",
    benefName:  cn.match(/Bénéficiaire : (.+?) \(/)?.[1] ?? "",
    operator:   cn.match(/\((MTN Mobile Money|Orange Money)/)?.[1] ?? "",
    phone:      cn.match(/\+237(\d+)\)/)?.[1] ?? "",
  };
}
function parseCryptoBuyCardName(cn: string) {
  return {
    cryptoName: cn.match(/Achat (.+?) —/)?.[1] ?? "",
    amount:     cn.match(/— ([\d.,]+)\$ →/)?.[1] ?? "",
    wallet:     cn.match(/Wallet : (.+?) \(/)?.[1] ?? "",
    network:    cn.match(/\((.+?)\)\s*$/)?.[1] ?? "",
  };
}
function parsePaypalSellCardName(cn: string) {
  return {
    amount:    cn.match(/— ([\d.,]+)€/)?.[1] ?? "",
    benefName: cn.match(/Bénéficiaire : (.+?) \(/)?.[1] ?? "",
    operator:  cn.match(/\((MTN Mobile Money|Orange Money)/)?.[1] ?? "",
    phone:     cn.match(/\+237(\d+)\)/)?.[1] ?? "",
  };
}
function parsePaypalBuyCardName(cn: string) {
  return {
    amount:   cn.match(/— ([\d.,]+)€/)?.[1] ?? "",
    paypalId: cn.match(/Compte : (.+)$/)?.[1] ?? "",
  };
}

// ─── PaymentInstructions ──────────────────────────────────────────────────────
function PaymentInstructions({ id, total }: { id: PaymentId; total: number }) {
  const fmt = total.toLocaleString("fr-FR");
  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copié !", `Code copié : ${code}`);
  };

  switch (id) {
    case "mtn":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>🟡 MTN MoMo — Flotte Marchand</Text>
          <View style={instr.row}><Text style={instr.key}>Numéro marchand</Text><Text style={instr.val}>672 416 141</Text></View>
          <View style={instr.row}><Text style={instr.key}>Nom affiché</Text><Text style={instr.val}>ETS Content</Text></View>
          <View style={instr.row}><Text style={instr.key}>Montant</Text><Text style={[instr.val, { color: "#FACC15" }]}>{fmt} FCFA</Text></View>
          <Text style={instr.codeLabel}>🛠️ Tapez directement sur votre téléphone :</Text>
          <TouchableOpacity style={instr.codeBox} onPress={() => copyCode(`*126*14*672416141*${total}#`)} activeOpacity={0.8}>
            <Text style={instr.code}>*126*14*672416141*{total}#</Text>
            <Text style={instr.codeCopy}>📋 Copier</Text>
          </TouchableOpacity>
        </View>
      );
    case "orange":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>🟠 Orange Money — Transfert UV</Text>
          <View style={instr.row}><Text style={instr.key}>Code marchand</Text><Text style={instr.val}>518554</Text></View>
          <View style={instr.row}><Text style={instr.key}>Numéro marchand</Text><Text style={instr.val}>692 251 299</Text></View>
          <View style={instr.row}><Text style={instr.key}>Montant</Text><Text style={[instr.val, { color: "#FF6600" }]}>{fmt} FCFA</Text></View>
          <Text style={instr.codeLabel}>🛠️ Tapez directement sur votre téléphone :</Text>
          <TouchableOpacity style={instr.codeBox} onPress={() => copyCode(`#150*14*518554*692251299*${total}#`)} activeOpacity={0.8}>
            <Text style={instr.code}>#150*14*518554*692251299*{total}#</Text>
            <Text style={instr.codeCopy}>📋 Copier</Text>
          </TouchableOpacity>
        </View>
      );
    case "paypal":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>🔵 PayPal Europe</Text>
          <View style={instr.row}><Text style={instr.key}>Email</Text><Text style={instr.val}>LARAMBAMBO@GMAIL.COM</Text></View>
          <View style={instr.row}><Text style={instr.key}>Type d'envoi</Text><Text style={[instr.val, { color: "#003087" }]}>Famille ou Proche</Text></View>
        </View>
      );
    case "neero":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>💜 Paiement Neero</Text>
          <View style={instr.row}><Text style={instr.key}>Code marchand</Text><Text style={instr.val}>@blondelccde</Text></View>
          <View style={instr.row}><Text style={instr.key}>Montant</Text><Text style={[instr.val, { color: "#8B5CF6" }]}>{fmt} FCFA</Text></View>
          <Image source={IMG_NEERO} style={instr.qrImg} contentFit="contain" />
        </View>
      );
    case "especes":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>💵 Paiement en Espèces</Text>
          <View style={instr.row}><Text style={instr.key}>📍 Adresse</Text><Text style={instr.val}>Vallée 3 Boutiques – Deido, Douala</Text></View>
          <View style={instr.row}><Text style={instr.key}>📞 RDV</Text><Text style={instr.val}>(237) 694 360 978</Text></View>
          <TouchableOpacity
            style={[instr.actionBtn, { backgroundColor: "#25D36622", borderColor: "#25D36644" }]}
            onPress={() => Linking.openURL(`tel:+237694360978`)}
          >
            <Text style={[instr.actionBtnText, { color: "#25D366" }]}>📞 Appeler pour un RDV</Text>
          </TouchableOpacity>
        </View>
      );
    case "crypto":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>₿ Paiement Crypto</Text>
          <Text style={instr.note}>Disponible sur demande. Contactez-nous sur WhatsApp.</Text>
          <TouchableOpacity
            style={[instr.actionBtn, { backgroundColor: "#26A17B22", borderColor: "#26A17B44" }]}
            onPress={() => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`)}
          >
            <Text style={[instr.actionBtnText, { color: "#26A17B" }]}>💬 Contacter sur WhatsApp</Text>
          </TouchableOpacity>
        </View>
      );
    case "uba":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>🏦 Virement UBA</Text>
          <Text style={instr.note}>Disponible sur demande. Contactez-nous sur WhatsApp.</Text>
          <TouchableOpacity
            style={[instr.actionBtn, { backgroundColor: "#C9A84C22", borderColor: "#C9A84C44" }]}
            onPress={() => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`)}
          >
            <Text style={[instr.actionBtnText, { color: "#C9A84C" }]}>💬 Demander les coordonnées</Text>
          </TouchableOpacity>
        </View>
      );
  }
}

// ─── Cart item row ─────────────────────────────────────────────────────────────
function CartItemRow({ item, onQty, onRemove, incompatible }: {
  item: CartItem;
  onQty: (qty: number) => void;
  onRemove: () => void;
  incompatible?: boolean;
}) {
  return (
    <View>
      {incompatible && (
        <View style={styles.incompatBadge}>
          <Text style={styles.incompatBadgeText}>⊘ Non compatible avec votre commande</Text>
        </View>
      )}
      <View style={[styles.itemRow, incompatible && styles.itemRowIncompat]}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.cardName}</Text>
          <Text style={styles.itemAmount}>{item.amount}</Text>
          <Text style={styles.itemUnitPrice}>{item.price.toLocaleString("fr-FR")} FCFA / unité</Text>
        </View>
        <View style={styles.itemRight}>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onQty(item.qty - 1); }}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.qty}</Text>
            <TouchableOpacity style={styles.qtyBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onQty(item.qty + 1); }}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.itemTotal}>{(item.price * item.qty).toLocaleString("fr-FR")} F</Text>
          <TouchableOpacity onPress={onRemove} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Opérateur tap buttons ─────────────────────────────────────────────────────
function OperatorSelector({ value, onChange }: { value: "MTN" | "Orange"; onChange: (v: "MTN" | "Orange") => void }) {
  return (
    <View style={styles.opRow}>
      {(["MTN", "Orange"] as const).map(op => (
        <TouchableOpacity
          key={op}
          style={[styles.opBtn, value === op && { borderColor: op === "MTN" ? "#FACC15" : "#FF6600", backgroundColor: op === "MTN" ? "#FACC1520" : "#FF660020" }]}
          onPress={() => onChange(op)}
          activeOpacity={0.8}
        >
          <Text style={[styles.opBtnText, value === op && { color: op === "MTN" ? "#FACC15" : "#FF6600" }]}>
            {op === "MTN" ? "🟡 MTN MoMo" : "🟠 Orange Money"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CartScreen() {
  const router = useRouter();
  const { items, updateQty, removeItem, clearCart, total, count } = useCart();
  const { addEntry, history } = useHistory();
  const { addStamp } = useLoyalty();
  const { profile } = useProfile();
  const [payment, setPayment] = useState<PaymentId>("mtn");
  const [deliveryEmail, setDeliveryEmail] = useState("");

  // ── Détecteurs de types ──────────────────────────────────────────────────
  const couponItems     = items.filter(i => i.cardId.startsWith("coupon-"));
  const cryptoSellItems = items.filter(i => i.cardId === "crypto-sell");
  const paypalSellItems = items.filter(i => i.cardId === "paypal-sell");
  const ubaItems        = items.filter(i => i.cardId.startsWith("uba-"));
  const cryptoBuyItems  = items.filter(i => i.cardId === "crypto-buy");
  const paypalBuyItems  = items.filter(i => i.cardId === "paypal-buy");
  const regularItems    = items.filter(i => !i.cardId.startsWith("coupon-") && i.cardId !== "crypto-sell" && i.cardId !== "paypal-sell");
  const isUbaRecharge   = ubaItems.some(i => i.cardId === "uba-recharge");
  const allCoupons      = (couponItems.length + cryptoSellItems.length + paypalSellItems.length) > 0 && regularItems.length === 0;
  const hasConflict     = regularItems.length > 0 && (couponItems.length + cryptoSellItems.length + paypalSellItems.length) > 0;
  const regularTotal    = regularItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === payment)!;

  // ── Parse UBA recharge data already stored in cardName ───────────────────
  const ubaRechargeData = (() => {
    if (!isUbaRecharge) return null;
    const cn = ubaItems.find(i => i.cardId === "uba-recharge")?.cardName ?? "";
    const card     = cn.match(/Recharge UBA — ([^,]+),/)?.[1]?.trim() ?? "";
    const name     = cn.match(/Nom complet:\s*\(([^)]+)\)/)?.[1]?.trim() ?? "";
    const clientId = cn.match(/ID Client \(([^)]+)\)/)?.[1]?.trim() ?? "";
    const phone    = cn.match(/Téléphone: \(([^)]+)\)/)?.[1]?.trim() ?? "";
    return { card, name, clientId, phone };
  })();

  // ── Formulaires par type ─────────────────────────────────────────────────
  // UBA (recharge: data parsed from cardName; uba_card: name+phone form)
  const [ubaName,  setUbaName]  = useState("");
  const [ubaPhone, setUbaPhone] = useState("");
  // Crypto achat
  const [cbOp,   setCbOp]   = useState<"MTN" | "Orange">("MTN");
  const [cbName, setCbName] = useState("");
  const [cbPhone, setCbPhone] = useState("");
  // Coupons
  const [cpnAmount, setCpnAmount] = useState("");

  // ── Pré-remplissage depuis le profil ────────────────────────────────────
  useEffect(() => {
    if (profile.email) setDeliveryEmail(prev => prev || profile.email);
  }, [profile.email]);

  useEffect(() => {
    if (!profile.name) return;
    const n = profile.name;
    setUbaName(prev => prev || n.toUpperCase());
    setCbName(prev => prev || n);
  }, [profile.name]);

  // ── WhatsApp message builder ─────────────────────────────────────────────
  const buildWhatsAppMsg = () => {
    let msg = `Bonjour Chreol Empire 👋\n\n`;
    const emailLine = deliveryEmail.trim() ? `\n📧 *Email :* ${deliveryEmail.trim()}` : "";

    if (hasConflict) {
      const lines = regularItems.map(i =>
        `  • ${i.cardName} ${i.amount} × ${i.qty} = ${(i.price * i.qty).toLocaleString("fr-FR")} FCFA`
      ).join("\n");
      const m = PAYMENT_METHODS.find(x => x.id === payment)!;
      let payLine = `${m.icon} *${m.label}*`;
      if (payment === "mtn") payLine += `\n  Numéro : 672416141 · Code : *126*14*672416141*${regularTotal}#`;
      else if (payment === "orange") payLine += `\n  Code : 518554 / 692251299 · #150*14*518554*692251299*${regularTotal}#`;
      msg += `📦 *COMMANDE*\n${lines}\n\n💰 *Total : ${regularTotal.toLocaleString("fr-FR")} FCFA*\n\n💳 *Paiement :*\n${payLine}${emailLine}\n\n📸 *Capture de paiement à envoyer ici.*`;
      return msg;
    }

    // ── Coupons ──
    if (couponItems.length > 0) {
      const lines = couponItems.map(i => `  • ${i.cardName}\n    ➜ ${i.amount}`).join("\n");
      const cpn0 = parseCouponCardName(couponItems[0]?.cardName ?? "");
      const momoLine = `📲 *Réception :* ${cpn0.operator} — +237${cpn0.phone}`;
      const amtLine  = cpnAmount.trim() ? `💰 *Montant estimé :* ${cpnAmount.trim()} FCFA\n` : "";
      msg += `🎟️ *DEMANDE D'ÉCHANGE COUPONS*\n${lines}\n\n${amtLine}${momoLine}\n👤 *Nom :* ${cpn0.benefName}${emailLine}\n\n📸 *Je vais vous envoyer ici la photo ou capture de mes coupons.*`;
    }

    // ── Vente crypto ──
    if (cryptoSellItems.length > 0) {
      if (couponItems.length > 0) msg += `\n\n${"─".repeat(30)}\n\n`;
      const lines = cryptoSellItems.map(i => `  • ${i.cardName}\n    ➜ Montant : ${i.amount}`).join("\n");
      msg += `₿ *DEMANDE DE VENTE CRYPTO*\n${lines}${emailLine}\n\n📲 *Je vais vous envoyer ici la capture de la transaction blockchain.*`;
    }

    // ── Vente PayPal ──
    if (paypalSellItems.length > 0) {
      if (couponItems.length > 0 || cryptoSellItems.length > 0) msg += `\n\n${"─".repeat(30)}\n\n`;
      const lines = paypalSellItems.map(i => `  • ${i.cardName}\n    ➜ Montant : ${i.amount}`).join("\n");
      msg += `💶 *DEMANDE DE VENTE PAYPAL*\n${lines}${emailLine}\n\n📲 *Je vais vous envoyer ici la capture prouvant l'envoi PayPal.*`;
    }

    // ── Commande d'achat ──
    if (regularItems.length > 0) {
      if (couponItems.length > 0) msg += `\n\n${"─".repeat(30)}\n\n`;
      const lines = regularItems.map(i =>
        `  • ${i.cardName} ${i.amount} × ${i.qty} = ${(i.price * i.qty).toLocaleString("fr-FR")} FCFA`
      ).join("\n");

      // Détails spécifiques par type
      let detailBlock = "";
      if (isUbaRecharge && ubaRechargeData?.card) {
        const d = ubaRechargeData;
        detailBlock += `\n\n🏦 *Détails Recharge UBA :*\n  📌 Carte : ${d.card}\n  🆔 ID : ${d.clientId}\n  👤 Nom : ${d.name}\n  📱 Téléphone : ${d.phone}`;
      } else if (ubaItems.length > 0) {
        detailBlock += `\n\n🏦 *Détails UBA :*\n  👤 Nom : ${ubaName.trim()}\n  📱 Téléphone : ${ubaPhone.trim()}`;
      }
      if (cryptoBuyItems.length > 0) {
        const cbParsed = parseCryptoBuyCardName(cryptoBuyItems[0]?.cardName ?? "");
        detailBlock += `\n\n₿ *Détails Achat Crypto :*\n  🔷 ${cbParsed.cryptoName} — ${cbParsed.network}\n  📬 Wallet : ${cbParsed.wallet}\n  🌐 Opérateur : ${cbOp}\n  👤 Nom : ${cbName.trim()}\n  📱 Téléphone : ${cbPhone.trim()}`;
      }
      if (paypalBuyItems.length > 0) {
        const ppParsed = parsePaypalBuyCardName(paypalBuyItems[0]?.cardName ?? "");
        detailBlock += `\n\n💶 *Détails Achat PayPal :*\n  📧 Compte PayPal : ${ppParsed.paypalId}`;
      }

      let paymentLine = `${selectedMethod.icon} *${selectedMethod.label}*`;
      if (payment === "mtn") paymentLine += `\n  Numéro : 672416141 · Code : *126*14*672416141*${regularTotal}#`;
      else if (payment === "orange") paymentLine += `\n  Code : 518554 / 692251299 · #150*14*518554*692251299*${regularTotal}#`;
      else if (payment === "paypal") paymentLine += `\n  Email : LARAMBAMBO@GMAIL.COM (Famille/Proche, en €)`;
      else if (payment === "neero") paymentLine += `\n  Code : @blondelccde`;
      else if (payment === "especes") paymentLine += `\n  Bureau : Vallée 3 – Deido, Douala`;
      else paymentLine += ` — sur demande`;

      msg += `📦 *COMMANDE*\n${lines}${detailBlock}\n\n💰 *Total : ${regularTotal.toLocaleString("fr-FR")} FCFA*\n\n💳 *Paiement :*\n${paymentLine}${emailLine}\n\n📸 *Je vais vous envoyer ici la capture de ma preuve de paiement.*`;
    }

    return msg;
  };

  // ── Construit le JSONB details pour Supabase ─────────────────────────────
  const buildDetails = (): Record<string, string> | null => {
    if (isUbaRecharge && ubaRechargeData) {
      const d = ubaRechargeData;
      return { type: "uba_recharge", card: d.card, clientId: d.clientId, name: d.name, phone: d.phone };
    }
    if (ubaItems.length > 0)     return { type: "uba_card",     name: ubaName.trim(), phone: ubaPhone.trim() };
    if (cryptoBuyItems.length > 0) {
      const d = parseCryptoBuyCardName(cryptoBuyItems[0]?.cardName ?? "");
      return { type: "crypto_buy", cryptoType: `${d.cryptoName} ${d.network}`, wallet: d.wallet, operator: cbOp, name: cbName.trim(), phone: cbPhone.trim() };
    }
    if (paypalBuyItems.length > 0) {
      const d = parsePaypalBuyCardName(paypalBuyItems[0]?.cardName ?? "");
      return { type: "paypal_buy", paypalId: d.paypalId };
    }
    if (cryptoSellItems.length > 0) {
      const d = parseCryptoSellCardName(cryptoSellItems[0]?.cardName ?? "");
      return { type: "crypto_sell", cryptoName: d.cryptoName, network: d.network, txHash: d.txHash, operator: d.operator, momoNumber: d.phone, name: d.benefName };
    }
    if (paypalSellItems.length > 0) {
      const d = parsePaypalSellCardName(paypalSellItems[0]?.cardName ?? "");
      return { type: "paypal_sell", operator: d.operator, momoNumber: d.phone, name: d.benefName };
    }
    if (couponItems.length > 0) {
      const d = parseCouponCardName(couponItems[0]?.cardName ?? "");
      const couponType = couponItems[0]?.cardId.replace("coupon-", "").toUpperCase() ?? "";
      return { type: "coupon_exchange", couponType, amount: cpnAmount.trim(), operator: d.operator, momoNumber: d.phone, name: d.benefName };
    }
    return null;
  };

  // ── Validation & soumission ──────────────────────────────────────────────
  const handleOrder = async () => {
    if (items.length === 0) return;

    // Email obligatoire
    if (!deliveryEmail.trim() || !deliveryEmail.includes("@")) {
      Alert.alert("Email requis", "Veuillez saisir une adresse email valide pour recevoir la confirmation.", [{ text: "OK" }]);
      return;
    }

    // UBA card purchase: name + phone required (recharge data comes from service page)
    if (ubaItems.length > 0 && !isUbaRecharge) {
      if (!ubaName.trim() || !ubaPhone.trim()) {
        Alert.alert("Infos UBA manquantes", "Veuillez renseigner votre nom et numéro de téléphone."); return;
      }
    }

    // Crypto achat
    if (cryptoBuyItems.length > 0) {
      if (!cbName.trim() || !cbPhone.trim()) { Alert.alert("Infos manquantes", "Nom et téléphone requis."); return; }
    }

    // Coupons
    if (couponItems.length > 0) {
      if (!cpnAmount.trim()) { Alert.alert("Montant requis", "Veuillez indiquer le montant estimé de votre coupon."); return; }
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let type: OrderType = "achat";
    if (allCoupons) {
      const kinds = [couponItems.length > 0, cryptoSellItems.length > 0, paypalSellItems.length > 0].filter(Boolean).length;
      if (kinds > 1)                    type = "mixte";
      else if (couponItems.length > 0)  type = "coupon";
      else if (cryptoSellItems.length > 0) type = "crypto-sell";
      else                              type = "paypal-sell";
    }

    const effectiveItems = hasConflict ? regularItems : items;
    const effectiveTotal = hasConflict ? regularTotal : total;
    const summary = effectiveItems.map(i => `${i.cardName} ${i.amount}`).join(", ").slice(0, 120);

    await addEntry(
      { type, summary, total: effectiveTotal, paymentMethod: !allCoupons ? selectedMethod.label : undefined, itemCount: effectiveItems.reduce((s, i) => s + i.qty, 0) },
      deliveryEmail.trim(),
      buildDetails(),
    );

    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(buildWhatsAppMsg())}`);
    scheduleOrderNotification("submitted", summary);
    if (!allCoupons) addStamp();
    clearCart();

    const historyLen = history.length + 1;
    if (historyLen === 3 || historyLen === 10) {
      const canAsk = await StoreReview.hasAction();
      if (canAsk) setTimeout(() => StoreReview.requestReview(), 2000);
    }
  };

  const confirmClear = () => Alert.alert(
    "Vider le panier",
    "Êtes-vous sûr(e) de vouloir vider le panier ?",
    [{ text: "Annuler", style: "cancel" }, { text: "Tout supprimer", style: "destructive", onPress: () => clearCart() }]
  );

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Panier</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 56 }}>🛒</Text>
          <Text style={styles.emptyTitle}>Panier vide</Text>
          <Text style={styles.emptySub}>Ajoutez des articles depuis nos services</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace("/(tabs)/services")}>
            <Text style={styles.emptyBtnText}>Voir nos services →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <SafeAreaView style={styles.container} edges={["top"]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panier ({count} article{count > 1 ? "s" : ""})</Text>
        <TouchableOpacity onPress={confirmClear} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Vider</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Items */}
        <Text style={styles.sectionLabel}>Articles</Text>
        <View style={styles.itemsCard}>
          {items.map((item, i) => {
            const isChreolPays = item.cardId.startsWith("coupon-") || item.cardId === "crypto-sell" || item.cardId === "paypal-sell";
            return (
              <View key={item.id}>
                {i > 0 && <View style={styles.divider} />}
                <CartItemRow
                  item={item}
                  onQty={(qty) => updateQty(item.id, qty)}
                  onRemove={() => removeItem(item.id)}
                  incompatible={hasConflict && isChreolPays}
                />
              </View>
            );
          })}
        </View>

        {/* Conflit */}
        {hasConflict && (
          <View style={styles.conflictBanner}>
            <Text style={styles.conflictBannerTitle}>⚠️ Services incompatibles détectés</Text>
            <Text style={styles.conflictBannerText}>Les échanges/ventes ne peuvent pas être combinés avec un achat. Ils sont exclus de la commande.</Text>
            <TouchableOpacity style={styles.conflictRemoveBtn} onPress={() => { couponItems.forEach(i => removeItem(i.id)); cryptoSellItems.forEach(i => removeItem(i.id)); paypalSellItems.forEach(i => removeItem(i.id)); }}>
              <Text style={styles.conflictRemoveBtnText}>🗑 Retirer les services incompatibles</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>{allCoupons ? "Montant à recevoir" : "Total commande"}</Text>
          <Text style={styles.totalValue}>{(hasConflict ? regularTotal : total).toLocaleString("fr-FR")} FCFA</Text>
        </View>

        {/* ── Paiement + détails achat ── */}
        {!allCoupons && (
          <>
            <Text style={styles.sectionLabel}>Mode de paiement</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.payChips}>
              {PAYMENT_METHODS.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.payChip, payment === m.id && { borderColor: m.color, backgroundColor: m.color + "20" }]}
                  onPress={() => setPayment(m.id)}
                  activeOpacity={0.8}
                >
                  <Image source={PAYIMG[m.id]} style={styles.payChipImg} contentFit="contain" />
                  <Text style={[styles.payChipLabel, payment === m.id && { color: colors.text.primary }]}>{m.label}</Text>
                  <Text style={[styles.payChipShort, payment === m.id && { color: m.color }]}>{m.short}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <MotiView key={payment} from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 280 }} style={[styles.instrCard, { borderColor: selectedMethod.color + "55" }]}>
              <PaymentInstructions id={payment} total={regularTotal} />
            </MotiView>

            {/* ── UBA : récap lecture seule pour recharge, form pour achat carte ── */}
            {isUbaRecharge && ubaRechargeData && (
              <View style={styles.formCard}>
                <Text style={styles.formCardTitle}>🏦 Récapitulatif Recharge UBA</Text>
                <Text style={styles.formHint}>Informations saisies lors de l'ajout au panier</Text>
                <View style={styles.recapRow}><Text style={styles.recapLabel}>Carte</Text><Text style={styles.recapValue}>{ubaRechargeData.card}</Text></View>
                <View style={styles.recapRow}><Text style={styles.recapLabel}>ID Client</Text><Text style={styles.recapValue}>{ubaRechargeData.clientId}</Text></View>
                <View style={styles.recapRow}><Text style={styles.recapLabel}>Titulaire</Text><Text style={styles.recapValue}>{ubaRechargeData.name}</Text></View>
                <View style={styles.recapRow}><Text style={styles.recapLabel}>Téléphone</Text><Text style={styles.recapValue}>{ubaRechargeData.phone}</Text></View>
              </View>
            )}
            {ubaItems.length > 0 && !isUbaRecharge && (
              <View style={styles.formCard}>
                <Text style={styles.formCardTitle}>🏦 Détails Carte UBA</Text>
                <Text style={styles.formLabel}>Nom complet *</Text>
                <TextInput style={styles.formInput} value={ubaName} onChangeText={setUbaName} placeholder="NOM Prénom" placeholderTextColor={colors.text.muted} autoCapitalize="characters" />
                <Text style={styles.formLabel}>Téléphone *</Text>
                <TextInput style={styles.formInput} value={ubaPhone} onChangeText={setUbaPhone} placeholder="6XX XXX XXX" placeholderTextColor={colors.text.muted} keyboardType="phone-pad" />
              </View>
            )}

            {/* ── Formulaire Crypto achat ── */}
            {cryptoBuyItems.length > 0 && (
              <View style={styles.formCard}>
                <Text style={styles.formCardTitle}>₿ Détails Achat Crypto</Text>
                <Text style={styles.formHint}>Wallet et réseau saisis lors de la demande</Text>
                {cryptoBuyItems.map(item => {
                  const d = parseCryptoBuyCardName(item.cardName);
                  return (
                    <View key={item.id}>
                      <View style={styles.recapRow}><Text style={styles.recapLabel}>Crypto</Text><Text style={styles.recapValue}>{d.cryptoName}</Text></View>
                      <View style={styles.recapRow}><Text style={styles.recapLabel}>Wallet</Text><Text style={[styles.recapValue, { fontSize: 10 }]}>{d.wallet}</Text></View>
                      <View style={styles.recapRow}><Text style={styles.recapLabel}>Réseau</Text><Text style={styles.recapValue}>{d.network}</Text></View>
                    </View>
                  );
                })}
                <Text style={styles.formLabel}>Opérateur Mobile Money *</Text>
                <OperatorSelector value={cbOp} onChange={setCbOp} />
                <Text style={styles.formLabel}>Nom complet *</Text>
                <TextInput style={styles.formInput} value={cbName} onChangeText={setCbName} placeholder="Votre nom" placeholderTextColor={colors.text.muted} />
                <Text style={styles.formLabel}>Téléphone *</Text>
                <TextInput style={styles.formInput} value={cbPhone} onChangeText={setCbPhone} placeholder="6XX XXX XXX" placeholderTextColor={colors.text.muted} keyboardType="phone-pad" />
              </View>
            )}

            {/* ── Récapitulatif PayPal achat ── */}
            {paypalBuyItems.length > 0 && (
              <View style={styles.formCard}>
                <Text style={styles.formCardTitle}>💶 Récapitulatif Achat PayPal</Text>
                <Text style={styles.formHint}>Informations saisies lors de la demande</Text>
                {paypalBuyItems.map(item => {
                  const d = parsePaypalBuyCardName(item.cardName);
                  return (
                    <View key={item.id}>
                      <View style={styles.recapRow}><Text style={styles.recapLabel}>Montant</Text><Text style={styles.recapValue}>{d.amount}€</Text></View>
                      <View style={styles.recapRow}><Text style={styles.recapLabel}>Compte PayPal</Text><Text style={styles.recapValue}>{d.paypalId}</Text></View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.proofBox}>
              <Text style={styles.proofTitle}>📸 Preuve de paiement obligatoire</Text>
              <Text style={styles.proofText}>Une fois votre paiement effectué, envoyez la capture d'écran de votre reçu sur WhatsApp.</Text>
            </View>
          </>
        )}

        {/* ── Vente Crypto (récap lecture seule) ── */}
        {cryptoSellItems.length > 0 && (
          <>
            <View style={styles.couponReminderBox}>
              <Text style={styles.couponReminderTitle}>₿ Envoi crypto requis</Text>
              <Text style={styles.couponReminderText}>Envoyez la capture d'écran de la transaction blockchain sur WhatsApp après soumission.</Text>
            </View>
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>₿ Récapitulatif Vente Crypto</Text>
              <Text style={styles.formHint}>Informations saisies lors de l'ajout au panier</Text>
              {cryptoSellItems.map(item => {
                const d = parseCryptoSellCardName(item.cardName);
                return (
                  <View key={item.id}>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Crypto</Text><Text style={styles.recapValue}>{d.cryptoName}</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Montant</Text><Text style={styles.recapValue}>{d.amount}$</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Réseau</Text><Text style={styles.recapValue}>{d.network}</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Hash TX</Text><Text style={[styles.recapValue, { fontSize: 10 }]}>{d.txHash}</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Bénéficiaire</Text><Text style={styles.recapValue}>{d.benefName}</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Opérateur</Text><Text style={styles.recapValue}>{d.operator}</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Téléphone</Text><Text style={styles.recapValue}>+237{d.phone}</Text></View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── Vente PayPal (récap lecture seule) ── */}
        {paypalSellItems.length > 0 && (
          <>
            <View style={styles.paypalReminderBox}>
              <Text style={styles.paypalReminderTitle}>📲 Envoi PayPal requis</Text>
              <Text style={styles.paypalReminderText}>Envoyez à LARAMBAMBO@GMAIL.COM en Famille ou Proche. Joignez la capture sur WhatsApp après soumission.</Text>
            </View>
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>💶 Récapitulatif Vente PayPal</Text>
              <Text style={styles.formHint}>Informations saisies lors de l'ajout au panier</Text>
              {paypalSellItems.map(item => {
                const d = parsePaypalSellCardName(item.cardName);
                return (
                  <View key={item.id}>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Montant</Text><Text style={styles.recapValue}>{d.amount}€</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Bénéficiaire</Text><Text style={styles.recapValue}>{d.benefName}</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Opérateur</Text><Text style={styles.recapValue}>{d.operator}</Text></View>
                    <View style={styles.recapRow}><Text style={styles.recapLabel}>Téléphone</Text><Text style={styles.recapValue}>+237{d.phone}</Text></View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── Échange Coupons ── */}
        {couponItems.length > 0 && (
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>🎟️ Récapitulatif Échange Coupon</Text>
            <Text style={styles.formHint}>📸 Envoyez la photo du coupon sur WhatsApp après soumission</Text>
            {couponItems.map(item => {
              const d = parseCouponCardName(item.cardName);
              return (
                <View key={item.id}>
                  <View style={styles.recapRow}><Text style={styles.recapLabel}>Type</Text><Text style={styles.recapValue}>{d.couponType}</Text></View>
                  <View style={styles.recapRow}><Text style={styles.recapLabel}>Code</Text><Text style={styles.recapValue}>{d.code}</Text></View>
                  <View style={styles.recapRow}><Text style={styles.recapLabel}>Bénéficiaire</Text><Text style={styles.recapValue}>{d.benefName}</Text></View>
                  <View style={styles.recapRow}><Text style={styles.recapLabel}>Opérateur</Text><Text style={styles.recapValue}>{d.operator}</Text></View>
                  <View style={styles.recapRow}><Text style={styles.recapLabel}>Téléphone</Text><Text style={styles.recapValue}>+237{d.phone}</Text></View>
                </View>
              );
            })}
            <Text style={styles.formLabel}>Montant estimé (FCFA) *</Text>
            <TextInput style={styles.formInput} value={cpnAmount} onChangeText={setCpnAmount} placeholder="ex: 44000" placeholderTextColor={colors.text.muted} keyboardType="numeric" />
          </View>
        )}

        {/* Email de confirmation — obligatoire */}
        <View style={styles.emailSection}>
          <Text style={styles.sectionLabel}>Email de confirmation *</Text>
          <View style={styles.emailRow}>
            <Text style={styles.emailIcon}>📧</Text>
            <TextInput
              style={styles.emailInput}
              value={deliveryEmail}
              onChangeText={setDeliveryEmail}
              placeholder="votre@email.com"
              placeholderTextColor={colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>
          <Text style={styles.emailNote}>Obligatoire — confirmation de commande envoyée par email</Text>
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            {allCoupons
              ? "• Vérifiez vos codes avant envoi\n• L'échange est traité après vérification\n• Paiement Mobile Money sous 15–30 min"
              : "• Vérifiez bien votre commande avant envoi\n• Aucune modification possible après validation\n• Livraison en 15–30 min après confirmation du paiement"}
          </Text>
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.bottomTotalLabel}>{allCoupons ? "À recevoir" : "À payer"}</Text>
            <Text style={styles.bottomTotal}>{(hasConflict ? regularTotal : total).toLocaleString("fr-FR")} FCFA</Text>
          </View>
          {!allCoupons && <Text style={[styles.bottomMethod, { color: selectedMethod.color }]}>{selectedMethod.icon} {selectedMethod.label}</Text>}
          {allCoupons && <Text style={[styles.bottomMethod, { color: "#25D366" }]}>📱 Mobile Money</Text>}
        </View>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} activeOpacity={0.87}>
          <Text style={styles.orderBtnText}>
            {allCoupons ? "💬  Soumettre ma demande" : "💬  Valider & envoyer sur WhatsApp"}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Instruction styles ───────────────────────────────────────────────────────
const instr = StyleSheet.create({
  wrap: { gap: 10 },
  title: { fontSize: 14, fontWeight: "800", color: colors.text.primary, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  key: { fontSize: 12, color: colors.text.muted, fontWeight: "600", flex: 1 },
  val: { fontSize: 12, color: colors.text.secondary, fontWeight: "700", flex: 2, textAlign: "right" },
  codeLabel: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  codeBox: {
    backgroundColor: "#0A0A0A", borderRadius: radius.md, padding: 12,
    borderWidth: 1, borderColor: colors.border.strong,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  code: { fontSize: 13, color: "#FACC15", fontWeight: "800", flex: 1 },
  codeCopy: { fontSize: 12, color: colors.text.muted },
  note: { fontSize: 11, color: colors.text.muted, lineHeight: 16 },
  qrImg: { width: "100%", height: 140, borderRadius: radius.md, marginTop: 4 },
  actionBtn: { borderRadius: radius.full, borderWidth: 1, paddingVertical: 11, alignItems: "center", marginTop: 4 },
  actionBtnText: { fontSize: 13, fontWeight: "800" },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.default, gap: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 28, color: colors.text.primary, marginTop: -2 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: colors.text.primary },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  clearBtnText: { fontSize: 13, color: "#E50914", fontWeight: "700" },
  scroll: { padding: 16, gap: 16 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  // Items
  itemRowIncompat: { opacity: 0.45, backgroundColor: "#1A0800" },
  incompatBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FF6B0022", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 14, marginBottom: 8 },
  incompatBadgeText: { fontSize: 10, fontWeight: "800", color: "#FF6B00" },
  conflictBanner: { backgroundColor: "#1A0800", borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: "#FF6B0055" },
  conflictBannerTitle: { fontSize: 13, fontWeight: "800", color: "#FF6B00", marginBottom: 6 },
  conflictBannerText: { fontSize: 12, color: "#CC7030", lineHeight: 18, marginBottom: 10 },
  conflictRemoveBtn: { backgroundColor: "#FF6B0022", borderRadius: radius.full, borderWidth: 1, borderColor: "#FF6B0055", paddingVertical: 8, alignItems: "center" },
  conflictRemoveBtnText: { fontSize: 12, fontWeight: "800", color: "#FF6B00" },
  itemsCard: { backgroundColor: colors.bg.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border.default, overflow: "hidden" },
  itemRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "800", color: colors.text.primary },
  itemAmount: { fontSize: 12, color: colors.brand.gold, fontWeight: "700", marginTop: 2 },
  itemUnitPrice: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
  itemRight: { alignItems: "flex-end", gap: 6 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.bg.elevated, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border.default },
  qtyBtnText: { fontSize: 16, color: colors.text.primary, fontWeight: "700", lineHeight: 20 },
  qtyValue: { fontSize: 15, fontWeight: "800", color: colors.text.primary, minWidth: 24, textAlign: "center" },
  itemTotal: { fontSize: 14, fontWeight: "800", color: colors.text.primary },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
  divider: { height: 1, backgroundColor: colors.border.default, marginHorizontal: 14 },
  // Total
  totalCard: { backgroundColor: colors.bg.elevated, borderRadius: radius.xl, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: colors.border.strong },
  totalLabel: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },
  totalValue: { fontSize: 22, fontWeight: "900", color: colors.text.primary },
  // Payment chips
  payChips: { gap: 10, paddingBottom: 4, marginBottom: 4 },
  payChip: { alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.border.default, backgroundColor: colors.bg.card, minWidth: 90 },
  payChipImg: { width: 32, height: 32, borderRadius: 8 },
  payChipLabel: { fontSize: 11, fontWeight: "800", color: colors.text.muted, textAlign: "center" },
  payChipShort: { fontSize: 9, fontWeight: "600", color: colors.text.muted },
  instrCard: { backgroundColor: colors.bg.card, borderRadius: radius.xl, borderWidth: 1.5, padding: 16 },
  // Forms
  formCard: { backgroundColor: colors.bg.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border.strong, padding: 16, gap: 8 },
  formCardTitle: { fontSize: 14, fontWeight: "800", color: colors.text.primary, marginBottom: 4 },
  formLabel: { fontSize: 11, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 4 },
  formHint: { fontSize: 11, color: colors.text.muted, lineHeight: 16, fontStyle: "italic" },
  formInput: { backgroundColor: colors.bg.elevated, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border.default, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.text.primary, fontWeight: "600" },
  // Crypto type chips
  cryptoChips: { gap: 8, paddingVertical: 4 },
  cryptoChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border.default, backgroundColor: colors.bg.card },
  cryptoChipActive: { borderColor: "#26A17B", backgroundColor: "#26A17B20" },
  cryptoChipText: { fontSize: 12, fontWeight: "700", color: colors.text.muted },
  cryptoChipTextActive: { color: "#26A17B" },
  // Operator selector
  opRow: { flexDirection: "row", gap: 10 },
  opBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border.default, alignItems: "center", backgroundColor: colors.bg.card },
  opBtnText: { fontSize: 13, fontWeight: "700", color: colors.text.muted },
  // Proof / reminders
  proofBox: { backgroundColor: "#0A1A0A", borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: "#25D36655" },
  proofTitle: { fontSize: 13, fontWeight: "800", color: "#25D366", marginBottom: 8 },
  proofText: { fontSize: 12, color: "#7DCF9F", lineHeight: 19 },
  couponReminderBox: { backgroundColor: "#0D1A2A", borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: "#3B82F644" },
  couponReminderTitle: { fontSize: 13, fontWeight: "800", color: "#60A5FA", marginBottom: 8 },
  couponReminderText: { fontSize: 12, color: "#93C5FD", lineHeight: 19 },
  paypalReminderBox: { backgroundColor: "#0A1020", borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: "#00308755" },
  paypalReminderTitle: { fontSize: 13, fontWeight: "800", color: "#6BA3BE", marginBottom: 8 },
  paypalReminderText: { fontSize: 12, color: "#93C5D0", lineHeight: 19 },
  // Email
  emailSection: {},
  emailRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.bg.card, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border.default, paddingHorizontal: 14, gap: 10, marginBottom: 6 },
  emailIcon: { fontSize: 18 },
  emailInput: { flex: 1, fontSize: 14, color: colors.text.primary, paddingVertical: 13 },
  emailNote: { fontSize: 11, color: colors.text.muted, lineHeight: 16 },
  // Warning
  warningBox: { backgroundColor: "#1A0A00", borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: "#5A2A00" },
  warningTitle: { fontSize: 13, fontWeight: "700", color: "#FF6B00", marginBottom: 8 },
  warningText: { fontSize: 12, color: "#CC8040", lineHeight: 19 },
  // Bottom bar
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.bg.card, borderTopWidth: 1, borderTopColor: colors.border.default, padding: 16, paddingBottom: 28, gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 12 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bottomTotalLabel: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 },
  bottomTotal: { fontSize: 20, fontWeight: "900", color: colors.text.primary },
  bottomMethod: { fontSize: 13, fontWeight: "700" },
  orderBtn: { backgroundColor: "#25D366", borderRadius: radius.full, paddingVertical: 16, alignItems: "center", justifyContent: "center", shadowColor: "#25D366", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  orderBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },
  // Empty
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: colors.text.primary },
  emptySub: { fontSize: 14, color: colors.text.secondary },
  emptyBtn: { backgroundColor: colors.brand.gold, borderRadius: radius.full, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontWeight: "800", color: "#0A0A0A" },

  recapRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  recapLabel: { fontSize: 12, color: colors.text.muted },
  recapValue: { fontSize: 12, fontWeight: "700", color: colors.text.primary, fontFamily: "monospace" },
});
