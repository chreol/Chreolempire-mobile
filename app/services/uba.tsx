import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Linking, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { colors, radius } from "@/constants/theme";
import { CONTACT, UBA_CARDS, UBA_RECHARGE_FEES } from "@/constants/services";
import { useCart } from "@/contexts/CartContext";

const IMG_UBA = require("../../assets/UBA Cameroun logo.png");

type Tab = "recharge" | "achat";

function calcFee(amount: number): number {
  for (const t of UBA_RECHARGE_FEES) {
    if (amount >= t.min && amount <= t.max) {
      return t.type === "fixed" ? t.fee : Math.round(amount * t.fee / 100);
    }
  }
  return 0;
}

export default function UbaScreen() {
  const router = useRouter();
  const { addItem, count } = useCart();
  const [tab, setTab] = useState<Tab>("recharge");

  // Recharge form state
  const [cardFirst6, setCardFirst6] = useState("");
  const [cardLast4,  setCardLast4]  = useState("");
  const [clientId,   setClientId]   = useState("");
  const [fullName,   setFullName]   = useState("");
  const [phone,      setPhone]      = useState("");
  const [amount,     setAmount]     = useState("");

  // Achat tab state
  const [selectedCard, setSelectedCard] = useState(1);
  const [achatChecked, setAchatChecked] = useState(false);

  // Collapsible fees
  const [feesOpen, setFeesOpen] = useState(false);

  type RechargeErrors = {
    cardFirst6?: string; cardLast4?: string; clientId?: string;
    fullName?: string; phone?: string; amount?: string;
  };
  const [rechargeErrors, setRechargeErrors] = useState<RechargeErrors>({});
  const [achatError, setAchatError] = useState("");

  const numAmount = parseInt(amount.replace(/\D/g, ""), 10) || 0;
  const fee   = calcFee(numAmount);
  const total = numAmount + fee;

  const resetForm = () => {
    setCardFirst6(""); setCardLast4(""); setClientId("");
    setFullName(""); setPhone(""); setAmount("");
    setRechargeErrors({});
  };

  const handleAddToCart = () => {
    const errs: RechargeErrors = {};
    if (cardFirst6.length < 6) errs.cardFirst6 = "6 chiffres requis";
    if (cardLast4.length < 4)  errs.cardLast4  = "4 chiffres requis";
    if (!clientId.trim())      errs.clientId   = "ID Client requis (au dos de la carte)";
    if (!fullName.trim())      errs.fullName   = "Nom & prénom requis";
    if (phone.length < 9)      errs.phone      = "9 chiffres requis";
    if (numAmount < 1500 || numAmount > 500000)
                               errs.amount     = "Montant entre 1 500 et 500 000 FCFA";
    if (Object.keys(errs).length > 0) { setRechargeErrors(errs); return; }
    setRechargeErrors({});

    addItem({
      id: `uba-${Date.now()}`,
      cardId: "uba-recharge",
      cardName: `Recharge UBA — ${cardFirst6}••••${cardLast4}, Nom complet:  (${fullName}), ID Client (${clientId}), Téléphone: (${phone})`,
      amount: `Montant à recharger: ${numAmount.toLocaleString("fr-FR")} FCFA`, 
      price: total,
      qty: 1,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Ajouté au panier ✅",
      `Recharge de ${numAmount.toLocaleString("fr-FR")} FCFA ajoutée.\nFrais inclus : ${fee.toLocaleString("fr-FR")} FCFA`,
      [{ text: "Continuer" }]
    );
    resetForm();
  };

  const handleAddCardToCart = () => {
    if (!achatChecked) {
      setAchatError("Veuillez cocher la case pour confirmer que vous fournirez les documents obligatoires.");
      return;
    }
    setAchatError("");
    const card = UBA_CARDS[selectedCard];
    addItem({
      id: `uba-card-${Date.now()}`,
      cardId: `uba-card-${selectedCard}`,
      cardName: `Carte Visa UBA Prépayée — Segment ${card.segment}`,
      amount: `Limite ${card.limit}`,
      price: card.price,
      qty: 1,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Ajouté au panier ✅",
      `Carte Visa UBA Segment ${card.segment} — ${card.price.toLocaleString("fr-FR")} FCFA`,
      [{ text: "Continuer" }]
    );
    setAchatChecked(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container} edges={["top"]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>UBA Cameroun</Text>
          {count > 0 ? (
            <TouchableOpacity style={styles.cartBadge} onPress={() => router.push("/cart")}>
              <Text style={styles.cartBadgeText}>🛒 {count}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 56 }} />
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === "recharge" && styles.tabActive]} onPress={() => setTab("recharge")}>
            <Text style={[styles.tabText, tab === "recharge" && styles.tabTextActive]}>💳 Recharge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === "achat" && styles.tabActive]} onPress={() => setTab("achat")}>
            <Text style={[styles.tabText, tab === "achat" && styles.tabTextActive]}>🏦 Acheter une carte</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Hero */}
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400 }}
            style={styles.heroWrap}
          >
            <Image source={IMG_UBA} style={styles.heroImg} contentFit="contain" />
          </MotiView>

          {/* ── RECHARGE TAB ── */}
          {tab === "recharge" ? (
            <>
              <Text style={styles.sectionTitle}>Recharger votre carte UBA</Text>
              <Text style={styles.sectionSub}>Tous les champs sont obligatoires</Text>

              <View style={styles.formCard}>

                {/* 6 premiers / 4 derniers */}
                <View style={styles.formRow}>
                  <View style={[styles.fieldWrap, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>6 premiers chiffres</Text>
                    <TextInput
                      style={[styles.input, rechargeErrors.cardFirst6 && styles.inputError]}
                      value={cardFirst6}
                      onChangeText={t => { setCardFirst6(t.replace(/\D/g, "").slice(0, 6)); setRechargeErrors(p => ({ ...p, cardFirst6: undefined })); }}
                      placeholder="••••••"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    {rechargeErrors.cardFirst6 && <Text style={styles.errorText}>⚠ {rechargeErrors.cardFirst6}</Text>}
                  </View>
                  <View style={[styles.fieldWrap, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>4 derniers chiffres</Text>
                    <TextInput
                      style={[styles.input, rechargeErrors.cardLast4 && styles.inputError]}
                      value={cardLast4}
                      onChangeText={t => { setCardLast4(t.replace(/\D/g, "").slice(0, 4)); setRechargeErrors(p => ({ ...p, cardLast4: undefined })); }}
                      placeholder="••••"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                    {rechargeErrors.cardLast4 && <Text style={styles.errorText}>⚠ {rechargeErrors.cardLast4}</Text>}
                  </View>
                </View>

                {/* ID Client */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>ID Client (au dos de la carte)</Text>
                  <TextInput
                    style={[styles.input, rechargeErrors.clientId && styles.inputError]}
                    value={clientId}
                    onChangeText={t => { setClientId(t.replace(/\D/g, "").slice(0, 10)); setRechargeErrors(p => ({ ...p, clientId: undefined })); }}
                    placeholder="Ex: 0012345678"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                  {rechargeErrors.clientId && <Text style={styles.errorText}>⚠ {rechargeErrors.clientId}</Text>}
                </View>

                {/* Nom & Prénom */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Nom & Prénom</Text>
                  <TextInput
                    style={[styles.input, rechargeErrors.fullName && styles.inputError]}
                    value={fullName}
                    onChangeText={t => { setFullName(t); setRechargeErrors(p => ({ ...p, fullName: undefined })); }}
                    placeholder="Ex: Jean Dupont"
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="words"
                  />
                  {rechargeErrors.fullName && <Text style={styles.errorText}>⚠ {rechargeErrors.fullName}</Text>}
                </View>

                {/* Téléphone */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Numéro de téléphone</Text>
                  <TextInput
                    style={[styles.input, rechargeErrors.phone && styles.inputError]}
                    value={phone}
                    onChangeText={t => { setPhone(t.replace(/\D/g, "").slice(0, 9)); setRechargeErrors(p => ({ ...p, phone: undefined })); }}
                    placeholder="Ex: 694360978"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="number-pad"
                    maxLength={9}
                  />
                  {rechargeErrors.phone && <Text style={styles.errorText}>⚠ {rechargeErrors.phone}</Text>}
                </View>

                {/* Montant */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Montant (1 500 – 500 000 FCFA)</Text>
                  <View style={styles.amountRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }, rechargeErrors.amount && styles.inputError]}
                      value={amount}
                      onChangeText={t => { setAmount(t.replace(/\D/g, "")); setRechargeErrors(p => ({ ...p, amount: undefined })); }}
                      placeholder="Ex: 50000"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="number-pad"
                    />
                    <Text style={styles.amountUnit}>FCFA</Text>
                  </View>
                  {rechargeErrors.amount && <Text style={styles.errorText}>⚠ {rechargeErrors.amount}</Text>}
                </View>

                {/* Live fee preview */}
                {numAmount >= 1500 && numAmount <= 500000 && (
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.calcBox}
                  >
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>Montant demandé</Text>
                      <Text style={styles.calcValue}>{numAmount.toLocaleString("fr-FR")} FCFA</Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>Frais de service</Text>
                      <Text style={[styles.calcValue, { color: "#E50914" }]}>+{fee.toLocaleString("fr-FR")} FCFA</Text>
                    </View>
                    <View style={[styles.calcRow, styles.calcTotalRow]}>
                      <Text style={styles.calcTotalLabel}>Total à payer</Text>
                      <Text style={styles.calcTotalValue}>{total.toLocaleString("fr-FR")} FCFA</Text>
                    </View>
                  </MotiView>
                )}
              </View>

              {/* Privacy bubble */}
              <View style={styles.privacyBox}>
                <Text style={styles.privacyIcon}>🔒</Text>
                <Text style={styles.privacyText}>
                  Ces informations ne sont pas enregistrées. Elles sont uniquement utilisées pour traiter votre recharge en cours.
                </Text>
              </View>

              {/* Grille de frais — collapsible */}
              <TouchableOpacity
                style={styles.feesHeader}
                onPress={() => setFeesOpen(v => !v)}
                activeOpacity={0.8}
              >
                <Text style={styles.feesHeaderText}>📋 Grille de frais</Text>
                <Text style={styles.feesChevron}>{feesOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>
              {feesOpen && (
                <MotiView
                  from={{ opacity: 0, translateY: -6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 220 }}
                  style={styles.feesTable}
                >
                  {UBA_RECHARGE_FEES.map((t, i) => (
                    <View key={i} style={styles.feeRow}>
                      <Text style={styles.feeTranche}>{t.min.toLocaleString("fr-FR")} – {t.max.toLocaleString("fr-FR")} FCFA</Text>
                      <Text style={styles.feeFee}>
                        {t.type === "fixed" ? `+${t.fee.toLocaleString()} FCFA` : `+${t.fee}%`}
                      </Text>
                    </View>
                  ))}
                </MotiView>
              )}

              {/* Add to cart */}
              <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart} activeOpacity={0.87}>
                <Text style={styles.addCartBtnText}>🛒  Ajouter au panier</Text>
              </TouchableOpacity>

              {count > 0 && (
                <TouchableOpacity style={styles.submitBtn} onPress={() => router.push("/cart")} activeOpacity={0.87}>
                  <Text style={styles.submitBtnText}>Soumettre la commande à Chreol Empire →</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.helpBtn}
                onPress={() => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.helpBtnText}>💬  Besoin d'aide ? Contacter sur WhatsApp</Text>
              </TouchableOpacity>
            </>

          ) : (
            /* ── ACHAT TAB ── */
            <>
              <Text style={styles.sectionTitle}>Cartes Visa Prépayées UBA</Text>
              <Text style={styles.sectionSub}>Choisissez votre segment</Text>

              {UBA_CARDS.map((card, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.cardSegment, selectedCard === i && styles.cardSegmentActive]}
                  onPress={() => setSelectedCard(i)}
                >
                  {card.popular && (
                    <View style={styles.popularTag}>
                      <Text style={styles.popularTagText}>⭐ Populaire</Text>
                    </View>
                  )}
                  <View style={styles.segmentHeader}>
                    <Text style={styles.segmentTitle}>Segment {card.segment}</Text>
                    <Text style={styles.segmentPrice}>{card.price.toLocaleString()} FCFA</Text>
                  </View>
                  <Text style={styles.segmentLimit}>Limite : {card.limit}</Text>
                  {card.features.map((f, j) => (
                    <Text key={j} style={styles.segmentFeature}>✓ {f}</Text>
                  ))}
                </TouchableOpacity>
              ))}

              {/* Documents requis — achat only */}
              <View style={styles.docsRedBox}>
                <Text style={styles.docsRedTitle}>📋 Documents requis obligatoires</Text>
                <Text style={styles.docsRedText}>
                  {"• Photocopie CNI ou Passeport\n• Photo passeport couleur récente\n• Plan de localisation\n• Numéro NUI\n\n📍 Retrait en agence : " + CONTACT.address}
                </Text>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => { setAchatChecked(v => !v); setAchatError(""); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, achatChecked && styles.checkboxChecked]}>
                    {achatChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>
                    Je confirme avoir lu et je suis d'accord pour fournir tous les documents obligatoires lors du retrait de la carte UBA en agence.
                  </Text>
                </TouchableOpacity>
                {achatError ? <Text style={styles.errorText}>⚠ {achatError}</Text> : null}
              </View>

              <TouchableOpacity style={styles.addCartBtn} onPress={handleAddCardToCart} activeOpacity={0.87}>
                <Text style={styles.addCartBtnText}>🛒  Ajouter au panier</Text>
              </TouchableOpacity>

              {count > 0 && (
                <TouchableOpacity style={styles.submitBtn} onPress={() => router.push("/cart")} activeOpacity={0.87}>
                  <Text style={styles.submitBtnText}>Soumettre la commande à Chreol Empire →</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.helpBtn}
                onPress={() => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.helpBtnText}>💬  Besoin d'aide ? Contacter sur WhatsApp</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 28, color: colors.text.primary },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },
  cartBadge: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  cartBadgeText: { fontSize: 12, fontWeight: "800", color: "#0A0A0A" },

  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border.default },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.brand.gold },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.text.muted },
  tabTextActive: { color: colors.brand.gold },

  content: { padding: 16, gap: 14, paddingBottom: 40 },

  heroWrap: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    padding: 16, alignItems: "center",
  },
  heroImg: { width: "100%", height: 100 },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  sectionSub: { fontSize: 13, color: colors.text.secondary },

  formCard: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    padding: 16, gap: 14,
  },
  formRow: { flexDirection: "row", gap: 10 },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 10, fontWeight: "700", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.4,
  },
  input: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: colors.text.primary, fontWeight: "600",
  },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  amountUnit: { fontSize: 13, color: colors.text.muted, fontWeight: "700" },

  calcBox: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg, padding: 14, gap: 8,
    borderWidth: 1, borderColor: colors.brand.gold + "44",
  },
  calcRow: { flexDirection: "row", justifyContent: "space-between" },
  calcLabel: { fontSize: 13, color: colors.text.secondary },
  calcValue: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  calcTotalRow: { borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: 8, marginTop: 4 },
  calcTotalLabel: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  calcTotalValue: { fontSize: 17, fontWeight: "900", color: colors.brand.gold },

  privacyBox: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.default, padding: 12,
  },
  privacyIcon: { fontSize: 18, marginTop: 1 },
  privacyText: { flex: 1, fontSize: 12, color: colors.text.secondary, lineHeight: 18 },

  // Collapsible fees
  feesHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  feesHeaderText: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  feesChevron: { fontSize: 11, color: colors.text.muted },
  feesTable: {
    backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: 14, gap: 8,
    borderWidth: 1, borderColor: colors.border.default,
  },
  feeRow: { flexDirection: "row", justifyContent: "space-between" },
  feeTranche: { fontSize: 12, color: colors.text.secondary },
  feeFee: { fontSize: 12, fontWeight: "700", color: "#E50914" },

  // Docs — achat only
  docsRedBox: {
    backgroundColor: "#2A0000", borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: "#E5091466",
    padding: 16, gap: 12,
  },
  docsRedTitle: { fontSize: 14, fontWeight: "800", color: "#FF4444" },
  docsRedText: { fontSize: 12, color: "#FFA0A0", lineHeight: 20 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#FF4444",
    alignItems: "center", justifyContent: "center", backgroundColor: "transparent", marginTop: 1,
  },
  checkboxChecked: { backgroundColor: "#E50914", borderColor: "#E50914" },
  checkmark: { fontSize: 13, color: "#fff", fontWeight: "800" },
  checkLabel: { flex: 1, fontSize: 12, color: "#FFA0A0", lineHeight: 18 },

  addCartBtn: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full, paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.brand.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  addCartBtnText: { fontSize: 15, fontWeight: "800", color: "#0A0A0A" },

  submitBtn: {
    backgroundColor: "#25D366", borderRadius: radius.full, paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#25D366", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },

  submitBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  helpBtn: {
    borderRadius: radius.full, borderWidth: 1.5, borderColor: "#25D36644",
    paddingVertical: 14, alignItems: "center", backgroundColor: "#25D36610",
  },
  helpBtnText: { fontSize: 13, fontWeight: "700", color: "#25D366" },

  cardSegment: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    padding: 16, gap: 6, borderWidth: 1.5, borderColor: colors.border.default, position: "relative",
  },
  cardSegmentActive: { borderColor: colors.brand.gold },
  popularTag: {
    position: "absolute", top: 12, right: 12,
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  popularTagText: { fontSize: 11, fontWeight: "700", color: "#0A0A0A" },
  segmentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  segmentTitle: { fontSize: 16, fontWeight: "800", color: colors.text.primary },
  segmentPrice: { fontSize: 16, fontWeight: "800", color: colors.brand.gold },
  segmentLimit: { fontSize: 12, color: colors.text.secondary },
  segmentFeature: { fontSize: 12, color: colors.text.secondary },

  inputError: { borderColor: "#EF4444" },
  errorText:  { fontSize: 11, fontWeight: "600", color: "#EF4444", marginTop: 2 },
});
