import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";
import { useCart, CartItem } from "@/contexts/CartContext";

const PAYMENT_METHODS = [
  {
    id: "orange",
    label: "Orange Money",
    number: "697 657 734",
    color: "#FF6600",
    icon: "🟠",
  },
  {
    id: "mtn",
    label: "MTN MoMo",
    number: "694 360 978",
    color: "#FACC15",
    icon: "🟡",
  },
] as const;

type PaymentId = (typeof PAYMENT_METHODS)[number]["id"];

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
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onQty(item.qty - 1); }}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onQty(item.qty + 1); }}
          >
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

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQty, removeItem, clearCart, total, count } = useCart();
  const [payment, setPayment] = useState<PaymentId>("orange");

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === payment)!;

  const handleOrder = async () => {
    if (items.length === 0) return;

    const lines = items.map(i =>
      `  • ${i.cardName} ${i.amount} × ${i.qty} = ${(i.price * i.qty).toLocaleString("fr-FR")} FCFA`
    ).join("\n");

    const msg =
      `Bonjour Chreol Empire 👋\n\n` +
      `📦 *COMMANDE*\n${lines}\n\n` +
      `💰 *Total : ${total.toLocaleString("fr-FR")} FCFA*\n\n` +
      `💳 *Paiement :* ${selectedMethod.label}\n` +
      `📱 Numéro : ${selectedMethod.number}\n\n` +
      `⚠️ Merci d'envoyer la preuve de paiement après transfert.`;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  const confirmClear = () => {
    Alert.alert(
      "Vider le panier",
      "Supprimer tous les articles ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Vider", style: "destructive", onPress: () => { clearCart(); router.back(); } },
      ]
    );
  };

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

        {/* Payment method */}
        <Text style={styles.sectionLabel}>Mode de paiement</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.paymentCard, payment === m.id && { borderColor: m.color, backgroundColor: m.color + "18" }]}
              onPress={() => setPayment(m.id)}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 28 }}>{m.icon}</Text>
              <Text style={[styles.paymentLabel, payment === m.id && { color: colors.text.primary }]}>{m.label}</Text>
              <Text style={[styles.paymentNumber, payment === m.id && { color: m.color }]}>{m.number}</Text>
              {payment === m.id && (
                <View style={[styles.paymentCheck, { backgroundColor: m.color }]}>
                  <Text style={{ color: "#0A0A0A", fontSize: 11, fontWeight: "900" }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment amount display */}
        <MotiView
          key={payment}
          from={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={[styles.amountDisplay, { borderColor: selectedMethod.color + "55" }]}
        >
          <Text style={styles.amountDisplayLabel}>Montant à envoyer</Text>
          <Text style={[styles.amountDisplayValue, { color: selectedMethod.color }]}>
            {total.toLocaleString("fr-FR")} FCFA
          </Text>
          <Text style={styles.amountDisplaySub}>
            {selectedMethod.icon} {selectedMethod.label} → {selectedMethod.number}
          </Text>
        </MotiView>

        {/* Warning bubble */}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Important</Text>
          <Text style={styles.warningText}>
            {"• Vérifiez bien votre commande avant validation\n• Aucune modification possible après envoi\n• Envoyez la preuve de paiement sur WhatsApp\n• Livraison en 15–30 min après confirmation"}
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toLocaleString("fr-FR")} FCFA</Text>
        </View>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} activeOpacity={0.87}>
          <Text style={styles.orderBtnIcon}>💬</Text>
          <Text style={styles.orderBtnText}>Valider &amp; envoyer sur WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 12, fontWeight: "700", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 8,
  },

  // Items card
  itemsCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    overflow: "hidden",
    marginBottom: 8,
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

  // Payment
  paymentRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  paymentCard: {
    flex: 1, alignItems: "center", gap: 6,
    padding: 14,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border.default,
  },
  paymentLabel: { fontSize: 12, fontWeight: "800", color: colors.text.secondary, textAlign: "center" },
  paymentNumber: { fontSize: 11, fontWeight: "600", color: colors.text.muted },
  paymentCheck: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },

  // Amount display
  amountDisplay: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl, borderWidth: 1.5,
    padding: 16, alignItems: "center", gap: 6,
    marginBottom: 8,
  },
  amountDisplayLabel: { fontSize: 12, color: colors.text.muted, fontWeight: "600" },
  amountDisplayValue: { fontSize: 26, fontWeight: "900" },
  amountDisplaySub: { fontSize: 12, color: colors.text.secondary },

  // Warning
  warningBox: {
    backgroundColor: "#1A0A00",
    borderRadius: radius.lg,
    padding: 14, borderWidth: 1, borderColor: "#5A2A00",
  },
  warningTitle: { fontSize: 13, fontWeight: "700", color: "#FF6B00", marginBottom: 8 },
  warningText: { fontSize: 12, color: "#CC8040", lineHeight: 20 },

  // Bottom bar
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.card,
    borderTopWidth: 1, borderTopColor: colors.border.default,
    padding: 16, paddingBottom: 28, gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 12,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 15, fontWeight: "700", color: colors.text.secondary },
  totalValue: { fontSize: 22, fontWeight: "900", color: colors.text.primary },
  orderBtn: {
    backgroundColor: "#25D366",
    borderRadius: radius.full, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  orderBtnIcon: { fontSize: 20 },
  orderBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },

  // Empty state
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: colors.text.primary },
  emptySub: { fontSize: 14, color: colors.text.secondary },
  emptyBtn: {
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    paddingHorizontal: 24, paddingVertical: 14,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "800", color: "#0A0A0A" },
});
