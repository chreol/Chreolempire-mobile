import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Alert, Clipboard, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
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

// ─── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "mtn",     label: "MTN MoMo",     icon: "🟡", color: "#FACC15", short: "Flotte" },
  { id: "orange",  label: "Orange Money", icon: "🟠", color: "#FF6600", short: "Transfert UV" },
  { id: "paypal",  label: "PayPal",        icon: "🔵", color: "#003087", short: "Euros" },
  { id: "neero",   label: "Neero",         icon: "💜", color: "#8B5CF6", short: "@blondelccde" },
  { id: "especes", label: "Espèces Cash",       icon: "💵", color: "#25D366", short: "Bureau Douala" },
  { id: "crypto",  label: "Crypto",        icon: "₿",  color: "#26A17B", short: "Sur demande" },
  { id: "uba",     label: "Virement UBA",  icon: "🏦", color: "#C9A84C", short: "Sur demande" },
] as const;

type PaymentId = (typeof PAYMENT_METHODS)[number]["id"];

// ─── Payment instruction card ─────────────────────────────────────────────────
function PaymentInstructions({ id, total }: { id: PaymentId; total: number }) {
  const fmt = total.toLocaleString("fr-FR");

  const copyCode = (code: string) => {
    Clipboard.setString(code);
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
          <Text style={instr.note}>Remplacez {total} par le montant exact si différent</Text>
        </View>
      );

    case "orange":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>🟠 Orange Money — Transfert UV</Text>
          <View style={instr.row}><Text style={instr.key}>Code marchand</Text><Text style={instr.val}>518554</Text></View>
          <View style={instr.row}><Text style={instr.key}>Numéro marchand</Text><Text style={instr.val}>692 251 299</Text></View>
          <View style={instr.row}><Text style={instr.key}>Nom affiché</Text><Text style={instr.val}>Ets Tagny</Text></View>
          <View style={instr.row}><Text style={instr.key}>Montant</Text><Text style={[instr.val, { color: "#FF6600" }]}>{fmt} FCFA</Text></View>
          <Text style={instr.codeLabel}>🛠️ Tapez directement sur votre téléphone :</Text>
          <TouchableOpacity style={instr.codeBox} onPress={() => copyCode(`#150*14*518554*692251299*${total}#`)} activeOpacity={0.8}>
            <Text style={instr.code}>#150*14*518554*692251299*{total}#</Text>
            <Text style={instr.codeCopy}>📋 Copier</Text>
          </TouchableOpacity>
          <Text style={instr.note}>Nom affiché lors du transfert : Ets Tagny</Text>
        </View>
      );

    case "paypal":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>🔵 PayPal Europe</Text>
          <View style={instr.row}><Text style={instr.key}>Email</Text><Text style={instr.val}>LARAMBAMBO@GMAIL.COM</Text></View>
          <View style={instr.row}><Text style={instr.key}>Devise</Text><Text style={instr.val}>Euros (€) uniquement</Text></View>
          <View style={instr.row}><Text style={instr.key}>Type d'envoi</Text><Text style={[instr.val, { color: "#003087" }]}>Famille ou Proche</Text></View>
          <View style={[instr.alertBox, { borderColor: "#003087" + "55", backgroundColor: "#00308722" }]}>
            <Text style={[instr.alertText, { color: "#6BA3BE" }]}>
              {"⚠️ Envoi OBLIGATOIRE en tant que \"Famille ou Proche\" — pas \"Biens ou Services\"\nLe taux de change est disponible dans la section PayPal Europe"}
            </Text>
          </View>
        </View>
      );

    case "neero":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>💜 Paiement Neero</Text>
          <View style={instr.row}><Text style={instr.key}>Code marchand</Text><Text style={instr.val}>@blondelccde</Text></View>
          <View style={instr.row}><Text style={instr.key}>Nom</Text><Text style={instr.val}>Blondel</Text></View>
          <View style={instr.row}><Text style={instr.key}>Montant</Text><Text style={[instr.val, { color: "#8B5CF6" }]}>{fmt} FCFA</Text></View>
          <Image source={IMG_NEERO} style={instr.qrImg} contentFit="contain" />
        </View>
      );

    case "especes":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>💵 Paiement en Espèces</Text>
          <Text style={[instr.note, { marginBottom: 8 }]}>Venez directement à notre bureau :</Text>
          <View style={instr.row}><Text style={instr.key}>📍 Adresse</Text><Text style={instr.val}>Vallée 3 Boutiques – Deido, Douala</Text></View>
          <View style={instr.row}><Text style={instr.key}>📞 RDV</Text><Text style={instr.val}>(237) 694 360 978</Text></View>
          <View style={instr.row}><Text style={instr.key}>💰 Montant</Text><Text style={[instr.val, { color: "#25D366" }]}>{fmt} FCFA</Text></View>
          <TouchableOpacity
            style={[instr.actionBtn, { backgroundColor: "#25D36622", borderColor: "#25D36644" }]}
            onPress={() => Linking.openURL(`tel:+237694360978`)}
            activeOpacity={0.8}
          >
            <Text style={[instr.actionBtnText, { color: "#25D366" }]}>📞 Appeler pour un RDV</Text>
          </TouchableOpacity>
        </View>
      );

    case "crypto":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>₿ Paiement Crypto</Text>
          <Text style={instr.note}>
            {"Disponible sur demande uniquement.\nContactez-nous sur WhatsApp pour recevoir l'adresse du wallet et le taux du jour.\nCrypto acceptées : USDT, BTC, TRX, USDC"}
          </Text>
          <TouchableOpacity
            style={[instr.actionBtn, { backgroundColor: "#26A17B22", borderColor: "#26A17B44" }]}
            onPress={() => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`)}
            activeOpacity={0.8}
          >
            <Text style={[instr.actionBtnText, { color: "#26A17B" }]}>💬 Contacter sur WhatsApp</Text>
          </TouchableOpacity>
        </View>
      );

    case "uba":
      return (
        <View style={instr.wrap}>
          <Text style={instr.title}>🏦 Virement UBA</Text>
          <Text style={instr.note}>
            {"Disponible sur demande uniquement.\nContactez-nous sur WhatsApp pour recevoir les coordonnées bancaires UBA."}
          </Text>
          <View style={instr.row}><Text style={instr.key}>Montant</Text><Text style={[instr.val, { color: "#C9A84C" }]}>{fmt} FCFA</Text></View>
          <TouchableOpacity
            style={[instr.actionBtn, { backgroundColor: "#C9A84C22", borderColor: "#C9A84C44" }]}
            onPress={() => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`)}
            activeOpacity={0.8}
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

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CartScreen() {
  const router = useRouter();
  const { items, updateQty, removeItem, clearCart, total, count } = useCart();
  const { addEntry, history } = useHistory();
  const { addStamp } = useLoyalty();
  const [payment, setPayment] = useState<PaymentId>("mtn");
  const [deliveryEmail, setDeliveryEmail] = useState("");

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === payment)!;

  // Distinguish coupon/crypto-sell/paypal-sell items (Chreol pays) from purchase items
  const couponItems     = items.filter(i => i.cardId.startsWith("coupon-"));
  const cryptoSellItems = items.filter(i => i.cardId === "crypto-sell");
  const paypalSellItems = items.filter(i => i.cardId === "paypal-sell");
  const regularItems    = items.filter(i => !i.cardId.startsWith("coupon-") && i.cardId !== "crypto-sell" && i.cardId !== "paypal-sell");
  const allCoupons      = (couponItems.length + cryptoSellItems.length + paypalSellItems.length) > 0 && regularItems.length === 0;
  const hasConflict     = regularItems.length > 0 && (couponItems.length + cryptoSellItems.length + paypalSellItems.length) > 0;
  const regularTotal    = regularItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const buildWhatsAppMsg = () => {
    let msg = `Bonjour Chreol Empire 👋\n\n`;

    // En cas de conflit on n'envoie que les articles réguliers
    if (hasConflict) {
      const lines = regularItems.map(i =>
        `  • ${i.cardName} ${i.amount} × ${i.qty} = ${(i.price * i.qty).toLocaleString("fr-FR")} FCFA`
      ).join("\n");
      const m = PAYMENT_METHODS.find(x => x.id === payment)!;
      let payLine = `${m.icon} *${m.label}*`;
      if (payment === "mtn") payLine += `\n  Numéro marchand : 672416141\n  Code USSD : *126*14*672416141*${regularTotal}#`;
      else if (payment === "orange") payLine += `\n  Code marchand : 518554 / Numéro : 692251299\n  Code USSD : #150*14*518554*692251299*${regularTotal}#`;
      else if (payment === "paypal") payLine += `\n  Email : LARAMBAMBO@GMAIL.COM (Famille/Proche, en €)`;
      else if (payment === "neero") payLine += `\n  Code marchand : @blondelccde`;
      else if (payment === "especes") payLine += `\n  Bureau : Vallée 3 Boutiques – Deido, Douala`;
      else payLine += ` — sur demande`;
      const emailLine = deliveryEmail.trim() ? `\n📧 *Livraison email :* ${deliveryEmail.trim()}` : "";
      msg += `📦 *COMMANDE*\n${lines}\n\n💰 *Total : ${regularTotal.toLocaleString("fr-FR")} FCFA*\n\n💳 *Mode de paiement :*\n${payLine}${emailLine}\n\n📸 *Je vais vous envoyer ici la capture d'écran de ma preuve de paiement.*`;
      return msg;
    }

    // ── Section échange coupons ──
    if (couponItems.length > 0) {
      const lines = couponItems.map(i =>
        `  • ${i.cardName}\n    ➜ ${i.amount}`
      ).join("\n");
      msg += `🎟️ *DEMANDE D'ÉCHANGE COUPONS*\n${lines}\n\n`;
      msg += `📸 *Je vais vous envoyer ici la photo ou la capture d'écran de mes coupons pour vérification et traitement de l'échange.*`;
    }

    // ── Section vente crypto ──
    if (cryptoSellItems.length > 0) {
      if (couponItems.length > 0) msg += `\n\n${"─".repeat(30)}\n\n`;
      const lines = cryptoSellItems.map(i =>
        `  • ${i.cardName}\n    ➜ Montant à recevoir : ${i.amount}`
      ).join("\n");
      msg += `₿ *DEMANDE DE VENTE CRYPTO*\n${lines}\n\n`;
      msg += `📲 *Je vais vous envoyer ici la capture d'écran de la transaction blockchain prouvant l'envoi des cryptos à votre adresse.*`;
    }

    // ── Section vente PayPal ──
    if (paypalSellItems.length > 0) {
      if (couponItems.length > 0 || cryptoSellItems.length > 0) msg += `\n\n${"─".repeat(30)}\n\n`;
      const lines = paypalSellItems.map(i =>
        `  • ${i.cardName}\n    ➜ Montant à recevoir : ${i.amount}`
      ).join("\n");
      msg += `💶 *DEMANDE DE VENTE PAYPAL*\n${lines}\n\n`;
      msg += `📲 *Je vais vous envoyer ici la capture d'écran prouvant l'envoi PayPal à votre adresse email.*`;
    }

    // ── Section commande d'achat ──
    if (regularItems.length > 0) {
      if (couponItems.length > 0) msg += `\n\n${"─".repeat(30)}\n\n`;
      const lines = regularItems.map(i =>
        `  • ${i.cardName} ${i.amount} × ${i.qty} = ${(i.price * i.qty).toLocaleString("fr-FR")} FCFA`
      ).join("\n");

      let paymentLine = `${selectedMethod.icon} *${selectedMethod.label}*`;
      if (payment === "mtn") {
        paymentLine += `\n  Numéro marchand : 672416141 (ETS Content)\n  Code USSD : *126*14*672416141*${regularTotal}#`;
      } else if (payment === "orange") {
        paymentLine += `\n  Code marchand : 518554 / Numéro : 692251299 (Ets Tagny)\n  Code USSD : #150*14*518554*692251299*${regularTotal}#`;
      } else if (payment === "paypal") {
        paymentLine += `\n  Email : LARAMBAMBO@GMAIL.COM (Famille/Proche, en €)`;
      } else if (payment === "neero") {
        paymentLine += `\n  Code marchand : @blondelccde (Blondel)`;
      } else if (payment === "especes") {
        paymentLine += `\n  Bureau : Vallée 3 Boutiques – Deido, Douala`;
      } else {
        paymentLine += ` — sur demande`;
      }

      const emailLine = deliveryEmail.trim()
        ? `\n📧 *Livraison par email :* ${deliveryEmail.trim()}`
        : "";

      msg +=
        `📦 *COMMANDE*\n${lines}\n\n` +
        `💰 *Total : ${regularTotal.toLocaleString("fr-FR")} FCFA*\n\n` +
        `💳 *Mode de paiement :*\n${paymentLine}${emailLine}\n\n` +
        `📸 *Je vais vous envoyer ici la capture d'écran de ma preuve de paiement pour déclencher l'envoi immédiat de ma commande.*`;
    }

    return msg;
  };

  const handleOrder = async () => {
    if (items.length === 0) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Déterminer le type pour l'historique
    let type: OrderType = "achat";
    if (allCoupons) {
      const kinds = [couponItems.length > 0, cryptoSellItems.length > 0, paypalSellItems.length > 0].filter(Boolean).length;
      if (kinds > 1) type = "mixte";
      else if (couponItems.length > 0) type = "coupon";
      else if (cryptoSellItems.length > 0) type = "crypto-sell";
      else type = "paypal-sell";
    }

    // En conflit on ne comptabilise que les articles réguliers
    const effectiveItems = hasConflict ? regularItems : items;
    const effectiveTotal = hasConflict ? regularTotal : total;
    const summary = effectiveItems.map(i => `${i.cardName} ${i.amount}`).join(", ").slice(0, 120);

    await addEntry({
      type,
      summary,
      total: effectiveTotal,
      paymentMethod: !allCoupons ? selectedMethod.label : undefined,
      itemCount: effectiveItems.reduce((s, i) => s + i.qty, 0),
    });

    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(buildWhatsAppMsg())}`);
    scheduleOrderNotification("submitted", summary);
    if (!allCoupons) addStamp();
    clearCart();

    // Demande d'avis natif à la 3e et 10e commande
    const historyLen = history.length + 1;
    if (historyLen === 3 || historyLen === 10) {
      const canAsk = await StoreReview.hasAction();
      if (canAsk) setTimeout(() => StoreReview.requestReview(), 2000);
    }
  };

  const confirmClear = () => Alert.alert(
    "Vider le panier",
    "Êtes-vous sûr(e) de vouloir vider le panier ?\nTous les articles seront supprimés définitivement.",
    [
      { text: "Annuler", style: "cancel" },
      { text: "Tout supprimer", style: "destructive", onPress: () => clearCart() },
    ]
  );

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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
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

        {/* ── BANNIÈRE CONFLIT ── */}
        {hasConflict && (
          <View style={styles.conflictBanner}>
            <Text style={styles.conflictBannerTitle}>⚠️ Services incompatibles détectés</Text>
            <Text style={styles.conflictBannerText}>
              {"Les services où Chreol Empire vous paie (échange coupon, vente crypto, vente PayPal) ne peuvent pas être combinés avec un achat. Les services incompatibles sont exclus de la commande."}
            </Text>
            <TouchableOpacity
              style={styles.conflictRemoveBtn}
              onPress={() => {
                couponItems.forEach(i => removeItem(i.id));
                cryptoSellItems.forEach(i => removeItem(i.id));
                paypalSellItems.forEach(i => removeItem(i.id));
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.conflictRemoveBtnText}>🗑 Retirer les services incompatibles</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            {allCoupons ? "Montant à recevoir" : "Total commande"}
          </Text>
          <Text style={styles.totalValue}>
            {(hasConflict ? regularTotal : total).toLocaleString("fr-FR")} FCFA
          </Text>
        </View>

        {/* ── MODE DE PAIEMENT — masqué pour les échanges coupons ── */}
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

            <MotiView
              key={payment}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 280 }}
              style={[styles.instrCard, { borderColor: selectedMethod.color + "55" }]}
            >
              <PaymentInstructions id={payment} total={regularTotal} />
            </MotiView>

            <View style={styles.emailSection}>
              <Text style={styles.sectionLabel}>Livraison par email (optionnel)</Text>
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
              <Text style={styles.emailNote}>
                Renseignez votre adresse email si vous souhaitez recevoir vos codes par email (en plus de WhatsApp)
              </Text>
            </View>

            <View style={styles.proofBox}>
              <Text style={styles.proofTitle}>📸 Preuve de paiement obligatoire</Text>
              <Text style={styles.proofText}>
                {"Une fois votre paiement effectué, envoyez-nous ici la capture d'écran de votre reçu pour déclencher l'envoi immédiat de vos codes."}
              </Text>
            </View>
          </>
        )}

        {/* ── RAPPEL COUPON — visible uniquement pour les échanges ── */}
        {couponItems.length > 0 && (
          <View style={styles.couponReminderBox}>
            <Text style={styles.couponReminderTitle}>📸 Envoi des coupons requis</Text>
            <Text style={styles.couponReminderText}>
              {"Après soumission, envoyez-nous ici la photo ou la capture d'écran de vos coupons sur WhatsApp.\nNous traiterons l'échange dès vérification de vos codes."}
            </Text>
          </View>
        )}

        {/* ── RAPPEL PAYPAL SELL ── */}
        {paypalSellItems.length > 0 && (
          <View style={styles.paypalReminderBox}>
            <Text style={styles.paypalReminderTitle}>📲 Envoi de la preuve PayPal requis</Text>
            <Text style={styles.paypalReminderText}>
              {"Après soumission, envoyez-nous la capture d'écran prouvant l'envoi PayPal à notre adresse email.\nNous traiterons le virement Mobile Money dès vérification."}
            </Text>
          </View>
        )}

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            {allCoupons
              ? "• Vérifiez vos codes avant envoi\n• L'échange est traité après vérification\n• Paiement Mobile Money sous 15–30 min après confirmation"
              : "• Vérifiez bien votre commande avant envoi\n• Aucune modification possible après validation\n• Livraison en 15–30 min après confirmation du paiement"}
          </Text>
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.bottomTotalLabel}>
              {allCoupons ? "À recevoir" : "À payer"}
            </Text>
            <Text style={styles.bottomTotal}>{(hasConflict ? regularTotal : total).toLocaleString("fr-FR")} FCFA</Text>
          </View>
          {!allCoupons && (
            <Text style={[styles.bottomMethod, { color: selectedMethod.color }]}>
              {selectedMethod.icon} {selectedMethod.label}
            </Text>
          )}
          {allCoupons && (
            <Text style={[styles.bottomMethod, { color: "#25D366" }]}>
              📱 Mobile Money
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} activeOpacity={0.87}>
          <Text style={styles.orderBtnText}>
            {allCoupons ? "💬  Soumettre ma demande d'échange" : "💬  Valider & envoyer sur WhatsApp"}
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
    backgroundColor: "#0A0A0A",
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.strong,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  code: { fontSize: 14, color: "#FACC15", fontWeight: "800", fontVariant: ["tabular-nums"], flex: 1 },
  codeCopy: { fontSize: 12, color: colors.text.muted },
  note: { fontSize: 11, color: colors.text.muted, lineHeight: 16 },
  alertBox: {
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
  },
  alertText: { fontSize: 12, lineHeight: 18 },
  qrImg: { width: "100%", height: 140, borderRadius: radius.md, marginTop: 4 },
  actionBtn: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 4,
  },
  actionBtnText: { fontSize: 13, fontWeight: "800" },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
    gap: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 28, color: colors.text.primary, marginTop: -2 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: colors.text.primary },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  clearBtnText: { fontSize: 13, color: "#E50914", fontWeight: "700" },

  scroll: { padding: 16, gap: 16 },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 8,
  },

  // Items
  itemRowIncompat: { opacity: 0.45, backgroundColor: "#1A0800" },
  incompatBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FF6B0022", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    marginLeft: 14, marginBottom: 8,
  },
  incompatBadgeText: { fontSize: 10, fontWeight: "800", color: "#FF6B00" },
  conflictBanner: {
    backgroundColor: "#1A0800",
    borderRadius: radius.lg,
    padding: 14, borderWidth: 1, borderColor: "#FF6B0055",
  },
  conflictBannerTitle: { fontSize: 13, fontWeight: "800", color: "#FF6B00", marginBottom: 6 },
  conflictBannerText: { fontSize: 12, color: "#CC7030", lineHeight: 18, marginBottom: 10 },
  conflictRemoveBtn: {
    backgroundColor: "#FF6B0022", borderRadius: radius.full,
    borderWidth: 1, borderColor: "#FF6B0055",
    paddingVertical: 8, alignItems: "center",
  },
  conflictRemoveBtnText: { fontSize: 12, fontWeight: "800", color: "#FF6B00" },
  itemsCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 14, gap: 12,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "800", color: colors.text.primary },
  itemAmount: { fontSize: 12, color: colors.brand.gold, fontWeight: "700", marginTop: 2 },
  itemUnitPrice: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
  itemRight: { alignItems: "flex-end", gap: 6 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.bg.elevated,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border.default,
  },
  qtyBtnText: { fontSize: 16, color: colors.text.primary, fontWeight: "700", lineHeight: 20 },
  qtyValue: { fontSize: 15, fontWeight: "800", color: colors.text.primary, minWidth: 24, textAlign: "center" },
  itemTotal: { fontSize: 14, fontWeight: "800", color: colors.text.primary },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
  divider: { height: 1, backgroundColor: colors.border.default, marginHorizontal: 14 },

  // Total
  totalCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  totalLabel: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },
  totalValue: { fontSize: 22, fontWeight: "900", color: colors.text.primary },

  // Payment chips
  payChips: { gap: 10, paddingBottom: 4, marginBottom: 4 },
  payChip: {
    alignItems: "center", gap: 4,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
    minWidth: 90,
  },
  payChipImg: { width: 32, height: 32, borderRadius: 8 },
  payChipLabel: { fontSize: 11, fontWeight: "800", color: colors.text.muted, textAlign: "center" },
  payChipShort: { fontSize: 9, fontWeight: "600", color: colors.text.muted },

  // Instructions card
  instrCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: 16,
  },

  // Proof box
  proofBox: {
    backgroundColor: "#0A1A0A",
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1, borderColor: "#25D36655",
  },
  proofTitle: { fontSize: 13, fontWeight: "800", color: "#25D366", marginBottom: 8 },
  proofText: { fontSize: 12, color: "#7DCF9F", lineHeight: 19 },

  // Email delivery
  emailSection: {},
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 6,
  },
  emailIcon: { fontSize: 18 },
  emailInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 13,
  },
  emailNote: { fontSize: 11, color: colors.text.muted, lineHeight: 16 },

  // Coupon reminder (exchange orders)
  couponReminderBox: {
    backgroundColor: "#0D1A2A",
    borderRadius: radius.lg,
    padding: 14, borderWidth: 1, borderColor: "#3B82F644",
  },
  couponReminderTitle: { fontSize: 13, fontWeight: "800", color: "#60A5FA", marginBottom: 8 },
  couponReminderText: { fontSize: 12, color: "#93C5FD", lineHeight: 19 },

  // PayPal sell reminder
  paypalReminderBox: {
    backgroundColor: "#0A1020",
    borderRadius: radius.lg,
    padding: 14, borderWidth: 1, borderColor: "#003087" + "55",
  },
  paypalReminderTitle: { fontSize: 13, fontWeight: "800", color: "#6BA3BE", marginBottom: 8 },
  paypalReminderText: { fontSize: 12, color: "#93C5D0", lineHeight: 19 },

  // Warning
  warningBox: {
    backgroundColor: "#1A0A00",
    borderRadius: radius.lg,
    padding: 14, borderWidth: 1, borderColor: "#5A2A00",
  },
  warningTitle: { fontSize: 13, fontWeight: "700", color: "#FF6B00", marginBottom: 8 },
  warningText: { fontSize: 12, color: "#CC8040", lineHeight: 19 },

  // Bottom bar
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.card,
    borderTopWidth: 1, borderTopColor: colors.border.default,
    padding: 16, paddingBottom: 28, gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 12,
  },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bottomTotalLabel: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 },
  bottomTotal: { fontSize: 20, fontWeight: "900", color: colors.text.primary },
  bottomMethod: { fontSize: 13, fontWeight: "700" },
  orderBtn: {
    backgroundColor: "#25D366",
    borderRadius: radius.full, paddingVertical: 16,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  orderBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },

  // Empty state
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: colors.text.primary },
  emptySub: { fontSize: 14, color: colors.text.secondary },
  emptyBtn: {
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    paddingHorizontal: 24, paddingVertical: 14, marginTop: 8,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "800", color: "#0A0A0A" },
});
