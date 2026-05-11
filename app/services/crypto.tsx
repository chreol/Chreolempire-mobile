import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { CONTACT, CRYPTO_RATES } from "@/constants/services";

type Direction = "buy" | "sell";

export default function CryptoScreen() {
  const router = useRouter();
  const [direction, setDirection] = useState<Direction>("buy");
  const [selectedCrypto, setSelectedCrypto] = useState(0);
  const [amount, setAmount] = useState("");

  const crypto = CRYPTO_RATES[selectedCrypto];
  const rate = direction === "buy" ? crypto.buyRate : crypto.sellRate;
  const numAmount = parseFloat(amount.replace(/\s/g, "")) || 0;

  const fcfa = direction === "buy" ? Math.round(numAmount * rate) : Math.round(numAmount * rate);
  const cryptoResult = direction === "sell" ? numAmount / rate : 0;

  const handleOrder = () => {
    const msg = direction === "buy"
      ? `Bonjour Chreol Empire 👋\nJe souhaite ACHETER du ${crypto.name} :\n💰 ${numAmount} ${crypto.name}\n💵 Total : ${fcfa.toLocaleString()} FCFA\n\nMerci de me donner les instructions de paiement.`
      : `Bonjour Chreol Empire 👋\nJe souhaite VENDRE du ${crypto.name} :\n💰 ${numAmount.toLocaleString()} FCFA\n🪙 Equivale à : ${cryptoResult.toFixed(4)} ${crypto.name}\n\nMerci de me donner l'adresse de dépôt.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crypto / PayPal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Direction */}
        <View style={styles.dirRow}>
          <TouchableOpacity style={[styles.dirBtn, direction === "buy" && styles.dirBtnActive]} onPress={() => setDirection("buy")}>
            <Text style={[styles.dirText, direction === "buy" && styles.dirTextActive]}>🛒 J&apos;achète</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dirBtn, direction === "sell" && styles.dirBtnActive]} onPress={() => setDirection("sell")}>
            <Text style={[styles.dirText, direction === "sell" && styles.dirTextActive]}>💸 Je vends</Text>
          </TouchableOpacity>
        </View>

        {/* Crypto selector */}
        <Text style={styles.sectionLabel}>Cryptomonnaie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cryptoRow}>
          {CRYPTO_RATES.map((c, i) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.cryptoChip, selectedCrypto === i && { backgroundColor: c.color, borderColor: c.color }]}
              onPress={() => setSelectedCrypto(i)}
            >
              <Text style={styles.cryptoIcon}>{c.icon}</Text>
              <Text style={[styles.cryptoName, selectedCrypto === i && { color: "#fff" }]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Rate display */}
        <View style={[styles.rateBox, { borderColor: crypto.color + "66", backgroundColor: crypto.color + "11" }]}>
          <Text style={styles.rateLabel}>{direction === "buy" ? "Prix d'achat" : "Prix de vente"}</Text>
          <Text style={[styles.rateValue, { color: crypto.color }]}>
            1 {crypto.name} = {rate.toLocaleString()} FCFA
          </Text>
          <Text style={styles.rateSub}>Min : {crypto.min.toLocaleString()} FCFA — Max : {crypto.max.toLocaleString()} FCFA</Text>
        </View>

        {/* Amount input */}
        <Text style={styles.sectionLabel}>
          {direction === "buy" ? `Quantité en ${crypto.name}` : "Montant en FCFA à vendre"}
        </Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder={direction === "buy" ? "Ex: 10" : "Ex: 50000"}
            placeholderTextColor={colors.text.muted}
          />
          <Text style={styles.inputUnit}>{direction === "buy" ? crypto.name : "FCFA"}</Text>
        </View>

        {/* Result */}
        {numAmount > 0 && (
          <View style={[styles.resultBox, { borderColor: crypto.color + "55" }]}>
            <Text style={styles.resultLabel}>{direction === "buy" ? "Vous payez :" : "Vous recevez :"}</Text>
            {direction === "buy" ? (
              <Text style={[styles.resultValue, { color: crypto.color }]}>{fcfa.toLocaleString()} FCFA</Text>
            ) : (
              <Text style={[styles.resultValue, { color: crypto.color }]}>{fcfa.toLocaleString()} FCFA</Text>
            )}
          </View>
        )}

        {/* All rates table */}
        <View style={styles.ratesTable}>
          <Text style={styles.ratesTableTitle}>📊 Tous les taux</Text>
          {CRYPTO_RATES.map((c) => (
            <View key={c.id} style={styles.ratesRow}>
              <Text style={styles.ratesCrypto}>{c.icon} {c.name}</Text>
              <View style={styles.ratesValues}>
                <Text style={styles.ratesBuy}>Achat: {c.buyRate.toLocaleString()}</Text>
                <Text style={styles.ratesSell}>Vente: {c.sellRate.toLocaleString()}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.ratesFcfa}>Taux en FCFA</Text>
        </View>

        <Text style={styles.otherCryptos}>Autres cryptos disponibles : SOL, LTC, ETH, ADA, BUSD</Text>
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
  dirRow: { flexDirection: "row", gap: 10 },
  dirBtn: {
    flex: 1, paddingVertical: 14, borderRadius: radius.xl,
    alignItems: "center", borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
  },
  dirBtnActive: { backgroundColor: colors.brand.gold, borderColor: colors.brand.gold },
  dirText: { fontSize: 14, fontWeight: "700", color: colors.text.muted },
  dirTextActive: { color: "#fff" },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: colors.text.secondary },
  cryptoRow: { gap: 10 },
  cryptoChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: colors.bg.card, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border.default,
  },
  cryptoIcon: { fontSize: 18 },
  cryptoName: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  rateBox: { borderRadius: radius.xl, padding: 16, gap: 6, borderWidth: 1 },
  rateLabel: { fontSize: 12, color: colors.text.secondary },
  rateValue: { fontSize: 22, fontWeight: "900" },
  rateSub: { fontSize: 11, color: colors.text.muted },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong, overflow: "hidden",
  },
  input: { flex: 1, padding: 16, fontSize: 18, color: colors.text.primary, fontWeight: "700" },
  inputUnit: { paddingHorizontal: 16, fontSize: 13, color: colors.text.muted, fontWeight: "600" },
  resultBox: { borderRadius: radius.xl, padding: 20, alignItems: "center", gap: 4, borderWidth: 1, backgroundColor: colors.bg.card },
  resultLabel: { fontSize: 12, color: colors.text.secondary },
  resultValue: { fontSize: 28, fontWeight: "900" },
  ratesTable: { backgroundColor: colors.bg.card, borderRadius: radius.xl, padding: 14, gap: 10, borderWidth: 1, borderColor: colors.border.default },
  ratesTableTitle: { fontSize: 13, fontWeight: "700", color: colors.text.primary, marginBottom: 4 },
  ratesRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ratesCrypto: { fontSize: 13, fontWeight: "600", color: colors.text.primary, width: 100 },
  ratesValues: { flexDirection: "row", gap: 16 },
  ratesBuy: { fontSize: 12, color: colors.accent.crypto },
  ratesSell: { fontSize: 12, color: colors.accent.red },
  ratesFcfa: { fontSize: 11, color: colors.text.muted, fontStyle: "italic", marginTop: 4 },
  otherCryptos: { fontSize: 12, color: colors.text.muted, textAlign: "center", fontStyle: "italic" },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.primary, borderTopWidth: 1,
    borderTopColor: colors.border.default, padding: 16,
  },
  orderBtn: { backgroundColor: colors.brand.gold, borderRadius: radius.full, paddingVertical: 16, alignItems: "center" },
  orderBtnDisabled: { opacity: 0.4 },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
