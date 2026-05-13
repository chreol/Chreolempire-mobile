import { useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

// ── Assets locaux ──────────────────────────────────────────────
const IMG_ORANGE  = require("../../../assets/orange-money.png");
const IMG_MTN     = require("../../../assets/MTN Mobile Money (MoMo) Payment .png");
const IMG_CANAL   = require("../../../assets/Canal+ logo.png");
const IMG_ENEO    = require("../../../assets/Eneo logo.jpg");
const IMG_CAMWAT  = require("../../../assets/Camwater logo.jpg");
const IMG_STAR    = require("../../../assets/StarTimes logo.png");
const IMG_EXPRESS = require("../../../assets/Express Union logo.png");
const IMG_YOOMEE  = require("../../../assets/Yoomee Money logo.jpg");

const BILL_LOGOS: Record<string, ReturnType<typeof require>> = {
  canal:     IMG_CANAL,
  eneo:      IMG_ENEO,
  camwater:  IMG_CAMWAT,
  startimes: IMG_STAR,
};
const MOMO_LOGOS: Record<string, ReturnType<typeof require>> = {
  orange:  IMG_ORANGE,
  mtn:     IMG_MTN,
  express: IMG_EXPRESS,
  yoomee:  IMG_YOOMEE,
};

// ── Données ────────────────────────────────────────────────────
const BILLS = [
  { id: "canal",     name: "Canal+",    color: "#006CB7", desc: "Abonnement Canal+, CanalSat" },
  { id: "eneo",      name: "Eneo",      color: "#FACC15", desc: "Facture d'électricité" },
  { id: "camwater",  name: "Camwater",  color: "#3B82F6", desc: "Facture d'eau" },
  { id: "startimes", name: "StarTimes", color: "#E50914", desc: "Abonnement StarTimes TV" },
] as const;

const MOMO_OPERATORS = [
  { id: "orange",  name: "Orange Money",  color: "#FF6600" },
  { id: "mtn",     name: "MTN MoMo",      color: "#FFCC00" },
  { id: "express", name: "Express Union", color: "#009933" },
  { id: "yoomee",  name: "Yoomee Money",  color: "#0066CC" },
] as const;

type BillId = (typeof BILLS)[number]["id"];
type MomoId = (typeof MOMO_OPERATORS)[number]["id"];
type NumType = "phone" | "decoder";

const COMMISSION = 200;

// ── Composant logo (image ou badge coloré) ─────────────────────
function Logo({ src, size = 48 }: { src: ReturnType<typeof require>; size?: number }) {
  return <Image source={src} style={{ width: size, height: size, borderRadius: 8 }} contentFit="contain" />;
}

// ── Écran principal ────────────────────────────────────────────
export default function FacturesScreen() {
  const router = useRouter();
  const amountRef = useRef<TextInput>(null);

  const [activeSection, setActiveSection] = useState<"factures" | "momo">("factures");

  // — Factures state
  const [selectedBill, setSelectedBill] = useState<BillId | null>(null);
  const [numType, setNumType] = useState<NumType>("phone");
  const [numValue, setNumValue] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // — MoMo state
  const [momoFrom, setMomoFrom] = useState<MomoId | null>(null);
  const [momoTo, setMomoTo] = useState<MomoId | null>(null);
  const [momoAmount, setMomoAmount] = useState("");

  const bill = BILLS.find(b => b.id === selectedBill);
  const maxDigits = numType === "phone" ? 9 : 14;
  const numValid = numValue.length === maxDigits;
  const amountNum = parseInt(amount.replace(/\s/g, ""), 10);
  const amountValid = !isNaN(amountNum) && amountNum >= 500;
  const total = amountValid ? amountNum + COMMISSION : 0;

  const formReady = !!bill && numValid && amountValid;

  const momoAmountNum = parseInt(momoAmount.replace(/\s/g, ""), 10);
  const momoValid = !isNaN(momoAmountNum) && momoAmountNum >= 1000 && momoAmountNum <= 500000;

  // ── Réinitialise le formulaire quand on change de service ──
  const selectBill = (id: BillId) => {
    if (selectedBill === id) { setSelectedBill(null); return; }
    setSelectedBill(id);
    setNumType("phone");
    setNumValue("");
    setAmount("");
    setNotes("");
  };

  const handleOrderBill = async () => {
    if (!formReady) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const numLabel = numType === "phone" ? "Numéro de tél." : "N° décodeur";
    const msg =
      `Bonjour Chreol Empire 👋\n\n` +
      `🧾 *PAIEMENT FACTURE — ${bill!.name.toUpperCase()}*\n` +
      `  • ${numLabel} : ${numValue}\n` +
      `  • Montant facture : ${amountNum.toLocaleString("fr-FR")} FCFA\n` +
      `  • Commission : ${COMMISSION} FCFA\n` +
      `  • *TOTAL À PAYER : ${total.toLocaleString("fr-FR")} FCFA*\n` +
      (notes.trim() ? `  • Infos : ${notes.trim()}\n` : "") +
      `\n⚠️ J'enverrai la preuve de paiement dès validation.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  const handleMomoExchange = async () => {
    if (!momoFrom || !momoTo || !momoValid) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const from = MOMO_OPERATORS.find(o => o.id === momoFrom)!;
    const to   = MOMO_OPERATORS.find(o => o.id === momoTo)!;
    const msg =
      `Bonjour Chreol Empire 👋\n\n` +
      `🔄 *ÉCHANGE MOBILE MONEY*\n` +
      `  • De : ${from.name}\n` +
      `  • Vers : ${to.name}\n` +
      `  • Montant : ${momoAmountNum.toLocaleString("fr-FR")} FCFA\n` +
      `  • Commission : 0% (taux 1:1)\n\n` +
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

      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeSection === "factures" && styles.toggleBtnActive]}
          onPress={() => setActiveSection("factures")} activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, activeSection === "factures" && styles.toggleTextActive]}>🧾 Factures</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, activeSection === "momo" && styles.toggleBtnActive]}
          onPress={() => setActiveSection("momo")} activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, activeSection === "momo" && styles.toggleTextActive]}>🔄 Échange MoMo</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* ══ SECTION FACTURES ══ */}
          {activeSection === "factures" && (
            <MotiView from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: "timing", duration: 280 }}>

              {/* Commission badge */}
              <View style={styles.commCard}>
                <View style={styles.commBadge}>
                  <Text style={styles.commBadgeText}>+200 FCFA</Text>
                </View>
                <Text style={styles.commLabel}>Commission fixe par paiement</Text>
              </View>

              {/* Grille services */}
              <Text style={styles.sectionLabel}>Choisissez le service</Text>
              <View style={styles.billGrid}>
                {BILLS.map(b => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.billCard, selectedBill === b.id && { borderColor: b.color, backgroundColor: b.color + "18" }]}
                    onPress={() => selectBill(b.id)}
                    activeOpacity={0.85}
                  >
                    {selectedBill === b.id && (
                      <View style={[styles.checkBadge, { backgroundColor: b.color }]}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    )}
                    <Logo src={BILL_LOGOS[b.id]} size={52} />
                    <Text style={[styles.billName, selectedBill === b.id && { color: colors.text.primary }]}>{b.name}</Text>
                    <Text style={styles.billDesc}>{b.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Formulaire (affiché quand un service est choisi) ── */}
              {bill && (
                <MotiView
                  key={bill.id}
                  from={{ opacity: 0, translateY: 12 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 300 }}
                  style={[styles.formCard, { borderColor: bill.color + "55" }]}
                >
                  <Text style={[styles.formTitle, { color: bill.color }]}>{bill.name}</Text>

                  {/* Type de numéro */}
                  <Text style={styles.fieldLabel}>Type d'identifiant</Text>
                  <View style={styles.numTypeRow}>
                    <TouchableOpacity
                      style={[styles.numTypeBtn, numType === "phone" && { borderColor: bill.color, backgroundColor: bill.color + "18" }]}
                      onPress={() => { setNumType("phone"); setNumValue(""); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.numTypeText, numType === "phone" && { color: colors.text.primary, fontWeight: "800" }]}>
                        📱 Numéro de tél.
                      </Text>
                      <Text style={[styles.numTypeHint, numType === "phone" && { color: bill.color }]}>9 chiffres</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.numTypeBtn, numType === "decoder" && { borderColor: bill.color, backgroundColor: bill.color + "18" }]}
                      onPress={() => { setNumType("decoder"); setNumValue(""); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.numTypeText, numType === "decoder" && { color: colors.text.primary, fontWeight: "800" }]}>
                        📡 N° décodeur
                      </Text>
                      <Text style={[styles.numTypeHint, numType === "decoder" && { color: bill.color }]}>14 chiffres</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Input numéro */}
                  <Text style={styles.fieldLabel}>
                    {numType === "phone" ? "Numéro de téléphone" : "Numéro du décodeur"}
                    {"  "}
                    <Text style={{ color: numValid ? "#10B981" : colors.text.muted }}>
                      {numValue.length}/{maxDigits}
                    </Text>
                  </Text>
                  <View style={[styles.inputWrap, numValid && styles.inputValid]}>
                    <TextInput
                      style={styles.input}
                      value={numValue}
                      onChangeText={v => setNumValue(v.replace(/\D/g, "").slice(0, maxDigits))}
                      placeholder={numType === "phone" ? "Ex: 697657734" : "Ex: 12345678901234"}
                      placeholderTextColor={colors.text.muted}
                      keyboardType="numeric"
                      returnKeyType="next"
                      onSubmitEditing={() => amountRef.current?.focus()}
                    />
                    {numValid && <Text style={styles.validCheck}>✓</Text>}
                  </View>

                  {/* Input montant */}
                  <Text style={styles.fieldLabel}>Montant de la facture (FCFA)</Text>
                  <View style={[styles.inputWrap, amountValid && styles.inputValid]}>
                    <TextInput
                      ref={amountRef}
                      style={styles.input}
                      value={amount}
                      onChangeText={v => setAmount(v.replace(/\D/g, ""))}
                      placeholder="Ex: 10000"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="numeric"
                      returnKeyType="next"
                    />
                    <Text style={styles.inputSuffix}>FCFA</Text>
                  </View>

                  {/* Infos supplémentaires */}
                  <Text style={styles.fieldLabel}>Informations supplémentaires <Text style={styles.optional}>(optionnel)</Text></Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[styles.input, styles.inputMulti]}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Ex: Nom du titulaire, remarques..."
                      placeholderTextColor={colors.text.muted}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Récapitulatif total */}
                  {amountValid && (
                    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.totalBox}>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Montant facture</Text>
                        <Text style={styles.totalValue}>{amountNum.toLocaleString("fr-FR")} FCFA</Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Commission Chreol</Text>
                        <Text style={styles.totalValue}>{COMMISSION} FCFA</Text>
                      </View>
                      <View style={[styles.totalRow, styles.totalFinalRow]}>
                        <Text style={styles.totalFinalLabel}>TOTAL À PAYER</Text>
                        <Text style={[styles.totalFinalValue, { color: bill.color }]}>
                          {total.toLocaleString("fr-FR")} FCFA
                        </Text>
                      </View>
                    </MotiView>
                  )}

                  {/* Bouton WhatsApp */}
                  <TouchableOpacity
                    style={[styles.waBtn, !formReady && styles.waBtnDisabled]}
                    onPress={handleOrderBill}
                    disabled={!formReady}
                    activeOpacity={0.87}
                  >
                    <Text style={styles.waBtnText}>
                      {!numValid ? `Saisir ${maxDigits} chiffres` : !amountValid ? "Saisir le montant" : "💬 Envoyer via WhatsApp"}
                    </Text>
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* How it works */}
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>ℹ️ Comment ça marche ?</Text>
                <Text style={styles.infoText}>
                  {"1. Choisissez votre service\n2. Remplissez le formulaire\n3. Cliquez \"Envoyer via WhatsApp\"\n4. Payez le total indiqué par Mobile Money\n5. Confirmation en 5–20 minutes"}
                </Text>
              </View>
            </MotiView>
          )}

          {/* ══ SECTION ÉCHANGE MOMO ══ */}
          {activeSection === "momo" && (
            <MotiView from={{ opacity: 0, translateX: 10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: "timing", duration: 280 }}>

              <View style={styles.zeroCommCard}>
                <Text style={styles.zeroCommTitle}>0% de commission</Text>
                <Text style={styles.zeroCommSub}>Échange 1:1 entre opérateurs</Text>
              </View>

              {/* De */}
              <Text style={styles.sectionLabel}>De quel opérateur ?</Text>
              <View style={styles.opRow}>
                {MOMO_OPERATORS.map(op => (
                  <TouchableOpacity
                    key={op.id}
                    style={[styles.opChip, momoFrom === op.id && { borderColor: op.color, backgroundColor: op.color + "20" }]}
                    onPress={() => { setMomoFrom(momoFrom === op.id ? null : op.id); if (momoTo === op.id) setMomoTo(null); }}
                    activeOpacity={0.8}
                  >
                    <Logo src={MOMO_LOGOS[op.id]} size={40} />
                    <Text style={[styles.opName, momoFrom === op.id && { color: colors.text.primary }]}>{op.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Vers */}
              <Text style={styles.sectionLabel}>Vers quel opérateur ?</Text>
              <View style={styles.opRow}>
                {MOMO_OPERATORS.filter(op => op.id !== momoFrom).map(op => (
                  <TouchableOpacity
                    key={op.id}
                    style={[styles.opChip, momoTo === op.id && { borderColor: op.color, backgroundColor: op.color + "20" }]}
                    onPress={() => setMomoTo(momoTo === op.id ? null : op.id)}
                    activeOpacity={0.8}
                  >
                    <Logo src={MOMO_LOGOS[op.id]} size={40} />
                    <Text style={[styles.opName, momoTo === op.id && { color: colors.text.primary }]}>{op.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Montant */}
              <Text style={styles.sectionLabel}>Montant à échanger</Text>
              <View style={[styles.inputWrap, momoValid && styles.inputValid]}>
                <TextInput
                  style={styles.input}
                  value={momoAmount}
                  onChangeText={v => setMomoAmount(v.replace(/\D/g, ""))}
                  placeholder="Ex: 50000"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
                <Text style={styles.inputSuffix}>FCFA</Text>
              </View>
              <Text style={styles.amountLimits}>Min : 1 000 FCFA  ·  Max : 500 000 FCFA</Text>

              {/* Résumé échange */}
              {momoFrom && momoTo && momoAmountNum > 0 && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.momoSummary}>
                  <View style={styles.momoSummaryRow}>
                    <Logo src={MOMO_LOGOS[momoFrom]} size={32} />
                    <Text style={styles.momoArrow}>  →  </Text>
                    <Logo src={MOMO_LOGOS[momoTo]} size={32} />
                  </View>
                  <Text style={styles.momoSummaryAmount}>{momoAmountNum.toLocaleString("fr-FR")} FCFA → {momoAmountNum.toLocaleString("fr-FR")} FCFA</Text>
                  <Text style={styles.momoComm}>Commission : 0 FCFA ✅</Text>
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
                <Text style={styles.infoText}>{"• Taux 1:1 entre tous les opérateurs\n• Aucune commission\n• Délai : 5–20 minutes\n• Opérateurs : Orange Money, MTN MoMo, Express Union, Yoomee"}</Text>
              </View>
            </MotiView>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default, gap: 14,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 28, color: colors.text.primary, marginTop: -2 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },
  headerSub: { fontSize: 11, color: colors.text.secondary },

  toggle: {
    flexDirection: "row", backgroundColor: colors.bg.secondary,
    margin: 16, borderRadius: radius.xl, padding: 4, gap: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.lg, alignItems: "center" },
  toggleBtnActive: { backgroundColor: colors.brand.gold },
  toggleText: { fontSize: 13, fontWeight: "700", color: colors.text.muted },
  toggleTextActive: { color: "#0A0A0A" },

  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10,
  },

  // Commission
  commCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: colors.brand.gold + "44",
  },
  commBadge: {
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6,
  },
  commBadgeText: { fontSize: 14, fontWeight: "900", color: "#0A0A0A" },
  commLabel: { fontSize: 13, color: colors.text.secondary, fontWeight: "600", flex: 1 },

  // Bill grid
  billGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  billCard: {
    width: "47%", backgroundColor: colors.bg.card,
    borderRadius: radius.xl, padding: 16,
    borderWidth: 1.5, borderColor: colors.border.default,
    alignItems: "center", gap: 8, position: "relative",
  },
  billName: { fontSize: 14, fontWeight: "800", color: colors.text.secondary },
  billDesc: { fontSize: 10, color: colors.text.muted, textAlign: "center", lineHeight: 14 },
  checkBadge: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  checkText: { color: "#fff", fontSize: 10, fontWeight: "900" },

  // Formulaire
  formCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius["2xl"], padding: 18, gap: 10,
    borderWidth: 1.5, marginBottom: 16,
  },
  formTitle: { fontSize: 16, fontWeight: "900", marginBottom: 4 },

  numTypeRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  numTypeBtn: {
    flex: 1, borderRadius: radius.xl, padding: 12,
    borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.elevated,
    alignItems: "center", gap: 4,
  },
  numTypeText: { fontSize: 12, fontWeight: "600", color: colors.text.muted },
  numTypeHint: { fontSize: 10, color: colors.text.muted, fontWeight: "700" },

  fieldLabel: { fontSize: 12, fontWeight: "700", color: colors.text.secondary },
  optional: { fontWeight: "400", color: colors.text.muted },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default,
    paddingHorizontal: 14,
  },
  inputValid: { borderColor: "#10B981" },
  input: {
    flex: 1, fontSize: 16, fontWeight: "700",
    color: colors.text.primary, paddingVertical: 13,
  },
  inputMulti: { minHeight: 72, paddingTop: 12 },
  inputSuffix: { fontSize: 13, color: colors.text.muted, fontWeight: "700" },
  validCheck: { fontSize: 16, color: "#10B981", fontWeight: "900" },

  // Total
  totalBox: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg, padding: 14, gap: 8,
    borderWidth: 1, borderColor: colors.border.strong,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 13, color: colors.text.secondary },
  totalValue: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  totalFinalRow: {
    paddingTop: 10, marginTop: 4,
    borderTopWidth: 1, borderTopColor: colors.border.default,
  },
  totalFinalLabel: { fontSize: 15, fontWeight: "900", color: colors.text.primary },
  totalFinalValue: { fontSize: 18, fontWeight: "900" },

  // WhatsApp
  waBtn: {
    backgroundColor: "#25D366",
    borderRadius: radius.full, paddingVertical: 15,
    alignItems: "center", marginTop: 4,
    elevation: 4,
  },
  waBtnDisabled: { backgroundColor: colors.bg.elevated, elevation: 0 },
  waBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },

  // 0% commission
  zeroCommCard: {
    backgroundColor: "#0A1A0A",
    borderRadius: radius.xl,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: "#25D36655",
    alignItems: "center", gap: 4,
  },
  zeroCommTitle: { fontSize: 18, fontWeight: "900", color: "#25D366" },
  zeroCommSub: { fontSize: 12, color: "#7DCF9F" },

  // Opérateurs MoMo
  opRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  opChip: {
    alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card, minWidth: "22%",
  },
  opName: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textAlign: "center" },

  amountLimits: { fontSize: 11, color: colors.text.muted, marginTop: 4, marginBottom: 16 },

  // Résumé MoMo
  momoSummary: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg, padding: 14, gap: 8,
    borderWidth: 1, borderColor: colors.border.strong,
    alignItems: "center", marginBottom: 16,
  },
  momoSummaryRow: { flexDirection: "row", alignItems: "center" },
  momoArrow: { fontSize: 18, color: colors.text.muted, fontWeight: "700" },
  momoSummaryAmount: { fontSize: 15, fontWeight: "900", color: colors.brand.gold },
  momoComm: { fontSize: 12, color: "#25D366", fontWeight: "700" },

  // Info box
  infoBox: {
    backgroundColor: colors.brand.goldLight,
    borderRadius: radius.lg, padding: 14,
    borderWidth: 1, borderColor: colors.brand.gold + "55",
    marginTop: 16,
  },
  infoTitle: { fontSize: 13, fontWeight: "700", color: colors.brand.goldDark, marginBottom: 8 },
  infoText: { fontSize: 12, color: colors.brand.goldDark, lineHeight: 20 },
});
