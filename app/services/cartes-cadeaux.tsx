import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { GIFT_CARDS } from "@/constants/services";
import { useCart } from "@/contexts/CartContext";

const LOCAL_IMAGES: Record<string, any> = {
  psn:    require("../../assets/PlayStation_Store_Card.png"),
  itunes: require("../../assets/itunes-gifts-for-business-hero_2x.jpg"),
  roblox: require("../../assets/App-icon-roblox.webp"),
};

const TABS = [
  { key: "standard", label: "Standard" },
  { key: "itunes",   label: "iTunes / GP" },
  { key: "robux",    label: "Robux" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function CartesCadeauxScreen() {
  const router = useRouter();
  const { addItem, count } = useCart();

  const [activeTab, setActiveTab] = useState<TabKey>("standard");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [addedFlash, setAddedFlash] = useState(false);

  const filteredCards = GIFT_CARDS.filter(c => c.tier === activeTab);
  const card = GIFT_CARDS.find(c => c.id === selectedCard);
  const amount = card?.amounts.find(a => a.label === selectedAmount);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSelectedCard(null);
    setSelectedAmount(null);
  };

  const handleCardSelect = (id: string) => {
    setSelectedCard(id);
    setSelectedAmount(null);
  };

  const handleAddToCart = async () => {
    if (!card || !amount) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem({
      id: `${card.id}-${amount.label}`,
      cardId: card.id,
      cardName: card.name,
      amount: amount.label,
      price: amount.price,
    });
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 800);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Cartes Cadeaux</Text>
          <Text style={styles.headerSub}>PSN · iTunes · Roblox · Steam</Text>
        </View>
        {count > 0 && (
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push("/cart")}>
            <Text style={styles.cartBtnIcon}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{count}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Tab bar */}
        <View style={styles.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => handleTabChange(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info banner for standard tier */}
        {activeTab === "standard" && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              🎮  PSN · Steam · Razer Gold · Roblox (€) · Nintendo eShop — même tarif
            </Text>
          </View>
        )}

        {/* Card selector */}
        <Text style={styles.sectionLabel}>Choisissez votre carte</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {filteredCards.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.cardChip, selectedCard === c.id && { borderColor: c.color, backgroundColor: c.color + "18" }]}
              onPress={() => handleCardSelect(c.id)}
              activeOpacity={0.8}
            >
              <Image source={LOCAL_IMAGES[c.localImage]} style={styles.cardChipImg} contentFit="contain" />
              <Text style={[styles.cardChipText, selectedCard === c.id && { color: colors.text.primary }]}>
                {c.name}
              </Text>
              {selectedCard === c.id && (
                <View style={[styles.cardChipCheck, { backgroundColor: c.color }]}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Amount grid */}
        {card && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
          >
            <Text style={styles.sectionLabel}>Choisissez le montant</Text>
            <View style={styles.amountGrid}>
              {card.amounts.map(a => {
                const isSelected = selectedAmount === a.label;
                return (
                  <TouchableOpacity
                    key={a.label}
                    style={[styles.amountCard, isSelected && { borderColor: card.color, backgroundColor: card.color + "18" }]}
                    onPress={() => setSelectedAmount(a.label)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.amountLabel, isSelected && { color: colors.text.primary }]}>{a.label}</Text>
                    <Text style={[styles.amountPrice, isSelected && { color: card.color }]}>
                      {a.price.toLocaleString("fr-FR")} F
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </MotiView>
        )}

        {/* Price table */}
        {card && (
          <View style={styles.priceTable}>
            <Text style={styles.priceTableTitle}>Tableau des prix — {card.name}</Text>
            {card.amounts.map((a, i) => (
              <View key={i} style={[styles.priceRow, i % 2 === 0 && styles.priceRowAlt]}>
                <Text style={styles.priceRowLabel}>{a.label}</Text>
                <Text style={styles.priceRowPrice}>{a.price.toLocaleString("fr-FR")} FCFA</Text>
              </View>
            ))}
          </View>
        )}

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Livraison & Paiement</Text>
          <Text style={styles.infoText}>
            {"• Codes livrés par Email ou WhatsApp en 15–30 min\n• Paiement : Orange Money ou MTN MoMo\n• Codes authentiques, vérifiés et garantis"}
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      {card && amount && (
        <MotiView
          from={{ translateY: 80, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          style={styles.bottomBar}
        >
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomCardName}>{card.name} — {amount.label}</Text>
            <Text style={styles.bottomPrice}>{amount.price.toLocaleString("fr-FR")} FCFA</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, addedFlash && styles.addBtnSuccess]}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnText}>{addedFlash ? "✓ Ajouté au panier !" : "Ajouter au panier 🛒"}</Text>
          </TouchableOpacity>
        </MotiView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 28, color: colors.text.primary, marginTop: -2 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },
  headerSub: { fontSize: 11, color: colors.text.secondary },
  cartBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  cartBtnIcon: { fontSize: 24 },
  cartBadge: {
    position: "absolute", top: 4, right: 4,
    backgroundColor: "#E50914", borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  scroll: { padding: 16 },

  tabs: {
    flexDirection: "row",
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.xl,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: radius.lg, alignItems: "center" },
  tabActive: { backgroundColor: colors.brand.gold },
  tabText: { fontSize: 12, fontWeight: "700", color: colors.text.muted },
  tabTextActive: { color: "#0A0A0A" },

  infoBanner: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  infoBannerText: { fontSize: 12, color: colors.text.secondary, textAlign: "center" },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.muted,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  cardRow: { gap: 10, paddingBottom: 4, marginBottom: 20 },
  cardChip: {
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
    minWidth: 90,
  },
  cardChipImg: { width: 44, height: 34 },
  cardChipText: { fontSize: 11, fontWeight: "700", color: colors.text.muted, textAlign: "center" },
  cardChipCheck: {
    position: "absolute", top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },

  amountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  amountCard: {
    width: "47%",
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    alignItems: "center",
    gap: 4,
  },
  amountLabel: { fontSize: 15, fontWeight: "800", color: colors.text.secondary },
  amountPrice: { fontSize: 12, fontWeight: "700", color: colors.brand.gold },

  priceTable: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: 16,
  },
  priceTableTitle: {
    fontSize: 13, fontWeight: "800", color: colors.text.primary,
    padding: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
    backgroundColor: colors.bg.elevated,
  },
  priceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10,
  },
  priceRowAlt: { backgroundColor: colors.bg.secondary + "88" },
  priceRowLabel: { fontSize: 13, color: colors.text.secondary, fontWeight: "600" },
  priceRowPrice: { fontSize: 13, color: colors.brand.gold, fontWeight: "700" },

  infoBox: {
    backgroundColor: colors.brand.goldLight,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.brand.gold + "55",
  },
  infoTitle: { fontSize: 13, fontWeight: "700", color: colors.brand.goldDark, marginBottom: 8 },
  infoText: { fontSize: 12, color: colors.brand.goldDark, lineHeight: 20 },

  bottomBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.card,
    borderTopWidth: 1, borderTopColor: colors.border.default,
    padding: 16, paddingBottom: 28,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 12,
  },
  bottomInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bottomCardName: { fontSize: 13, color: colors.text.secondary, fontWeight: "600" },
  bottomPrice: { fontSize: 16, fontWeight: "900", color: colors.text.primary },
  addBtn: {
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  addBtnSuccess: { backgroundColor: "#25D366" },
  addBtnText: { fontSize: 15, fontWeight: "800", color: "#0A0A0A" },
});
