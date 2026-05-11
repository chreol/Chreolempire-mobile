import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Linking } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { IMAGES, CONTACT, UBA_CARDS, UBA_RECHARGE_FEES } from "@/constants/services";

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
  const [tab, setTab] = useState<Tab>("recharge");
  const [amount, setAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState(1);

  const numAmount = parseInt(amount.replace(/\s/g, ""), 10) || 0;
  const fee = calcFee(numAmount);
  const total = numAmount + fee;

  const handleOrder = () => {
    if (tab === "recharge") {
      const msg = `Bonjour Chreol Empire 👋\nJe souhaite recharger ma carte UBA :\n💳 Montant : ${numAmount.toLocaleString()} FCFA\n💰 Total avec frais : ${total.toLocaleString()} FCFA\n\nMerci de me guider pour la suite.`;
      Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
    } else {
      const card = UBA_CARDS[selectedCard];
      const msg = `Bonjour Chreol Empire 👋\nJe souhaite acheter une carte Visa UBA Prépayée :\n🏦 Segment ${card.segment} — ${card.price.toLocaleString()} FCFA\nLimite : ${card.limit}\n\nMerci de me confirmer les documents requis.`;
      Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>UBA Cameroun</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === "recharge" && styles.tabActive]} onPress={() => setTab("recharge")}>
          <Text style={[styles.tabText, tab === "recharge" && styles.tabTextActive]}>Recharge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === "achat" && styles.tabActive]} onPress={() => setTab("achat")}>
          <Text style={[styles.tabText, tab === "achat" && styles.tabTextActive]}>Acheter une carte</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Image source={{ uri: IMAGES.uba }} style={styles.heroImg} contentFit="contain" />

        {tab === "recharge" ? (
          <>
            <Text style={styles.sectionTitle}>Recharger votre carte UBA</Text>
            <Text style={styles.sectionSub}>Entrez le montant à recharger</Text>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Ex: 50000"
                placeholderTextColor={colors.text.muted}
              />
              <Text style={styles.inputUnit}>FCFA</Text>
            </View>

            {numAmount > 0 && (
              <View style={styles.calcBox}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Montant demandé</Text>
                  <Text style={styles.calcValue}>{numAmount.toLocaleString()} FCFA</Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Frais de service</Text>
                  <Text style={[styles.calcValue, { color: colors.accent.red }]}>+{fee.toLocaleString()} FCFA</Text>
                </View>
                <View style={[styles.calcRow, styles.calcTotal]}>
                  <Text style={styles.calcTotalLabel}>Total à payer</Text>
                  <Text style={styles.calcTotalValue}>{total.toLocaleString()} FCFA</Text>
                </View>
              </View>
            )}

            <View style={styles.feesTable}>
              <Text style={styles.feesTitle}>📋 Grille de frais</Text>
              {UBA_RECHARGE_FEES.map((t, i) => (
                <View key={i} style={styles.feeRow}>
                  <Text style={styles.feeTranche}>{t.min.toLocaleString()} – {t.max.toLocaleString()} FCFA</Text>
                  <Text style={styles.feeFee}>
                    {t.type === "fixed" ? `+${t.fee.toLocaleString()} FCFA` : `+${t.fee}%`}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Cartes Visa Prépayées UBA</Text>
            <Text style={styles.sectionSub}>Choisissez votre segment</Text>

            {UBA_CARDS.map((card, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.cardSegment, selectedCard === i && styles.cardSegmentActive]}
                onPress={() => setSelectedCard(i)}
              >
                {card.popular && <View style={styles.popularTag}><Text style={styles.popularTagText}>⭐ Populaire</Text></View>}
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

            <View style={styles.docsBox}>
              <Text style={styles.docsTitle}>📋 Documents requis</Text>
              <Text style={styles.docsText}>
                • Photocopie CNI ou Passeport{"\n"}
                • Photo passeport couleur{"\n"}
                • Plan de localisation{"\n"}
                • Numéro NUI{"\n\n"}
                📍 Retrait en agence : {CONTACT.address}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
          <Text style={styles.orderBtnText}>
            {tab === "recharge" ? "Recharger via WhatsApp →" : "Commander via WhatsApp →"}
          </Text>
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
  tabs: { flexDirection: "row", backgroundColor: colors.bg.primary, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.brand.gold },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.text.muted },
  tabTextActive: { color: colors.brand.gold },
  content: { padding: 16, gap: 14, paddingBottom: 100 },
  heroImg: { width: "100%", height: 80, borderRadius: radius.lg },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  sectionSub: { fontSize: 13, color: colors.text.secondary },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong, overflow: "hidden",
  },
  input: { flex: 1, padding: 16, fontSize: 18, color: colors.text.primary, fontWeight: "700" },
  inputUnit: { paddingHorizontal: 16, fontSize: 14, color: colors.text.muted, fontWeight: "600" },
  calcBox: {
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    padding: 16, gap: 10,
    borderWidth: 1, borderColor: colors.border.default,
  },
  calcRow: { flexDirection: "row", justifyContent: "space-between" },
  calcLabel: { fontSize: 13, color: colors.text.secondary },
  calcValue: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  calcTotal: { borderTopWidth: 1, borderTopColor: colors.border.default, paddingTop: 10, marginTop: 4 },
  calcTotalLabel: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  calcTotalValue: { fontSize: 17, fontWeight: "800", color: colors.brand.gold },
  feesTable: { backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: 14, gap: 8, borderWidth: 1, borderColor: colors.border.default },
  feesTitle: { fontSize: 13, fontWeight: "700", color: colors.text.primary, marginBottom: 4 },
  feeRow: { flexDirection: "row", justifyContent: "space-between" },
  feeTranche: { fontSize: 12, color: colors.text.secondary },
  feeFee: { fontSize: 12, fontWeight: "700", color: colors.accent.red },
  cardSegment: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    padding: 16, gap: 6, borderWidth: 1.5, borderColor: colors.border.default, position: "relative",
  },
  cardSegmentActive: { borderColor: colors.brand.gold, backgroundColor: colors.brand.goldLight + "44" },
  popularTag: {
    position: "absolute", top: 12, right: 12,
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  popularTagText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  segmentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  segmentTitle: { fontSize: 16, fontWeight: "800", color: colors.text.primary },
  segmentPrice: { fontSize: 16, fontWeight: "800", color: colors.brand.gold },
  segmentLimit: { fontSize: 12, color: colors.text.secondary },
  segmentFeature: { fontSize: 12, color: colors.text.secondary },
  docsBox: { backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border.default },
  docsTitle: { fontSize: 13, fontWeight: "700", color: colors.text.primary, marginBottom: 8 },
  docsText: { fontSize: 12, color: colors.text.secondary, lineHeight: 22 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.primary, borderTopWidth: 1,
    borderTopColor: colors.border.default, padding: 16,
  },
  orderBtn: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingVertical: 16, alignItems: "center",
  },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
