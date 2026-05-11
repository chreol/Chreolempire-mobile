import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { CONTACT, COUPON_RATES } from "@/constants/services";

type CouponType = "pcs" | "transcash";

export default function CouponsScreen() {
  const router = useRouter();
  const [type, setType] = useState<CouponType>("pcs");
  const [amount, setAmount] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const rate = COUPON_RATES[type];
  const fcfa = type === "pcs"
    ? Math.round(numAmount * (1 - rate.commission / 100) * rate.rate)
    : Math.round(numAmount * rate.rate);

  const handleOrder = () => {
    const msg = `Bonjour Chreol Empire 👋\nJe souhaite échanger un coupon :\n💳 Type : ${type === "pcs" ? "PCS Mastercard" : "Transcash"}\n💶 Montant : ${numAmount}€\n💰 Valeur estimée : ${fcfa.toLocaleString()} FCFA\n\nJe vais envoyer la capture du coupon.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Échange Coupons</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Type selector */}
        <Text style={styles.sectionLabel}>Type de coupon</Text>
        <View style={styles.typePicker}>
          <TouchableOpacity
            style={[styles.typeBtn, type === "pcs" && styles.typeBtnActive]}
            onPress={() => setType("pcs")}
          >
            <Text style={styles.typeIcon}>💳</Text>
            <Text style={[styles.typeText, type === "pcs" && styles.typeTextActive]}>PCS Mastercard</Text>
            {type === "pcs" && <Text style={styles.typeCheck}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, type === "transcash" && styles.typeBtnActive]}
            onPress={() => setType("transcash")}
          >
            <Text style={styles.typeIcon}>🟩</Text>
            <Text style={[styles.typeText, type === "transcash" && styles.typeTextActive]}>Transcash</Text>
            {type === "transcash" && <Text style={styles.typeCheck}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Formula */}
        <View style={styles.formulaBox}>
          <Text style={styles.formulaLabel}>Formule de calcul :</Text>
          <Text style={styles.formula}>{rate.formula}</Text>
          {type === "pcs" && (
            <Text style={styles.formulaNote}>Commission de 7% déduite sur le montant PCS</Text>
          )}
          {type === "transcash" && (
            <Text style={styles.formulaNote}>Taux plein sans commission</Text>
          )}
        </View>

        {/* Amount input */}
        <Text style={styles.sectionLabel}>Montant du coupon (€)</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="Ex: 20"
            placeholderTextColor={colors.text.muted}
          />
          <Text style={styles.inputUnit}>€</Text>
        </View>

        {/* Result */}
        {numAmount > 0 && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Vous recevrez :</Text>
            <Text style={styles.resultValue}>{fcfa.toLocaleString()} FCFA</Text>
            <Text style={styles.resultSub}>
              {numAmount}€ × {rate.rate}{type === "pcs" ? ` − ${rate.commission}%` : ""} = {fcfa.toLocaleString()} FCFA
            </Text>
          </View>
        )}

        {/* Process */}
        <View style={styles.processBox}>
          <Text style={styles.processTitle}>📋 Comment ça marche ?</Text>
          <View style={styles.processStep}><Text style={styles.stepNum}>1</Text><Text style={styles.stepText}>Sélectionnez le type et entrez le montant</Text></View>
          <View style={styles.processStep}><Text style={styles.stepNum}>2</Text><Text style={styles.stepText}>Cliquez "Envoyer via WhatsApp"</Text></View>
          <View style={styles.processStep}><Text style={styles.stepNum}>3</Text><Text style={styles.stepText}>Transmettez la capture d&apos;écran du/des coupon(s)</Text></View>
          <View style={styles.processStep}><Text style={styles.stepNum}>4</Text><Text style={styles.stepText}>Paiement Mobile Money dès vérification des codes</Text></View>
        </View>

        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>💰 Paiement vers vous</Text>
          <Text style={styles.paymentText}>🟠 Orange Money   🟡 MTN MoMo</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.orderBtn, !numAmount && styles.orderBtnDisabled]} onPress={handleOrder} disabled={!numAmount}>
          <Text style={styles.orderBtnText}>💬 Envoyer via WhatsApp →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.secondary },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.bg.primary, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 22, color: colors.text.primary },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },
  content: { padding: 16, gap: 14, paddingBottom: 100 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.text.secondary },
  typePicker: { gap: 10 },
  typeBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    padding: 16, borderWidth: 1.5, borderColor: colors.border.default,
  },
  typeBtnActive: { borderColor: colors.brand.gold, backgroundColor: colors.brand.goldLight + "33" },
  typeIcon: { fontSize: 24 },
  typeText: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text.secondary },
  typeTextActive: { color: colors.text.primary, fontWeight: "700" },
  typeCheck: { color: colors.brand.gold, fontWeight: "800", fontSize: 16 },
  formulaBox: {
    backgroundColor: "#F0F9FF", borderRadius: radius.lg,
    padding: 14, borderWidth: 1, borderColor: "#BAE6FD",
  },
  formulaLabel: { fontSize: 12, color: "#0369A1", fontWeight: "600" },
  formula: { fontSize: 16, fontWeight: "800", color: "#0369A1", marginTop: 4 },
  formulaNote: { fontSize: 11, color: "#0369A1", marginTop: 4, fontStyle: "italic" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong, overflow: "hidden",
  },
  input: { flex: 1, padding: 16, fontSize: 18, color: colors.text.primary, fontWeight: "700" },
  inputUnit: { paddingHorizontal: 16, fontSize: 16, color: colors.text.muted, fontWeight: "600" },
  resultBox: {
    backgroundColor: colors.brand.goldLight, borderRadius: radius.xl,
    padding: 20, alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: colors.brand.gold + "66",
  },
  resultLabel: { fontSize: 13, color: colors.brand.goldDark, fontWeight: "600" },
  resultValue: { fontSize: 32, fontWeight: "900", color: colors.brand.goldDark },
  resultSub: { fontSize: 12, color: colors.brand.goldDark, opacity: 0.7 },
  processBox: { backgroundColor: colors.bg.card, borderRadius: radius.xl, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border.default },
  processTitle: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  processStep: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.brand.gold, color: "#fff",
    fontSize: 12, fontWeight: "800", textAlign: "center", lineHeight: 24,
  },
  stepText: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
  paymentBox: { backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: 14, alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.border.default },
  paymentTitle: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  paymentText: { fontSize: 15 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.primary, borderTopWidth: 1,
    borderTopColor: colors.border.default, padding: 16,
  },
  orderBtn: { backgroundColor: "#25D366", borderRadius: radius.full, paddingVertical: 16, alignItems: "center" },
  orderBtnDisabled: { opacity: 0.4 },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
