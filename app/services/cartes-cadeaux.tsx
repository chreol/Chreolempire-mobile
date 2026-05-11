import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { GIFT_CARDS, CONTACT } from "@/constants/services";

export default function CartesCadeauxScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<{ cardId: string; amountIdx: number } | null>(null);

  const selectedCard = selected ? GIFT_CARDS.find((c) => c.id === selected.cardId) : null;
  const selectedAmount = selectedCard && selected ? selectedCard.amounts[selected.amountIdx] : null;

  const handleOrder = () => {
    if (!selectedCard || !selectedAmount) return Alert.alert("Sélectionner", "Choisissez une carte et un montant.");
    const msg = `Bonjour Chreol Empire 👋\nJe souhaite commander :\n🎮 ${selectedCard.name} - ${selectedAmount.label}\n💰 ${selectedAmount.price.toLocaleString()} FCFA\n\nMerci de confirmer la disponibilité.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cartes Cadeaux</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>🎮 Choisir votre carte</Text>

        {GIFT_CARDS.map((card) => (
          <View key={card.id} style={[styles.cardBlock, selected?.cardId === card.id && styles.cardBlockActive]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setSelected(selected?.cardId === card.id ? null : { cardId: card.id, amountIdx: 0 })}
            >
              <Image source={{ uri: card.image }} style={styles.cardImg} contentFit="contain" />
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={[styles.cardArrow, { color: card.color }]}>
                {selected?.cardId === card.id ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {selected?.cardId === card.id && (
              <View style={styles.amounts}>
                <Text style={styles.amountsLabel}>Choisir le montant :</Text>
                <View style={styles.amountsGrid}>
                  {card.amounts.map((amt, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.amtBtn,
                        selected.amountIdx === i && { backgroundColor: card.color, borderColor: card.color },
                      ]}
                      onPress={() => setSelected({ cardId: card.id, amountIdx: i })}
                    >
                      <Text style={[styles.amtLabel, selected.amountIdx === i && { color: "#fff" }]}>{amt.label}</Text>
                      <Text style={[styles.amtPrice, { color: selected.amountIdx === i ? "#fff" : card.color }]}>
                        {amt.price.toLocaleString()} FCFA
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Informations</Text>
          <Text style={styles.infoText}>• Livraison par Email, WhatsApp ou SMS en 15–30 min{"\n"}• Paiement : Orange Money ou MTN MoMo{"\n"}• Codes authentiques et garantis</Text>
        </View>
      </ScrollView>

      {selected && selectedAmount && (
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>{selectedCard?.name} — {selectedAmount.label}</Text>
            <Text style={styles.footerPrice}>{selectedAmount.price.toLocaleString()} FCFA</Text>
          </View>
          <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
            <Text style={styles.orderBtnText}>Commander →</Text>
          </TouchableOpacity>
        </View>
      )}
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
  content: { padding: 16, gap: 10, paddingBottom: 100 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: colors.text.secondary, marginBottom: 4 },
  cardBlock: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border.default,
    overflow: "hidden",
  },
  cardBlockActive: { borderColor: colors.brand.gold },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  cardImg: { width: 60, height: 40, borderRadius: 6 },
  cardName: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text.primary },
  cardArrow: { fontSize: 14, fontWeight: "700" },
  amounts: { paddingHorizontal: 14, paddingBottom: 14 },
  amountsLabel: { fontSize: 12, color: colors.text.secondary, marginBottom: 10 },
  amountsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amtBtn: {
    borderWidth: 1.5, borderColor: colors.border.strong,
    borderRadius: radius.lg, padding: 10, minWidth: "45%", alignItems: "center",
  },
  amtLabel: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  amtPrice: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  infoBox: {
    backgroundColor: colors.brand.goldLight, borderRadius: radius.lg,
    padding: 14, borderWidth: 1, borderColor: colors.brand.gold + "55",
  },
  infoTitle: { fontSize: 13, fontWeight: "700", color: colors.brand.goldDark, marginBottom: 8 },
  infoText: { fontSize: 12, color: colors.brand.goldDark, lineHeight: 20 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.primary, borderTopWidth: 1, borderTopColor: colors.border.default,
    padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  footerLabel: { fontSize: 12, color: colors.text.secondary },
  footerPrice: { fontSize: 18, fontWeight: "800", color: colors.brand.gold },
  orderBtn: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  orderBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
