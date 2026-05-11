import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { CONTACT, IMAGES, PAYPAL_LIMITS } from "@/constants/services";
import { Image } from "expo-image";

type Direction = "buy" | "sell";

export default function PaypalScreen() {
  const router = useRouter();
  const [direction, setDirection] = useState<Direction>("buy");
  const [amount, setAmount] = useState("");

  const numAmount = parseFloat(amount) || 0;
  // Approximate rate: 1€ ≈ 650 FCFA for PayPal
  const PAYPAL_RATE = 650;
  const fcfa = Math.round(numAmount * PAYPAL_RATE);
  const euros = Math.round(numAmount / PAYPAL_RATE);

  const handleOrder = () => {
    const msg = direction === "buy"
      ? `Bonjour Chreol Empire 👋\nJe souhaite ACHETER du solde PayPal :\n💶 Montant : ${numAmount.toLocaleString()} FCFA\n\nMerci de me donner les instructions.`
      : `Bonjour Chreol Empire 👋\nJe souhaite VENDRE mon solde PayPal :\n💶 Montant : ${numAmount}€\n📧 J'enverrai vers : ${CONTACT.paypalEmail}\n\nMerci de confirmer.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PayPal Europe</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Image source={{ uri: IMAGES.paypal }} style={styles.heroImg} contentFit="contain" />

        <Text style={styles.heroTitle}>Achat & Vente de solde PayPal Europe</Text>
        <Text style={styles.heroSub}>Recharges rapides via Mobile Money. Sécurisé et garanti.</Text>

        {/* Direction */}
        <View style={styles.dirRow}>
          <TouchableOpacity style={[styles.dirBtn, direction === "buy" && styles.dirBtnActive]} onPress={() => setDirection("buy")}>
            <Text style={[styles.dirText, direction === "buy" && styles.dirTextActive]}>🛒 Acheter</Text>
            <Text style={[styles.dirSub, direction === "buy" && { color: "#fff" }]}>FCFA → PayPal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dirBtn, direction === "sell" && styles.dirBtnActive]} onPress={() => setDirection("sell")}>
            <Text style={[styles.dirText, direction === "sell" && styles.dirTextActive]}>💸 Vendre</Text>
            <Text style={[styles.dirSub, direction === "sell" && { color: "#fff" }]}>PayPal → FCFA</Text>
          </TouchableOpacity>
        </View>

        {/* Limits */}
        <View style={styles.limitsRow}>
          <View style={styles.limitCard}>
            <Text style={styles.limitLabel}>Vente (retrait)</Text>
            <Text style={styles.limitValue}>Min €20 — Max €500/jour</Text>
          </View>
          <View style={styles.limitCard}>
            <Text style={styles.limitLabel}>Achat (recharge)</Text>
            <Text style={styles.limitValue}>Min 10 000 — Max 500 000 FCFA</Text>
          </View>
        </View>

        {/* Amount */}
        <Text style={styles.sectionLabel}>
          {direction === "buy" ? "Montant à dépenser (FCFA)" : "Montant à vendre (€)"}
        </Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder={direction === "buy" ? "Ex: 50000" : "Ex: 50"}
            placeholderTextColor={colors.text.muted}
          />
          <Text style={styles.inputUnit}>{direction === "buy" ? "FCFA" : "€"}</Text>
        </View>

        {/* PayPal email */}
        {direction === "sell" && (
          <View style={styles.emailBox}>
            <Text style={styles.emailLabel}>📧 Adresse PayPal de réception :</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${CONTACT.paypalEmail}`)}>
              <Text style={styles.emailValue}>{CONTACT.paypalEmail}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Process */}
        <View style={styles.processBox}>
          <Text style={styles.processTitle}>📋 Process en 3 étapes</Text>
          <View style={styles.step}><Text style={styles.stepNum}>1</Text><Text style={styles.stepText}>Sélectionnez et entrez le montant</Text></View>
          <View style={styles.step}><Text style={styles.stepNum}>2</Text><Text style={styles.stepText}>Réglez via Orange Money ou MTN Money</Text></View>
          <View style={styles.step}><Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>
              {direction === "buy"
                ? "Recevez votre solde PayPal par WhatsApp, Email ou SMS"
                : "Joignez la capture du paiement PayPal à votre message"}
            </Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            ℹ️ Joignez la capture d&apos;écran du paiement à votre message WhatsApp pour un traitement immédiat.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.orderBtn, !numAmount && styles.orderBtnDisabled]} onPress={handleOrder} disabled={!numAmount}>
          <Text style={styles.orderBtnText}>💬 Commander via WhatsApp →</Text>
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
  heroImg: { width: "100%", height: 70, borderRadius: radius.lg },
  heroTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  heroSub: { fontSize: 13, color: colors.text.secondary, marginTop: -8 },
  dirRow: { flexDirection: "row", gap: 10 },
  dirBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.xl, alignItems: "center",
    borderWidth: 1.5, borderColor: colors.border.default, backgroundColor: colors.bg.card, gap: 3,
  },
  dirBtnActive: { backgroundColor: "#0070BA", borderColor: "#0070BA" },
  dirText: { fontSize: 14, fontWeight: "700", color: colors.text.muted },
  dirTextActive: { color: "#fff" },
  dirSub: { fontSize: 11, color: colors.text.muted },
  limitsRow: { flexDirection: "row", gap: 10 },
  limitCard: { flex: 1, backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: colors.border.default },
  limitLabel: { fontSize: 11, color: colors.text.muted, fontWeight: "600" },
  limitValue: { fontSize: 11, color: colors.text.primary, fontWeight: "700", marginTop: 3 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.text.secondary },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong, overflow: "hidden",
  },
  input: { flex: 1, padding: 16, fontSize: 18, color: colors.text.primary, fontWeight: "700" },
  inputUnit: { paddingHorizontal: 16, fontSize: 14, color: colors.text.muted, fontWeight: "600" },
  emailBox: { backgroundColor: "#EFF6FF", borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: "#BFDBFE" },
  emailLabel: { fontSize: 12, color: "#1E40AF" },
  emailValue: { fontSize: 14, fontWeight: "800", color: "#1E40AF", marginTop: 4 },
  processBox: { backgroundColor: colors.bg.card, borderRadius: radius.xl, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border.default },
  processTitle: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#0070BA",
    color: "#fff", fontSize: 12, fontWeight: "800", textAlign: "center", lineHeight: 24,
  },
  stepText: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
  noteBox: { backgroundColor: "#F0FDF4", borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: "#BBF7D0" },
  noteText: { fontSize: 12, color: "#166534", lineHeight: 20 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.primary, borderTopWidth: 1, borderTopColor: colors.border.default, padding: 16,
  },
  orderBtn: { backgroundColor: colors.brand.gold, borderRadius: radius.full, paddingVertical: 16, alignItems: "center" },
  orderBtnDisabled: { opacity: 0.4 },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
