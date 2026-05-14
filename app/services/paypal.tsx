import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";
import { useCart } from "@/contexts/CartContext";

const IMG_HERO = require("../../assets/Achat_VentePaypal.webp");

type Direction  = "buy" | "sell";
type MomoNetwork = "orange" | "mtn";

// ⚠️ TAUX VARIABLE — mettre à jour régulièrement
const BUY_RATE  = 700; // Utilisateur achète PayPal → paie 700 FCFA/€
const SELL_RATE = 580; // Utilisateur vend PayPal  → reçoit 580 FCFA/€

const PAYPAL_EMAIL = CONTACT.paypalEmail;

type FormErrors = {
  amount?: string; paypalEmail?: string;
  benefName?: string; phone?: string;
};

export default function PaypalScreen() {
  const router = useRouter();
  const { addItem, count } = useCart();

  const [direction, setDirection] = useState<Direction>("buy");

  // Buy form
  const [buyAmount,   setBuyAmount]   = useState("");
  const [paypalId,    setPaypalId]    = useState("");

  // Sell form
  const [sellAmount,  setSellAmount]  = useState("");
  const [benefName,   setBenefName]   = useState("");
  const [momoNetwork, setMomoNetwork] = useState<MomoNetwork>("orange");
  const [phone,       setPhone]       = useState("");

  const [howOpen, setHowOpen] = useState(false);
  const [errors,  setErrors]  = useState<FormErrors>({});

  const numBuy  = parseFloat(buyAmount.replace(",", ".")) || 0;
  const fcfaBuy = numBuy > 0 ? Math.round(numBuy * BUY_RATE) : 0;

  const numSell  = parseFloat(sellAmount.replace(",", ".")) || 0;
  const fcfaSell = numSell > 0 ? Math.round(numSell * SELL_RATE) : 0;

  const resetForms = () => {
    setBuyAmount(""); setPaypalId("");
    setSellAmount(""); setBenefName(""); setPhone("");
    setErrors({});
  };

  const switchDirection = (d: Direction) => {
    setDirection(d);
    resetForms();
  };

  const handleBuyAddToCart = () => {
    const errs: FormErrors = {};
    if (numBuy < 10)       errs.amount      = "Minimum d'achat : 10€";
    if (numBuy > 500)      errs.amount      = "Maximum d'achat : 500€/jour";
    if (!paypalId.trim())  errs.paypalEmail = "Email ou pseudo PayPal requis";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    addItem({
      id:       `paypal-buy-${Date.now()}`,
      cardId:   "paypal-buy",
      cardName: `Achat solde PayPal — ${numBuy}€ → Compte : ${paypalId}`,
      amount:   `${numBuy}€ → vous payez ${fcfaBuy.toLocaleString("fr-FR")} FCFA`,
      price:    fcfaBuy,
      qty:      1,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Ajouté au panier ✅",
      `Achat PayPal : ${numBuy}€\nVous payez : ${fcfaBuy.toLocaleString("fr-FR")} FCFA`,
      [{ text: "Continuer" }]
    );
    resetForms();
  };

  const handleSellAddToCart = () => {
    const errs: FormErrors = {};
    if (numSell <= 0)      errs.amount    = "Entrez le montant en €";
    if (numSell > 500)     errs.amount    = "Maximum de vente : 500€/jour";
    if (!benefName.trim()) errs.benefName = "Nom & prénom requis";
    if (phone.length < 9)  errs.phone     = "9 chiffres requis";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const momoLabel = momoNetwork === "orange" ? "Orange Money" : "MTN Mobile Money";
    addItem({
      id:       `paypal-sell-${Date.now()}`,
      cardId:   "paypal-sell",
      cardName: `Vente PayPal — ${numSell}€ → Bénéficiaire : ${benefName} (${momoLabel} +237${phone})`,
      amount:   `${numSell}€ → vous recevez ${fcfaSell.toLocaleString("fr-FR")} FCFA`,
      price:    fcfaSell,
      qty:      1,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Ajouté au panier ✅",
      `Vente PayPal : ${numSell}€\nVous recevrez : ${fcfaSell.toLocaleString("fr-FR")} FCFA`,
      [{ text: "Continuer" }]
    );
    resetForms();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container} edges={["top"]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PayPal Europe</Text>
          {count > 0 ? (
            <TouchableOpacity style={styles.cartBadge} onPress={() => router.push("/cart")}>
              <Text style={styles.cartBadgeText}>🛒 {count}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 56 }} />
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Hero */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 420 }}
            style={styles.heroWrap}
          >
            <Image source={IMG_HERO} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Achat & Vente de solde{"\n"}PayPal Europe</Text>
              <Text style={styles.heroSub}>Recharges rapides · Sécurisé et garanti · 7j/7</Text>
            </View>
          </MotiView>

          {/* Direction */}
          <View style={styles.dirRow}>
            <TouchableOpacity
              style={[styles.dirBtn, direction === "buy" && styles.dirBtnActive]}
              onPress={() => switchDirection("buy")}
              activeOpacity={0.85}
            >
              <Text style={[styles.dirText, direction === "buy" && styles.dirTextActive]}>🛒 ACHETEZ</Text>
              <Text style={[styles.dirSub, direction === "buy" && styles.dirSubActive]}>
                Min 10€ · Max 500€/jour
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dirBtn, direction === "sell" && styles.dirBtnActive]}
              onPress={() => switchDirection("sell")}
              activeOpacity={0.85}
            >
              <Text style={[styles.dirText, direction === "sell" && styles.dirTextActive]}>💸 VENDEZ</Text>
              <Text style={[styles.dirSub, direction === "sell" && styles.dirSubActive]}>
                Max 500 000 FCFA/jour
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── ACHETEZ FORM ── */}
          {direction === "buy" ? (
            <>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>💶 Acheter du solde PayPal</Text>

                {/* Taux */}
                <View style={styles.rateChip}>
                  <Text style={styles.rateLabel}>Taux d'achat</Text>
                  <Text style={styles.rateValue}>1€ = {BUY_RATE} FCFA</Text>
                </View>

                {/* Montant */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Montant (€ EUR) * — Min 10€, Max 500€</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }, errors.amount && styles.inputError]}
                      value={buyAmount}
                      onChangeText={t => { setBuyAmount(t.replace(/[^0-9.,]/g, "")); setErrors(p => ({ ...p, amount: undefined })); }}
                      placeholder="Ex: 50"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.inputUnit}>€ EUR</Text>
                  </View>
                  {errors.amount && <Text style={styles.errorText}>⚠ {errors.amount}</Text>}
                </View>

                {/* Email/Pseudo */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Email PayPal ou Pseudo *</Text>
                  <TextInput
                    style={[styles.input, errors.paypalEmail && styles.inputError]}
                    value={paypalId}
                    onChangeText={t => { setPaypalId(t); setErrors(p => ({ ...p, paypalEmail: undefined })); }}
                    placeholder="Ex: nom@email.com ou @pseudo"
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {errors.paypalEmail && <Text style={styles.errorText}>⚠ {errors.paypalEmail}</Text>}
                </View>

                {/* Montant FCFA à payer */}
                {fcfaBuy > 0 && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 16 }}
                    style={styles.resultBox}
                  >
                    <Text style={styles.resultLabel}>💳 Vous paierez</Text>
                    <Text style={styles.resultValue}>{fcfaBuy.toLocaleString("fr-FR")} FCFA</Text>
                    <Text style={styles.resultSub}>
                      {numBuy}€ × {BUY_RATE} FCFA/€ = {fcfaBuy.toLocaleString("fr-FR")} FCFA
                    </Text>
                  </MotiView>
                )}

                {/* Paiement désactivé */}
                <View style={styles.payDisabledBox}>
                  <Text style={styles.payDisabledText}>
                    ℹ️ Le mode de paiement sera sélectionné à l'étape suivante dans le panier.
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.addCartBtn} onPress={handleBuyAddToCart} activeOpacity={0.87}>
                <Text style={styles.addCartBtnText}>🛒  Ajouter au panier</Text>
              </TouchableOpacity>
            </>

          ) : (
            /* ── VENDEZ FORM ── */
            <>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>💸 Vendre votre solde PayPal</Text>

                {/* Taux */}
                <View style={[styles.rateChip, styles.rateChipGreen]}>
                  <Text style={[styles.rateLabel, { color: "#25D366" }]}>Taux de vente</Text>
                  <Text style={[styles.rateValue, { color: "#25D366" }]}>1€ = {SELL_RATE} FCFA</Text>
                </View>

                {/* Montant */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Montant (€ EUR) * — Max 500€/jour</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }, errors.amount && styles.inputError]}
                      value={sellAmount}
                      onChangeText={t => { setSellAmount(t.replace(/[^0-9.,]/g, "")); setErrors(p => ({ ...p, amount: undefined })); }}
                      placeholder="Ex: 50"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.inputUnit}>€ EUR</Text>
                  </View>
                  {errors.amount && <Text style={styles.errorText}>⚠ {errors.amount}</Text>}
                </View>

                {/* FCFA à recevoir */}
                {fcfaSell > 0 && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 16 }}
                    style={[styles.resultBox, styles.resultBoxGreen]}
                  >
                    <Text style={[styles.resultLabel, { color: "#25D366" }]}>Vous recevrez</Text>
                    <Text style={[styles.resultValue, { color: "#25D366" }]}>
                      {fcfaSell.toLocaleString("fr-FR")} FCFA
                    </Text>
                    <Text style={[styles.resultSub, { color: "#25D36699" }]}>
                      {numSell}€ × {SELL_RATE} FCFA/€ = {fcfaSell.toLocaleString("fr-FR")} FCFA
                    </Text>
                  </MotiView>
                )}

                {/* Adresse PayPal de réception */}
                <View style={styles.paypalAddrBox}>
                  <Text style={styles.paypalAddrTitle}>📧 Adresse PayPal de réception</Text>
                  <Text style={styles.paypalAddrValue} selectable>{PAYPAL_EMAIL}</Text>
                  {/* Info bulle famille/proche */}
                  <View style={styles.familyBubble}>
                    <Text style={styles.familyBubbleText}>
                      ⚠️ Envoyez uniquement en tant que <Text style={{ fontWeight: "900" }}>Famille ou Proche</Text> — les paiements "Biens et services" ne sont pas acceptés et seront refusés.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Infos bénéficiaire */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>📱 Réception Mobile Money</Text>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Nom & Prénom *</Text>
                  <TextInput
                    style={[styles.input, errors.benefName && styles.inputError]}
                    value={benefName}
                    onChangeText={t => { setBenefName(t); setErrors(p => ({ ...p, benefName: undefined })); }}
                    placeholder="Ex: Jean Dupont"
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="words"
                  />
                  {errors.benefName && <Text style={styles.errorText}>⚠ {errors.benefName}</Text>}
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Réseau Mobile Money *</Text>
                  <View style={styles.momoRow}>
                    <TouchableOpacity
                      style={[styles.momoBtn, momoNetwork === "orange" && styles.momoBtnOrange]}
                      onPress={() => setMomoNetwork("orange")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.momoEmoji}>🟠</Text>
                      <Text style={[styles.momoLabel, momoNetwork === "orange" && { color: "#FF6600", fontWeight: "800" }]}>
                        Orange Money
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.momoBtn, momoNetwork === "mtn" && styles.momoBtnMtn]}
                      onPress={() => setMomoNetwork("mtn")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.momoEmoji}>🟡</Text>
                      <Text style={[styles.momoLabel, momoNetwork === "mtn" && { color: "#FACC15", fontWeight: "800" }]}>
                        MTN MoMo
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Numéro de téléphone * (9 chiffres)</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.dialCodeBox}>
                      <Text style={styles.dialCode}>+237</Text>
                    </View>
                    <TextInput
                      style={[styles.input, { flex: 1 }, errors.phone && styles.inputError]}
                      value={phone}
                      onChangeText={t => { setPhone(t.replace(/\D/g, "").slice(0, 9)); setErrors(p => ({ ...p, phone: undefined })); }}
                      placeholder="6XXXXXXXX"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="number-pad"
                      maxLength={9}
                    />
                  </View>
                  {errors.phone && <Text style={styles.errorText}>⚠ {errors.phone}</Text>}
                </View>
              </View>

              <TouchableOpacity style={styles.addCartBtn} onPress={handleSellAddToCart} activeOpacity={0.87}>
                <Text style={styles.addCartBtnText}>🛒  Ajouter au panier</Text>
              </TouchableOpacity>
            </>
          )}

          {count > 0 && (
            <TouchableOpacity style={styles.submitBtn} onPress={() => router.push("/cart")} activeOpacity={0.87}>
              <Text style={styles.submitBtnText}>Soumettre la commande à Chreol Empire →</Text>
            </TouchableOpacity>
          )}

          {/* Comment ça marche — collapsible */}
          <TouchableOpacity
            style={styles.howToggle}
            onPress={() => setHowOpen(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.howToggleText}>❓ Comment ça marche ?</Text>
            <Text style={styles.howToggleChevron}>{howOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {howOpen && (
            <MotiView
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 220 }}
              style={styles.howBody}
            >
              {direction === "buy" ? [
                { n: "1", text: "Entrez le montant en € et votre email/pseudo PayPal." },
                { n: "2", text: "Ajoutez au panier et soumettez votre commande." },
                { n: "3", text: "Payez via Mobile Money (MTN ou Orange) selon les instructions." },
                { n: "4", text: "Votre solde PayPal est rechargé dès confirmation du paiement ✅" },
              ] : [
                { n: "1", text: "Entrez le montant en € à vendre et renseignez vos infos Mobile Money." },
                { n: "2", text: "Envoyez le solde PayPal à notre adresse en tant que Famille/Proche." },
                { n: "3", text: "Soumettez la demande sur WhatsApp avec la capture du paiement." },
                { n: "4", text: "Le virement Mobile Money est effectué après vérification ✅" },
              ].map(s => (
                <View key={s.n} style={styles.howStep}>
                  <View style={styles.howStepNum}>
                    <Text style={styles.howStepNumText}>{s.n}</Text>
                  </View>
                  <Text style={styles.howStepText}>{s.text}</Text>
                </View>
              ))}
            </MotiView>
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

  content: { padding: 16, gap: 14, paddingBottom: 40 },

  // Hero
  heroWrap: { height: 190, borderRadius: radius["2xl"], overflow: "hidden", justifyContent: "flex-end" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  heroContent: { padding: 20, gap: 6 },
  heroTitle: { fontSize: 18, fontWeight: "900", color: "#fff", lineHeight: 25 },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "600" },

  // Direction
  dirRow: { flexDirection: "row", gap: 10 },
  dirBtn: {
    flex: 1, paddingVertical: 13, borderRadius: radius.xl,
    alignItems: "center", borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card, gap: 4,
  },
  dirBtnActive: { backgroundColor: "#0070BA", borderColor: "#0070BA" },
  dirText: { fontSize: 14, fontWeight: "800", color: colors.text.muted },
  dirTextActive: { color: "#fff" },
  dirSub: { fontSize: 10, color: colors.text.muted, fontWeight: "600" },
  dirSubActive: { color: "rgba(255,255,255,0.8)" },

  // Form card
  formCard: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default, padding: 16, gap: 14,
  },
  formTitle: { fontSize: 14, fontWeight: "800", color: colors.text.primary },

  // Rate chip
  rateChip: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.brand.goldLight, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.brand.gold + "55",
    paddingHorizontal: 14, paddingVertical: 10,
  },
  rateChipGreen: { backgroundColor: "#0A1A0A", borderColor: "#25D36633" },
  rateLabel: { fontSize: 11, fontWeight: "700", color: colors.brand.goldDark },
  rateValue: { fontSize: 15, fontWeight: "900", color: colors.brand.goldDark },

  // Fields
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: colors.text.primary, fontWeight: "600",
  },
  inputUnit: { fontSize: 13, color: colors.text.muted, fontWeight: "700" },
  inputError: { borderColor: "#EF4444" },
  errorText: { fontSize: 11, fontWeight: "600", color: "#EF4444", marginTop: 2 },

  // Result
  resultBox: {
    backgroundColor: colors.brand.goldLight, borderRadius: radius.xl,
    padding: 16, alignItems: "center", gap: 4,
    borderWidth: 1.5, borderColor: colors.brand.gold + "66",
  },
  resultBoxGreen: { backgroundColor: "#0A1A0A", borderColor: "#25D36644" },
  resultLabel: { fontSize: 12, fontWeight: "700", color: colors.brand.goldDark },
  resultValue: { fontSize: 28, fontWeight: "900", color: colors.brand.goldDark },
  resultSub: { fontSize: 11, color: colors.brand.goldDark, opacity: 0.7 },

  // Pay disabled
  payDisabledBox: {
    backgroundColor: "#0A0A1E", borderRadius: radius.lg,
    borderWidth: 1, borderColor: "#6366F133", padding: 12,
  },
  payDisabledText: { fontSize: 12, color: "#A5B4FC", lineHeight: 18 },

  // PayPal address box
  paypalAddrBox: {
    backgroundColor: "#0A1A0A", borderRadius: radius.xl,
    borderWidth: 1, borderColor: "#25D36633", padding: 14, gap: 8,
  },
  paypalAddrTitle: { fontSize: 12, fontWeight: "700", color: "#25D366" },
  paypalAddrValue: { fontSize: 15, fontWeight: "900", color: "#7FFFD4", letterSpacing: 0.3 },

  // Family bubble
  familyBubble: {
    backgroundColor: "#2A1500", borderRadius: radius.lg,
    borderWidth: 1, borderColor: "#F7931A55", padding: 10, marginTop: 4,
  },
  familyBubbleText: { fontSize: 12, color: "#FCD34D", lineHeight: 18 },

  // Mobile Money
  momoRow: { flexDirection: "row", gap: 10 },
  momoBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default, paddingVertical: 14,
  },
  momoBtnOrange: { borderColor: "#FF660055", backgroundColor: "#FF660011" },
  momoBtnMtn: { borderColor: "#FACC1555", backgroundColor: "#FACC1511" },
  momoEmoji: { fontSize: 18 },
  momoLabel: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },

  dialCodeBox: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 12, paddingVertical: 13,
  },
  dialCode: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },

  // Buttons
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

  // Comment ça marche
  howToggle: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  howToggleText: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  howToggleChevron: { fontSize: 11, color: colors.text.muted },
  howBody: {
    backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: 16, gap: 12,
    borderWidth: 1, borderColor: colors.border.default,
  },
  howStep: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  howStepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#0070BA", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  howStepNumText: { fontSize: 12, fontWeight: "800", color: "#fff" },
  howStepText: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
});
