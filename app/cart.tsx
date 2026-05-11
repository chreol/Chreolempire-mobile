import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Alert, Clipboard,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";
import { useCart, CartItem } from "@/contexts/CartContext";

const IMG_NEERO = require("../assets/Neero paiement @blondelccde.png");

// ─── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "mtn",     label: "MTN MoMo",     icon: "🟡", color: "#FACC15", short: "Flotte" },
  { id: "orange",  label: "Orange Money", icon: "🟠", color: "#FF6600", short: "Transfert UV" },
  { id: "paypal",  label: "PayPal",        icon: "🔵", color: "#003087", short: "Euros" },
  { id: "neero",   label: "Neero",         icon: "💜", color: "#8B5CF6", short: "@blondelccde" },
  { id: "especes", label: "Espèces",       icon: "💵", color: "#25D366", short: "Bureau Douala" },
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
function CartItemRow({ item, onQty, onRemove }: {
  item: CartItem;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.itemRow}>
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
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CartScreen() {
  const router = useRouter();
  const { items, updateQty, removeItem, clearCart, total, count } = useCart();
  const [payment, setPayment] = useState<PaymentId>("mtn");

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === payment)!;
  const isMobileMoney = payment === "mtn" || payment === "orange";

  const buildWhatsAppMsg = () => {
    const lines = items.map(i =>
      `  • ${i.cardName} ${i.amount} × ${i.qty} = ${(i.price * i.qty).toLocaleString("fr-FR")} FCFA`
    ).join("\n");

    let paymentLine = `${selectedMethod.icon} *${selectedMethod.label}*`;
    if (payment === "mtn") {
      paymentLine += `\n  Numéro marchand : 672416141 (ETS Content)\n  Code USSD : *126*14*672416141*${total}#`;
    } else if (payment === "orange") {
      paymentLine += `\n  Code marchand : 518554 / Numéro : 692251299 (Ets Tagny)\n  Code USSD : #150*14*518554*692251299*${total}#`;
    } else if (payment === "paypal") {
      paymentLine += `\n  Email : LARAMBAMBO@GMAIL.COM (Famille/Proche, en €)`;
    } else if (payment === "neero") {
      paymentLine += `\n  Code marchand : @blondelccde (Blondel)`;
    } else if (payment === "especes") {
      paymentLine += `\n  Bureau : Vallée 3 Boutiques – Deido, Douala`;
    } else {
      paymentLine += ` — sur demande`;
    }

    return (
      `Bonjour Chreol Empire 👋\n\n` +
      `📦 *COMMANDE*\n${lines}\n\n` +
      `💰 *Total : ${total.toLocaleString("fr-FR")} FCFA*\n\n` +
      `💳 *Mode de paiement :*\n${paymentLine}\n\n` +
      `⚠️ *Je vais vous envoyer ici la capture d'écran (screenshot) de ma preuve de paiement pour déclencher l'envoi immédiat.*`
    );
  };

  const handleOrder = async () => {
    if (items.length === 0) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(buildWhatsAppMsg())}`);
  };

  const confirmClear = () => Alert.alert(
    "Vider le panier",
    "Supprimer tous les articles ?",
    [
      { text: "Annuler", style: "cancel" },
      { text: "Vider", style: "destructive", onPress: () => { clearCart(); router.back(); } },
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
          <Text style={styles.emptySub}>Ajoutez des articles depuis le catalogue</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace("/services/cartes-cadeaux")}>
            <Text style={styles.emptyBtnText}>Voir le catalogue →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
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
          {items.map((item, i) => (
            <View key={item.id}>
              {i > 0 && <View style={styles.divider} />}
              <CartItemRow
                item={item}
                onQty={(qty) => updateQty(item.id, qty)}
                onRemove={() => removeItem(item.id)}
              />
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total commande</Text>
          <Text style={styles.totalValue}>{total.toLocaleString("fr-FR")} FCFA</Text>
        </View>

        {/* Payment method selector */}
        <Text style={styles.sectionLabel}>Mode de paiement</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.payChips}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.payChip, payment === m.id && { borderColor: m.color, backgroundColor: m.color + "20" }]}
              onPress={() => setPayment(m.id)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 20 }}>{m.icon}</Text>
              <Text style={[styles.payChipLabel, payment === m.id && { color: colors.text.primary }]}>{m.label}</Text>
              <Text style={[styles.payChipShort, payment === m.id && { color: m.color }]}>{m.short}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Payment instructions */}
        <MotiView
          key={payment}
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 280 }}
          style={[styles.instrCard, { borderColor: selectedMethod.color + "55" }]}
        >
          <PaymentInstructions id={payment} total={total} />
        </MotiView>

        {/* Screenshot proof reminder */}
        <View style={styles.proofBox}>
          <Text style={styles.proofTitle}>📸 Preuve de paiement obligatoire</Text>
          <Text style={styles.proofText}>
            {"Une fois votre paiement effectué, envoyez-nous ici la capture d'écran (screenshot) de votre reçu ou preuve de transaction pour déclencher l'envoi immédiat de vos codes."}
          </Text>
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            {"• Vérifiez bien votre commande avant envoi\n• Aucune modification possible après validation\n• Livraison en 15–30 min après confirmation du paiement"}
          </Text>
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomRow}>
          <Text style={styles.bottomTotal}>{total.toLocaleString("fr-FR")} FCFA</Text>
          <Text style={[styles.bottomMethod, { color: selectedMethod.color }]}>
            {selectedMethod.icon} {selectedMethod.label}
          </Text>
        </View>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} activeOpacity={0.87}>
          <Text style={styles.orderBtnText}>💬  Valider &amp; envoyer sur WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
