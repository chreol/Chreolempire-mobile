import { useRef, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform, Linking,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { colors, radius } from "@/constants/theme";
import { CONTACT, COUPON_RATES } from "@/constants/services";
import { useCart } from "@/contexts/CartContext";

const IMG_HERO  = require("../../assets/pcs_alternative_a_transcash_b272.jpg");
const IMG_PCS   = require("../../assets/PCS-Mastercard.png");
const IMG_TRANS = require("../../assets/echange-transcash.png");

type CouponType = "pcs" | "transcash";
type Network    = "orange" | "mtn";

function formatTranscash(digits: string): string {
  const d = digits.slice(0, 12);
  const parts = [d.slice(0, 4), d.slice(4, 8), d.slice(8, 12)].filter(p => p.length > 0);
  return parts.join("-");
}

function calcFcfa(type: CouponType, euros: number): number {
  const r = COUPON_RATES[type];
  return type === "pcs"
    ? Math.round(euros * (1 - r.commission / 100) * r.rate)
    : Math.round(euros * r.rate);
}

export default function CouponsScreen() {
  const router    = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { addItem, count } = useCart();

  const [couponType, setCouponType] = useState<CouponType>("pcs");
  const [euroAmount, setEuroAmount] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [benefName, setBenefName]   = useState("");
  const [network, setNetwork]       = useState<Network>("orange");
  const [phone, setPhone]           = useState("");
  const [howOpen, setHowOpen]       = useState(false);
  const [rateOpen, setRateOpen]     = useState(false);

  type FormErrors = { euroAmount?: string; couponCode?: string; benefName?: string; phone?: string };
  const [errors, setErrors] = useState<FormErrors>({});

  const numEuro  = parseFloat(euroAmount.replace(",", ".")) || 0;
  const fcfa     = numEuro > 0 ? calcFcfa(couponType, numEuro) : 0;

  // Rate-per-euro for display
  const pcsRate   = Math.round(COUPON_RATES.pcs.rate * (1 - COUPON_RATES.pcs.commission / 100));
  const transRate = COUPON_RATES.transcash.rate;

  const resetForm = () => {
    setEuroAmount(""); setCouponCode(""); setBenefName(""); setPhone("");
    setErrors({});
  };

  const handleAddToCart = () => {
    const newErrors: FormErrors = {};
    if (numEuro < 20)          newErrors.euroAmount = "Montant minimum d'échange : 20€";
    if (couponType === "pcs" && couponCode.length < 8)
                               newErrors.couponCode = "Le code PCS doit comporter 8 caractères alphanumériques";
    if (couponType === "transcash" && couponCode.length < 12)
                               newErrors.couponCode = "Le code Transcash doit comporter 12 chiffres";
    if (!benefName.trim())     newErrors.benefName  = "Nom & prénom du bénéficiaire requis";
    if (phone.length < 9)      newErrors.phone      = "Le numéro doit comporter exactement 9 chiffres";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollRef.current?.scrollTo({ y: 340, animated: true });
      return;
    }
    setErrors({});

    const networkLabel = network === "orange" ? "Orange Money" : "MTN Mobile Money";
    const typeLabel    = couponType === "pcs" ? "PCS Mastercard" : "Transcash";

    addItem({
      id: `coupon-${Date.now()}`,
      cardId: `coupon-${couponType}`,
      cardName: `Échange ${typeLabel} - Code : ${couponCode} — Bénéficiaire : ${benefName} (${networkLabel} - Téléphone : +237${phone}),`, 
      amount: `Valeur d'échange : ${numEuro}€ → Montant à verser : ${fcfa.toLocaleString("fr-FR")} FCFA`,
      price: fcfa,
      qty: 1, 
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Ajouté au panier ✅",
      `Échange de ${numEuro}€ (${typeLabel})\nMontant à recevoir : ${fcfa.toLocaleString("fr-FR")} FCFA`,
      [{ text: "Continuer" }]
    );
    resetForm();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container} edges={["top"]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Échange Coupons</Text>
          {count > 0 ? (
            <TouchableOpacity style={styles.cartBadge} onPress={() => router.push("/cart")}>
              <Text style={styles.cartBadgeText}>🛒 {count}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 56 }} />
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* ── HERO ── */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 420 }}
            style={styles.heroWrap}
          >
            <Image source={IMG_HERO} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Échange tes coupons et/ou tickets{"\n"}PCS Mastercard ou Transcash{"\n"}facilement chez Chreol Empire
              </Text>
              <TouchableOpacity
                style={styles.heroCta}
                onPress={() => scrollRef.current?.scrollTo({ y: 340, animated: true })}
                activeOpacity={0.85}
              >
                <Text style={styles.heroCtaText}>Commencer l'échange  →</Text>
              </TouchableOpacity>
            </View>
          </MotiView>

          {/* ── TAUX DU JOUR — collapsible ── */}
          <TouchableOpacity
            style={styles.rateToggle}
            onPress={() => setRateOpen(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.rateToggleText}>💱 Voir les taux du jour</Text>
            <Text style={styles.rateToggleChevron}>{rateOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {rateOpen && (
            <MotiView
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 200 }}
              style={styles.rateRow}
            >
              <View style={styles.rateChip}>
                <Text style={styles.rateLabel}>PCS Mastercard</Text>
                <Text style={styles.rateValue}>1€ = {pcsRate} FCFA</Text>
                <Text style={styles.rateNote}>(après 7% commission)</Text>
              </View>
              <View style={[styles.rateChip, styles.rateChipGreen]}>
                <Text style={[styles.rateLabel, { color: "#25D366" }]}>Transcash</Text>
                <Text style={[styles.rateValue, { color: "#25D366" }]}>1€ = {transRate} FCFA</Text>
                <Text style={[styles.rateNote, { color: "#25D36699" }]}>0% commission</Text>
              </View>
            </MotiView>
          )}

          {/* ── SÉLECTEUR TYPE ── */}
          <Text style={styles.sectionLabel}>Type de coupon</Text>
          <View style={styles.typeRow}>
            {([
              { key: "pcs",       img: IMG_PCS,   label: "PCS Mastercard" },
              { key: "transcash", img: IMG_TRANS, label: "Transcash" },
            ] as const).map(({ key, img, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.typeCard, couponType === key && styles.typeCardActive]}
                onPress={() => { setCouponType(key); setCouponCode(""); setErrors(p => ({ ...p, couponCode: undefined })); }}
                activeOpacity={0.85}
              >
                <Image source={img} style={styles.typeImg} contentFit="contain" />
                <Text style={[styles.typeLabel, couponType === key && styles.typeLabelActive]}>
                  {label}
                </Text>
                {couponType === key && <Text style={styles.typeCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── FORMULAIRE COUPON ── */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Détails du coupon</Text>

            {/* Valeur en € */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Valeur totale du/des coupon(s) * (min. 20€)</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }, errors.euroAmount && styles.inputError]}
                  value={euroAmount}
                  onChangeText={t => { setEuroAmount(t.replace(/[^0-9.,]/g, "")); setErrors(p => ({ ...p, euroAmount: undefined })); }}
                  placeholder="Min. 20€ — Ex: 50"
                  placeholderTextColor={colors.text.muted}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.inputUnit}>€ Euro</Text>
              </View>
              {errors.euroAmount && <Text style={styles.errorText}>⚠ {errors.euroAmount}</Text>}
            </View>

            {/* Code(s) */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>
                {couponType === "pcs" ? "Code PCS * (8 caractères)" : "Code Transcash * (12 chiffres)"}
              </Text>
              <TextInput
                style={[styles.input, errors.couponCode && styles.inputError]}
                value={couponType === "transcash" ? formatTranscash(couponCode) : couponCode}
                onChangeText={t => {
                  if (couponType === "pcs") {
                    setCouponCode(t.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8));
                  } else {
                    setCouponCode(t.replace(/\D/g, "").slice(0, 12));
                  }
                  setErrors(p => ({ ...p, couponCode: undefined }));
                }}
                placeholder={couponType === "pcs" ? "Ex: AB12CD34" : "Ex: 1234-5678-9012"}
                placeholderTextColor={colors.text.muted}
                keyboardType={couponType === "pcs" ? "default" : "number-pad"}
                autoCapitalize={couponType === "pcs" ? "characters" : "none"}
                maxLength={couponType === "pcs" ? 8 : 14}
              />
              <Text style={styles.fieldHint}>
                {couponType === "pcs"
                  ? "8 caractères alphanumériques — au dos de la carte PCS"
                  : "12 chiffres — au dos du ticket Transcash (format : xxxx-xxxx-xxxx)"}
              </Text>
              {errors.couponCode && <Text style={styles.errorText}>⚠ {errors.couponCode}</Text>}
            </View>
          </View>

          {/* ── RÉCEPTION MOBILE MONEY ── */}
          <View style={styles.benefCard}>
            <Text style={styles.benefTitle}>📱 Réception Mobile Money</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Nom & Prénom du bénéficiaire *</Text>
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
              <Text style={styles.fieldLabel}>Réseau Mobile *</Text>
              <View style={styles.networkRow}>
                <TouchableOpacity
                  style={[styles.networkBtn, network === "orange" && styles.networkBtnOrange]}
                  onPress={() => setNetwork("orange")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.networkEmoji}>🟠</Text>
                  <Text style={[styles.networkLabel, network === "orange" && { color: "#FF6600", fontWeight: "800" }]}>
                    Orange Money
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.networkBtn, network === "mtn" && styles.networkBtnMtn]}
                  onPress={() => setNetwork("mtn")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.networkEmoji}>🟡</Text>
                  <Text style={[styles.networkLabel, network === "mtn" && { color: "#FACC15", fontWeight: "800" }]}>
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

          {/* ── MONTANT À RECEVOIR ── */}
          {fcfa > 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 16 }}
              style={styles.resultBox}
            >
              <Text style={styles.resultLabel}>Vous allez recevoir</Text>
              <Text style={styles.resultValue}>{fcfa.toLocaleString("fr-FR")} FCFA</Text>
              <Text style={styles.resultSub}>
                {numEuro}€
                {couponType === "pcs" ? ` × 93% × ${COUPON_RATES.pcs.rate}` : ` × ${COUPON_RATES.transcash.rate}`}
                {" = "}{fcfa.toLocaleString("fr-FR")} FCFA
              </Text>
            </MotiView>
          )}

          {/* ── BULLE INFO ── */}
          <View style={styles.infoBubble}>
            <Text style={styles.infoBubbleText}>
              ⚡ La transaction sera prise en compte le plus rapidement possible après vérification de vos codes.
            </Text>
          </View>

          {/* ── RAPPEL PHOTO ── */}
          <View style={styles.photoReminder}>
            <Text style={styles.photoReminderTitle}>📸 Rappel important</Text>
            <Text style={styles.photoReminderText}>
              Après validation, envoyez la photo ou capture d'écran de votre coupon sur WhatsApp pour que nous puissions vérifier et traiter votre échange.
            </Text>
          </View>

          {/* ── COMMENT ÇA MARCHE — collapsible ── */}
          <TouchableOpacity
            style={styles.howHeader}
            onPress={() => setHowOpen(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.howHeaderText}>❓ Comment ça marche ?</Text>
            <Text style={styles.howChevron}>{howOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {howOpen && (
            <MotiView
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 220 }}
              style={styles.howBody}
            >
              {[
                "Sélectionnez le type de coupon (PCS ou Transcash)",
                "Entrez la valeur en € et le(s) code(s) du coupon",
                "Renseignez les infos Mobile Money du bénéficiaire",
                "Ajoutez au panier puis soumettez la commande",
                "Envoyez la photo du coupon sur WhatsApp pour vérification",
                "Paiement Mobile Money effectué dès confirmation ✅",
              ].map((step, i) => (
                <View key={i} style={styles.howStep}>
                  <View style={styles.howStepNum}>
                    <Text style={styles.howStepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.howStepText}>{step}</Text>
                </View>
              ))}
            </MotiView>
          )}

          {/* ── ACTIONS ── */}
          <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart} activeOpacity={0.87}>
            <Text style={styles.addCartBtnText}>🛒  Ajouter au panier</Text>
          </TouchableOpacity>

          {count > 0 && (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => router.push("/cart")}
              activeOpacity={0.87}
            >
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
  heroWrap: { height: 210, borderRadius: radius["2xl"], overflow: "hidden", justifyContent: "flex-end" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.58)" },
  heroContent: { padding: 20, gap: 14 },
  heroTitle: { fontSize: 16, fontWeight: "800", color: "#fff", lineHeight: 23 },
  heroCta: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingVertical: 11, paddingHorizontal: 20, alignSelf: "flex-start",
  },
  heroCtaText: { fontSize: 13, fontWeight: "800", color: "#0A0A0A" },

  // Taux toggle
  rateToggle: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  rateToggleText: { fontSize: 13, fontWeight: "700", color: colors.brand.gold },
  rateToggleChevron: { fontSize: 11, color: colors.text.muted },
  rateRow: { flexDirection: "row", gap: 10 },
  rateChip: {
    flex: 1, borderRadius: radius.xl, borderWidth: 1.5,
    borderColor: colors.brand.gold + "55", backgroundColor: colors.brand.goldLight,
    paddingVertical: 12, paddingHorizontal: 12, gap: 2,
  },
  rateChipGreen: { borderColor: "#25D36655", backgroundColor: "#0A1A0A" },
  rateLabel: { fontSize: 10, fontWeight: "700", color: colors.brand.gold, textTransform: "uppercase" },
  rateValue: { fontSize: 16, fontWeight: "900", color: colors.brand.goldDark },
  rateNote:  { fontSize: 10, color: colors.brand.gold + "99" },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.4,
  },

  // Type selector
  typeRow: { flexDirection: "row", gap: 10 },
  typeCard: {
    flex: 1, backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border.default,
    padding: 12, alignItems: "center", gap: 8,
  },
  typeCardActive: { borderColor: colors.brand.gold },
  typeImg: { width: "100%", height: 72, borderRadius: radius.md },
  typeLabel: { fontSize: 12, fontWeight: "700", color: colors.text.secondary, textAlign: "center" },
  typeLabelActive: { color: colors.brand.gold },
  typeCheck: { color: colors.brand.gold, fontWeight: "800", fontSize: 16 },

  // Form
  formCard: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default, padding: 16, gap: 14,
  },
  formTitle: { fontSize: 14, fontWeight: "800", color: colors.text.primary },

  benefCard: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: "#3B82F633", padding: 16, gap: 14,
  },
  benefTitle: { fontSize: 14, fontWeight: "800", color: colors.text.primary },

  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  fieldHint:  { fontSize: 10, color: colors.text.muted, lineHeight: 14 },
  input: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: colors.text.primary, fontWeight: "600",
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  inputUnit: { fontSize: 13, color: colors.text.muted, fontWeight: "700" },
  dialCodeBox: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 12, paddingVertical: 13,
  },
  dialCode: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },

  // Network selector
  networkRow: { flexDirection: "row", gap: 10 },
  networkBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default, paddingVertical: 14,
  },
  networkBtnOrange: { borderColor: "#FF660055", backgroundColor: "#FF660011" },
  networkBtnMtn:    { borderColor: "#FACC1555", backgroundColor: "#FACC1511" },
  networkEmoji: { fontSize: 18 },
  networkLabel: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },

  // Result
  resultBox: {
    backgroundColor: colors.brand.goldLight, borderRadius: radius.xl,
    padding: 20, alignItems: "center", gap: 6,
    borderWidth: 1.5, borderColor: colors.brand.gold + "66",
  },
  resultLabel: { fontSize: 13, fontWeight: "600", color: colors.brand.goldDark },
  resultValue: { fontSize: 34, fontWeight: "900", color: colors.brand.goldDark },
  resultSub:   { fontSize: 11, color: colors.brand.goldDark, opacity: 0.7 },

  // Info bubble
  infoBubble: {
    backgroundColor: "#0A0A1E", borderRadius: radius.lg,
    borderWidth: 1, borderColor: "#6366F133", padding: 14,
  },
  infoBubbleText: { fontSize: 12, color: "#A5B4FC", lineHeight: 19 },

  // Photo reminder
  photoReminder: {
    backgroundColor: "#0A1A0A", borderRadius: radius.lg,
    borderWidth: 1, borderColor: "#25D36633", padding: 14, gap: 6,
  },
  photoReminderTitle: { fontSize: 13, fontWeight: "800", color: "#25D366" },
  photoReminderText:  { fontSize: 12, color: "#7DCF9F", lineHeight: 18 },

  // Comment ça marche
  howHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  howHeaderText: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  howChevron: { fontSize: 11, color: colors.text.muted },
  howBody: {
    backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: 16, gap: 12,
    borderWidth: 1, borderColor: colors.border.default,
  },
  howStep: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  howStepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.brand.gold, alignItems: "center", justifyContent: "center",
  },
  howStepNumText: { fontSize: 12, fontWeight: "800", color: "#0A0A0A" },
  howStepText: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 20 },

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

  helpBtn: {
    borderRadius: radius.full, borderWidth: 1.5, borderColor: "#25D36644",
    paddingVertical: 14, alignItems: "center", backgroundColor: "#25D36610",
  },
  helpBtnText: { fontSize: 13, fontWeight: "700", color: "#25D366" },

  inputError: { borderColor: "#EF4444" },
  errorText:  { fontSize: 11, fontWeight: "600", color: "#EF4444", marginTop: 2 },
});
