import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

const BILLS = [
  { id: "canal", name: "Canal+", icon: "📺", color: "#006CB7", desc: "Abonnement Canal+, CanalSat, Canal+ Box" },
  { id: "eneo",  name: "Eneo",   icon: "⚡", color: "#FACC15", desc: "Facture d'électricité Eneo Cameroun" },
  { id: "camwater", name: "Camwater", icon: "💧", color: "#3B82F6", desc: "Facture d'eau CamWater" },
  { id: "startimes", name: "StarTimes", icon: "📡", color: "#E50914", desc: "Abonnement StarTimes TV" },
] as const;

type BillId = (typeof BILLS)[number]["id"];

const MOMO_OPERATORS = [
  { id: "orange", name: "Orange Money", icon: "🟠", color: "#FF6600" },
  { id: "mtn",    name: "MTN MoMo",    icon: "🟡", color: "#FACC15" },
  { id: "express",name: "Express Union",icon: "🟢", color: "#25D366" },
  { id: "yoomee", name: "Yoomee Money", icon: "🔵", color: "#3B82F6" },
] as const;

const COMMISSION = 200; // FCFA per bill payment
const MOMO_MIN = 1000;
const MOMO_MAX = 500000;

export default function FacturesScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<"factures" | "momo">("factures");
  const [selectedBill, setSelectedBill] = useState<BillId | null>(null);
  const [momoFrom, setMomoFrom] = useState<string | null>(null);
  const [momoTo, setMomoTo] = useState<string | null>(null);
  const [momoAmount, setMomoAmount] = useState("");

  const bill = BILLS.find(b => b.id === selectedBill);
  const momoAmountNum = parseFloat(momoAmount.replace(",", "."));
  const momoValid = !isNaN(momoAmountNum) && momoAmountNum >= MOMO_MIN && momoAmountNum <= MOMO_MAX;

  const handleOrderBill = async () => {
    if (!bill) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const msg =
      `Bonjour Chreol Empire 👋\n\n` +
      `🧾 *PAIEMENT FACTURE*\n` +
      `  • Service : ${bill.name}\n` +
      `  • Commission : ${COMMISSION} FCFA\n\n` +
      `Merci de me contacter pour la procédure de paiement.\n\n` +
      `⚠️ J'enverrai la preuve de paiement dès validation.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  const handleMomoExchange = async () => {
    if (!momoFrom || !momoTo || !momoValid) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const fromOp = MOMO_OPERATORS.find(o => o.id === momoFrom)!;
    const toOp   = MOMO_OPERATORS.find(o => o.id === momoTo)!;
    const msg =
      `Bonjour Chreol Empire 👋\n\n` +
      `🔄 *ÉCHANGE MOBILE MONEY*\n` +
      `  • De : ${fromOp.name}\n` +
      `  • Vers : ${toOp.name}\n` +
      `  • Montant : ${momoAmountNum.toLocaleString("fr-FR")} FCFA\n` +
      `  • Commission : 0% (taux 1:1)\n\n` +
      `Merci de me donner la procédure pour continuer.\n\n` +
      `⚠️ J'enverrai la preuve dès paiement effectué.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Paiement Factures</Text>
          <Text style={styles.headerSub}>Canal+ · Eneo · Camwater · StarTimes</Text>
        </View>
      </View>

      {/* Section toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeSection === "factures" && styles.toggleBtnActive]}
          onPress={() => setActiveSection("factures")}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, activeSection === "factures" && styles.toggleTextActive]}>
            🧾 Factures
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, activeSection === "momo" && styles.toggleBtnActive]}
          onPress={() => setActiveSection("momo")}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, activeSection === "momo" && styles.toggleTextActive]}>
            🔄 Échange MoMo
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {activeSection === "factures" && (
          <MotiView from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: "timing", duration: 280 }}>
            {/* Commission info */}
            <View style={styles.commissionCard}>
              <Text style={styles.commissionIcon}>💰</Text>
              <View style={styles.commissionBody}>
                <Text style={styles.commissionTitle}>Commission fixe</Text>
                <Text style={styles.commissionValue}>{COMMISSION} FCFA par paiement</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Choisissez le service</Text>
            <View style={styles.billGrid}>
              {BILLS.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.billCard, selectedBill === b.id && { borderColor: b.color, backgroundColor: b.color + "15" }]}
                  onPress={() => setSelectedBill(selectedBill === b.id ? null : b.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.billIcon}>{b.icon}</Text>
                  <Text style={[styles.billName, selectedBill === b.id && { color: colors.text.primary }]}>{b.name}</Text>
                  <Text style={styles.billDesc}>{b.desc}</Text>
                  {selectedBill === b.id && (
                    <View style={[styles.billCheck, { backgroundColor: b.color }]}>
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {bill && (
              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} style={styles.selectedCard}>
                <Text style={styles.selectedTitle}>{bill.icon} {bill.name} sélectionné</Text>
                <Text style={styles.selectedDesc}>{bill.desc}</Text>
                <View style={styles.selectedFee}>
                  <Text style={styles.selectedFeeLabel}>Commission</Text>
                  <Text style={styles.selectedFeeValue}>{COMMISSION} FCFA</Text>
                </View>
                <Text style={styles.selectedNote}>
                  Envoyez-nous votre numéro de contrat ou référence client via WhatsApp. Notre équipe procédera au paiement dans les 5–20 minutes.
                </Text>
                <TouchableOpacity style={styles.waBtn} onPress={handleOrderBill} activeOpacity={0.87}>
                  <Text style={styles.waBtnText}>💬 Commander via WhatsApp</Text>
                </TouchableOpacity>
              </MotiView>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ Comment ça marche ?</Text>
              <Text style={styles.infoText}>
                {"1. Choisissez votre service ci-dessus\n2. Cliquez sur \"Commander via WhatsApp\"\n3. Fournissez votre numéro de contrat\n4. Payez la facture + 200 FCFA de commission\n5. Confirmation en 5–20 minutes"}
              </Text>
            </View>
          </MotiView>
        )}

        {activeSection === "momo" && (
          <MotiView from={{ opacity: 0, translateX: 10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: "timing", duration: 280 }}>
            {/* 0% badge */}
            <View style={styles.zeroCommCard}>
              <Text style={styles.zeroCommIcon}>🎉</Text>
              <View>
                <Text style={styles.zeroCommTitle}>0% de commission</Text>
                <Text style={styles.zeroCommSub}>Échange 1:1 entre opérateurs</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>De quel opérateur ?</Text>
            <View style={styles.opRow}>
              {MOMO_OPERATORS.map(op => (
                <TouchableOpacity
                  key={op.id}
                  style={[styles.opChip, momoFrom === op.id && { borderColor: op.color, backgroundColor: op.color + "20" }]}
                  onPress={() => setMomoFrom(momoFrom === op.id ? null : op.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 20 }}>{op.icon}</Text>
                  <Text style={[styles.opName, momoFrom === op.id && { color: colors.text.primary }]}>{op.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Vers quel opérateur ?</Text>
            <View style={styles.opRow}>
              {MOMO_OPERATORS.filter(op => op.id !== momoFrom).map(op => (
                <TouchableOpacity
                  key={op.id}
                  style={[styles.opChip, momoTo === op.id && { borderColor: op.color, backgroundColor: op.color + "20" }]}
                  onPress={() => setMomoTo(momoTo === op.id ? null : op.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 20 }}>{op.icon}</Text>
                  <Text style={[styles.opName, momoTo === op.id && { color: colors.text.primary }]}>{op.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Montant à échanger</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                value={momoAmount}
                onChangeText={v => setMomoAmount(v.replace(/[^0-9]/g, ""))}
                placeholder="Ex: 50000"
                placeholderTextColor={colors.text.muted}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <Text style={styles.amountCur}>FCFA</Text>
            </View>
            <Text style={styles.amountLimits}>
              Min : {MOMO_MIN.toLocaleString("fr-FR")} FCFA  ·  Max : {MOMO_MAX.toLocaleString("fr-FR")} FCFA
            </Text>

            {momoFrom && momoTo && momoAmountNum > 0 && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.momoSummary}>
                <Text style={styles.momoSummaryText}>
                  {MOMO_OPERATORS.find(o => o.id === momoFrom)?.icon} {MOMO_OPERATORS.find(o => o.id === momoFrom)?.name}
                  {"  →  "}
                  {MOMO_OPERATORS.find(o => o.id === momoTo)?.icon} {MOMO_OPERATORS.find(o => o.id === momoTo)?.name}
                </Text>
                <Text style={styles.momoSummaryAmount}>
                  {momoAmountNum.toLocaleString("fr-FR")} FCFA → {momoAmountNum.toLocaleString("fr-FR")} FCFA
                </Text>
                <Text style={styles.momoSummaryComm}>Commission : 0 FCFA ✅</Text>
              </MotiView>
            )}

            <TouchableOpacity
              style={[styles.waBtn, (!momoFrom || !momoTo || !momoValid) && styles.waBtnDisabled]}
              onPress={handleMomoExchange}
              disabled={!momoFrom || !momoTo || !momoValid}
              activeOpacity={0.87}
            >
              <Text style={styles.waBtnText}>💬 Initier l'échange via WhatsApp</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ℹ️ Conditions d'échange</Text>
              <Text style={styles.infoText}>
                {"• Taux de change 1:1 entre tous les opérateurs\n• Aucune commission prélevée\n• Délai : 5–20 minutes après confirmation\n• Montant : 1 000 – 500 000 FCFA\n• Opérateurs : Orange Money, MTN MoMo, Express Union, Yoomee"}
              </Text>
            </View>
          </MotiView>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
    gap: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 28, color: colors.text.primary, marginTop: -2 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },
  headerSub: { fontSize: 11, color: colors.text.secondary },

  toggle: {
    flexDirection: "row",
    backgroundColor: colors.bg.secondary,
    margin: 16,
    borderRadius: radius.xl,
    padding: 4, gap: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.lg, alignItems: "center" },
  toggleBtnActive: { backgroundColor: colors.brand.gold },
  toggleText: { fontSize: 13, fontWeight: "700", color: colors.text.muted },
  toggleTextActive: { color: "#0A0A0A" },

  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Commission card
  commissionCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl,
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: colors.border.strong,
  },
  commissionIcon: { fontSize: 32 },
  commissionBody: {},
  commissionTitle: { fontSize: 12, color: colors.text.muted, fontWeight: "600" },
  commissionValue: { fontSize: 18, fontWeight: "900", color: colors.brand.gold },

  // Bill grid
  billGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  billCard: {
    width: "47%",
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1.5, borderColor: colors.border.default,
    alignItems: "center", gap: 6,
  },
  billIcon: { fontSize: 32 },
  billName: { fontSize: 14, fontWeight: "800", color: colors.text.secondary },
  billDesc: { fontSize: 10, color: colors.text.muted, textAlign: "center", lineHeight: 14 },
  billCheck: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },

  // Selected bill card
  selectedCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: 16, gap: 10,
    borderWidth: 1, borderColor: colors.border.default,
    marginBottom: 16,
  },
  selectedTitle: { fontSize: 15, fontWeight: "800", color: colors.text.primary },
  selectedDesc: { fontSize: 12, color: colors.text.secondary },
  selectedFee: { flexDirection: "row", justifyContent: "space-between" },
  selectedFeeLabel: { fontSize: 13, color: colors.text.muted },
  selectedFeeValue: { fontSize: 13, fontWeight: "800", color: colors.brand.gold },
  selectedNote: { fontSize: 12, color: colors.text.secondary, lineHeight: 18 },

  // WhatsApp button
  waBtn: {
    backgroundColor: "#25D366",
    borderRadius: radius.full, paddingVertical: 15,
    alignItems: "center", marginBottom: 16,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  waBtnDisabled: { backgroundColor: colors.bg.elevated, shadowOpacity: 0 },
  waBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },

  // 0% commission
  zeroCommCard: {
    backgroundColor: "#0A1A0A",
    borderRadius: radius.xl,
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: "#25D36655",
  },
  zeroCommIcon: { fontSize: 32 },
  zeroCommTitle: { fontSize: 16, fontWeight: "900", color: "#25D366" },
  zeroCommSub: { fontSize: 12, color: "#7DCF9F" },

  // Operator grid
  opRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  opChip: {
    alignItems: "center", gap: 4,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
  },
  opName: { fontSize: 11, fontWeight: "700", color: colors.text.muted, textAlign: "center" },

  // Amount input
  amountRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default,
    paddingHorizontal: 14, marginBottom: 6,
    gap: 10,
  },
  amountInput: {
    flex: 1, fontSize: 18, fontWeight: "700",
    color: colors.text.primary, paddingVertical: 14,
  },
  amountCur: { fontSize: 14, color: colors.text.secondary, fontWeight: "700" },
  amountLimits: { fontSize: 11, color: colors.text.muted, marginBottom: 16 },

  // MoMo summary
  momoSummary: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    padding: 14, gap: 6, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border.strong,
    alignItems: "center",
  },
  momoSummaryText: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  momoSummaryAmount: { fontSize: 16, fontWeight: "900", color: colors.brand.gold },
  momoSummaryComm: { fontSize: 12, color: "#25D366", fontWeight: "700" },

  // Info box
  infoBox: {
    backgroundColor: colors.brand.goldLight,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1, borderColor: colors.brand.gold + "55",
  },
  infoTitle: { fontSize: 13, fontWeight: "700", color: colors.brand.goldDark, marginBottom: 8 },
  infoText: { fontSize: 12, color: colors.brand.goldDark, lineHeight: 20 },
});
