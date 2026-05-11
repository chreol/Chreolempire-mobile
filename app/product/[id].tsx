import { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { PRODUCTS } from "@/constants/products";
import { colors, radius } from "@/constants/theme";
import type { PaymentMethod } from "@/lib/types";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; emoji: string; color: string }[] = [
  { id: "orange_money", label: "Orange Money", emoji: "🟠", color: "#FF6B00" },
  { id: "mtn_momo", label: "MTN MoMo", emoji: "🟡", color: "#FACC15" },
  { id: "crypto", label: "Crypto (USDT)", emoji: "💰", color: "#26A17B" },
  { id: "paypal", label: "PayPal", emoji: "🔵", color: "#0070BA" },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const product = PRODUCTS.find((p) => p.id === id);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);

  if (!product) return null;

  const openPaymentSheet = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    bottomSheetRef.current?.expand();
  };

  const handleConfirmOrder = async () => {
    if (!user || !selectedPayment) return;
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const amount = product.amounts[selectedAmount];

    const { data, error } = await supabase.from("orders").insert({
      user_id: user.uid,
      user_email: user.email ?? "",
      product_id: product.id,
      product_name: product.name,
      amount_fcfa: amount.value,
      amount_label: amount.label,
      payment_method: selectedPayment,
      status: "pending",
    }).select().single();

    setLoading(false);
    bottomSheetRef.current?.close();

    if (error) {
      Alert.alert("Erreur", "Impossible de créer la commande. Veuillez réessayer.");
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)/orders");
  };

  const selectedAmountData = product.amounts[selectedAmount];

  return (
    <>
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail produit</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product hero */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={[styles.productHero, { backgroundColor: product.color + "22" }]}
          >
            <View style={[styles.productIconLg, { backgroundColor: product.color + "33" }]}>
              <Text style={styles.productEmojiLg}>{product.emoji}</Text>
            </View>
            <Text style={styles.productName}>{product.name}</Text>
            {product.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>⚡ Populaire</Text>
              </View>
            )}
          </MotiView>

          {/* Amount selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Choisir le montant</Text>
            <View style={styles.amountsGrid}>
              {product.amounts.map((amount, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setSelectedAmount(i);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.amountCard,
                    selectedAmount === i && { borderColor: product.color, backgroundColor: product.color + "18" },
                  ]}
                >
                  <Text style={[styles.amountLabel, selectedAmount === i && { color: "#fff" }]}>
                    {amount.label}
                  </Text>
                  <Text style={[styles.amountPrice, { color: product.color }]}>
                    {amount.value.toLocaleString()} {amount.currency}
                  </Text>
                  {selectedAmount === i && (
                    <MotiView
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={[styles.selectedCheck, { backgroundColor: product.color }]}
                    >
                      <Text style={styles.selectedCheckText}>✓</Text>
                    </MotiView>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{product.description}</Text>
              <View style={styles.deliveryRow}>
                <View style={styles.deliveryBadge}>
                  <Text style={styles.deliveryText}>⚡ {product.deliveryTime}</Text>
                </View>
                <Text style={styles.deliveryNote}>Code envoyé par email</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Fixed buy button */}
        <View style={styles.fixedButton}>
          <View style={styles.pricePreview}>
            <Text style={styles.pricePreviewLabel}>Total</Text>
            <Text style={styles.pricePreviewValue}>
              {selectedAmountData.value.toLocaleString()} FCFA
            </Text>
          </View>
          <TouchableOpacity
            onPress={openPaymentSheet}
            style={[styles.buyButton, { backgroundColor: product.color }]}
            activeOpacity={0.88}
          >
            <Text style={styles.buyButtonText}>Acheter maintenant →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Payment Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["55%"]}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Choisir le paiement</Text>
          <Text style={styles.sheetSubtitle}>
            {product.name} — {selectedAmountData.label} —{" "}
            <Text style={{ color: colors.brand.gold, fontWeight: "700" }}>
              {selectedAmountData.value.toLocaleString()} FCFA
            </Text>
          </Text>

          <View style={styles.paymentMethods}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => {
                  setSelectedPayment(method.id);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.paymentMethod,
                  selectedPayment === method.id && {
                    borderColor: method.color,
                    backgroundColor: method.color + "18",
                  },
                ]}
              >
                <Text style={styles.paymentEmoji}>{method.emoji}</Text>
                <Text style={[
                  styles.paymentLabel,
                  selectedPayment === method.id && { color: "#fff" },
                ]}>
                  {method.label}
                </Text>
                {selectedPayment === method.id && (
                  <View style={[styles.paymentCheck, { backgroundColor: method.color }]}>
                    <Text style={styles.paymentCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleConfirmOrder}
            disabled={!selectedPayment || loading}
            style={[
              styles.confirmButton,
              (!selectedPayment || loading) && styles.confirmButtonDisabled,
            ]}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.confirmButtonText}>Confirmer la commande ✓</Text>
            }
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backButton: {
    width: 40, height: 40,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border.default,
  },
  backIcon: { fontSize: 20, color: colors.text.primary },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  productHero: {
    alignItems: "center", padding: 28, gap: 12, marginHorizontal: 20,
    borderRadius: radius["2xl"],
  },
  productIconLg: {
    width: 88, height: 88, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  productEmojiLg: { fontSize: 44 },
  productName: { fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 },
  popularBadge: {
    backgroundColor: colors.brand.gold + "22",
    borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.brand.gold + "44",
  },
  popularBadgeText: { color: colors.brand.gold, fontWeight: "700", fontSize: 12 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionLabel: {
    fontSize: 13, fontWeight: "700", color: colors.text.secondary,
    letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12,
  },
  amountsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amountCard: {
    width: "47%", padding: 14,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border.default,
    gap: 4, position: "relative",
  },
  amountLabel: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },
  amountPrice: { fontSize: 16, fontWeight: "800" },
  selectedCheck: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  selectedCheckText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  descriptionCard: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    padding: 16, gap: 12,
    borderWidth: 1, borderColor: colors.border.default,
  },
  descriptionText: { fontSize: 14, color: colors.text.secondary, lineHeight: 21 },
  deliveryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deliveryBadge: {
    backgroundColor: colors.brand.gold + "22",
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  deliveryText: { color: colors.brand.gold, fontSize: 12, fontWeight: "700" },
  deliveryNote: { fontSize: 12, color: colors.text.muted },
  fixedButton: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.primary,
    borderTopWidth: 1, borderTopColor: colors.border.default,
    padding: 20, flexDirection: "row", alignItems: "center", gap: 12,
  },
  pricePreview: { flex: 1 },
  pricePreviewLabel: { fontSize: 12, color: colors.text.secondary },
  pricePreviewValue: { fontSize: 20, fontWeight: "800", color: colors.brand.gold, letterSpacing: -0.3 },
  buyButton: {
    flex: 2, borderRadius: radius.full,
    paddingVertical: 16, alignItems: "center",
  },
  buyButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sheetBg: { backgroundColor: colors.bg.card, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetHandle: { backgroundColor: colors.border.strong, width: 40 },
  sheetContent: { padding: 24, gap: 16 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: colors.text.primary },
  sheetSubtitle: { fontSize: 14, color: colors.text.secondary },
  paymentMethods: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  paymentMethod: {
    width: "47%", flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl, padding: 14,
    borderWidth: 1.5, borderColor: colors.border.default,
    gap: 10, position: "relative",
  },
  paymentEmoji: { fontSize: 22 },
  paymentLabel: { fontSize: 14, fontWeight: "600", color: colors.text.secondary, flex: 1 },
  paymentCheck: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  paymentCheckText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  confirmButton: {
    backgroundColor: colors.brand.blue,
    borderRadius: radius.full, paddingVertical: 16, alignItems: "center",
  },
  confirmButtonDisabled: { opacity: 0.4 },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
