import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { GIFT_CARDS } from "@/constants/services";
import { useCart } from "@/contexts/CartContext";

const LOCAL_IMAGES: Record<string, any> = {
  psn:        require("../../assets/PlayStation_Store_Card.png"),
  itunes:     require("../../assets/itunes-gifts-for-business-hero_2x.jpg"),
  roblox:     require("../../assets/App-icon-roblox.webp"),
  steam:      require("../../assets/Steam_Gift_Cards.png"),
  razer:      require("../../assets/Gift_cards-Razer_Gold.png"),
  nintendo:   require("../../assets/Gift card Nintendo.png"),
  googleplay: require("../../assets/Gift card GooglePlay.png"),
};

const TABS = [
  { key: "standard", label: "Standard" },
  { key: "itunes",   label: "iTunes / GP" },
  { key: "robux",    label: "Robux" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const REGIONS = [
  { code: "US", flag: "🇺🇸", label: "USA" },
  { code: "EU", flag: "🇫🇷", label: "Europe" },
  { code: "UK", flag: "🇬🇧", label: "UK" },
  { code: "CA", flag: "🇨🇦", label: "Canada" },
  { code: "AU", flag: "🇦🇺", label: "Australie" },
] as const;

const CUSTOM_RATE = 750; // FCFA per currency unit

export default function CartesCadeauxScreen() {
  const router = useRouter();
  const { addItem, count } = useCart();

  const [activeTab, setActiveTab] = useState<TabKey>("standard");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("EU");
  const [customValue, setCustomValue] = useState("");
  const [addedFlash, setAddedFlash] = useState(false);

  const filteredCards = GIFT_CARDS.filter(c => c.tier === activeTab);
  const card = GIFT_CARDS.find(c => c.id === selectedCard);
  const amount = card?.amounts.find(a => a.label === selectedAmount);

  const customNum = parseFloat(customValue.replace(",", "."));
  const customPrice = !isNaN(customNum) && customNum > 0 ? Math.round(customNum * CUSTOM_RATE) : null;

  const canAdd = card && (amount || customPrice);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSelectedCard(null);
    setSelectedAmount(null);
    setCustomValue("");
  };

  const handleCardSelect = (id: string) => {
    setSelectedCard(id);
    setSelectedAmount(null);
    setCustomValue("");
  };

  const handleAddToCart = async () => {
    if (!card) return;
    const finalPrice = customPrice ?? amount?.price;
    const finalLabel = customPrice
      ? `${customValue}€ (personnalisé)`
      : amount!.label;
    if (!finalPrice) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem({
      id: `${card.id}-${finalLabel}-${selectedRegion}`,
      cardId: card.id,
      cardName: `${card.name} [${selectedRegion}]`,
      amount: finalLabel,
      price: finalPrice,
    });
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 800);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Cartes Cadeaux</Text>
            <Text style={styles.headerSub}>PSN · iTunes · Roblox · Steam · Nintendo</Text>
          </View>
          {count > 0 && (
            <TouchableOpacity style={styles.cartBtn} onPress={() => router.push("/cart")}>
              <Text style={{ fontSize: 22 }}>🛒</Text>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{count}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* Tier tabs */}
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

          {/* Info banner */}
          {activeTab === "standard" && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>
                PSN · Steam · Razer Gold · Roblox (€) · Nintendo eShop — même tarif
              </Text>
            </View>
          )}

          {/* Region selector */}
          <Text style={styles.sectionLabel}>Région</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionRow}>
            {REGIONS.map(r => (
              <TouchableOpacity
                key={r.code}
                style={[styles.regionChip, selectedRegion === r.code && styles.regionChipActive]}
                onPress={() => setSelectedRegion(r.code)}
                activeOpacity={0.8}
              >
                <Text style={styles.regionFlag}>{r.flag}</Text>
                <Text style={[styles.regionLabel, selectedRegion === r.code && styles.regionLabelActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Card selector */}
          <Text style={styles.sectionLabel}>Carte</Text>
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

          {/* Amount grid + custom value */}
          {card && (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 280 }}
            >
              <Text style={styles.sectionLabel}>Montant</Text>
              <View style={styles.amountGrid}>
                {card.amounts.map(a => {
                  const isSelected = selectedAmount === a.label && !customValue;
                  return (
                    <TouchableOpacity
                      key={a.label}
                      style={[styles.amountCard, isSelected && { borderColor: card.color, backgroundColor: card.color + "18" }]}
                      onPress={() => { setSelectedAmount(a.label); setCustomValue(""); }}
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

              {/* Custom value input */}
              <View style={styles.customSection}>
                <Text style={styles.customLabel}>Ou saisissez un montant personnalisé</Text>
                <View style={[styles.customRow, customValue ? { borderColor: card.color } : {}]}>
                  <TextInput
                    style={styles.customInput}
                    value={customValue}
                    onChangeText={v => { setCustomValue(v.replace(/[^0-9.,]/g, "")); setSelectedAmount(null); }}
                    placeholder="Ex: 75"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                  <Text style={styles.customCurrency}>€</Text>
                  {customPrice !== null && (
                    <View style={[styles.customResult, { backgroundColor: card.color + "22" }]}>
                      <Text style={[styles.customResultText, { color: card.color }]}>
                        = {customPrice.toLocaleString("fr-FR")} FCFA
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.customNote}>Taux : 1€ = {CUSTOM_RATE} FCFA</Text>
              </View>

              {/* Price table */}
              <View style={styles.priceTable}>
                <Text style={styles.priceTableTitle}>Tableau des prix — {card.name}</Text>
                {card.amounts.map((a, i) => (
                  <View key={i} style={[styles.priceRow, i % 2 === 0 && styles.priceRowAlt]}>
                    <Text style={styles.priceRowLabel}>{a.label}</Text>
                    <Text style={styles.priceRowPrice}>{a.price.toLocaleString("fr-FR")} FCFA</Text>
                  </View>
                ))}
              </View>
            </MotiView>
          )}

          {/* Info box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ Livraison & Paiement</Text>
            <Text style={styles.infoText}>
              {"• Codes livrés par Email ou WhatsApp en 15–30 min\n• Paiement : Orange Money, MTN MoMo, PayPal, Espèces\n• Codes authentiques, vérifiés et garantis\n• Région sélectionnée incluse dans votre commande"}
            </Text>
          </View>

          <View style={{ height: 130 }} />
        </ScrollView>

        {/* Bottom CTA */}
        {canAdd && (
          <MotiView
            from={{ translateY: 80, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            style={styles.bottomBar}
          >
            <View style={styles.bottomInfo}>
              <Text style={styles.bottomCardName} numberOfLines={1}>
                {card!.name} [{selectedRegion}]{customPrice ? ` — ${customValue}€` : amount ? ` — ${amount.label}` : ""}
              </Text>
              <Text style={styles.bottomPrice}>
                {(customPrice ?? amount?.price ?? 0).toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, addedFlash && styles.addBtnSuccess]}
              onPress={handleAddToCart}
              activeOpacity={0.85}
            >
              <Text style={styles.addBtnText}>
                {addedFlash ? "✓ Ajouté au panier !" : "Ajouter au panier 🛒"}
              </Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
    gap: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 28, color: colors.text.primary, marginTop: -2 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },
  headerSub: { fontSize: 11, color: colors.text.secondary },
  cartBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
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
    padding: 4, gap: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: radius.lg, alignItems: "center" },
  tabActive: { backgroundColor: colors.brand.gold },
  tabText: { fontSize: 12, fontWeight: "700", color: colors.text.muted },
  tabTextActive: { color: "#0A0A0A" },

  infoBanner: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md,
    padding: 10, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border.strong,
  },
  infoBannerText: { fontSize: 12, color: colors.text.secondary, textAlign: "center" },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: colors.text.muted,
    marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5,
  },

  // Region selector
  regionRow: { gap: 8, paddingBottom: 4, marginBottom: 20 },
  regionChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
  },
  regionChipActive: { borderColor: colors.brand.gold, backgroundColor: colors.brand.goldLight },
  regionFlag: { fontSize: 16 },
  regionLabel: { fontSize: 12, fontWeight: "700", color: colors.text.muted },
  regionLabelActive: { color: colors.brand.goldDark },

  // Card selector
  cardRow: { gap: 10, paddingBottom: 4, marginBottom: 20 },
  cardChip: {
    alignItems: "center", gap: 6,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
    minWidth: 90,
  },
  cardChipImg: { width: 48, height: 36 },
  cardChipText: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textAlign: "center" },
  cardChipCheck: {
    position: "absolute", top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },

  // Amount grid
  amountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  amountCard: {
    width: "47%",
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1.5, borderColor: colors.border.default,
    alignItems: "center", gap: 4,
  },
  amountLabel: { fontSize: 15, fontWeight: "800", color: colors.text.secondary },
  amountPrice: { fontSize: 12, fontWeight: "700", color: colors.brand.gold },

  // Custom value
  customSection: { marginBottom: 20 },
  customLabel: { fontSize: 11, color: colors.text.muted, fontWeight: "600", marginBottom: 8 },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default,
    paddingHorizontal: 14,
    gap: 8,
    overflow: "hidden",
  },
  customInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    paddingVertical: 14,
  },
  customCurrency: { fontSize: 16, color: colors.text.secondary, fontWeight: "700" },
  customResult: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.md,
    marginVertical: 8,
  },
  customResultText: { fontSize: 13, fontWeight: "800" },
  customNote: { fontSize: 11, color: colors.text.muted, marginTop: 6 },

  // Price table
  priceTable: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1, borderColor: colors.border.default,
    marginBottom: 16,
  },
  priceTableTitle: {
    fontSize: 12, fontWeight: "800", color: colors.text.primary,
    padding: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
    backgroundColor: colors.bg.elevated,
  },
  priceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 9,
  },
  priceRowAlt: { backgroundColor: colors.bg.secondary + "88" },
  priceRowLabel: { fontSize: 13, color: colors.text.secondary, fontWeight: "600" },
  priceRowPrice: { fontSize: 13, color: colors.brand.gold, fontWeight: "700" },

  // Info box
  infoBox: {
    backgroundColor: colors.brand.goldLight,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1, borderColor: colors.brand.gold + "55",
  },
  infoTitle: { fontSize: 13, fontWeight: "700", color: colors.brand.goldDark, marginBottom: 8 },
  infoText: { fontSize: 12, color: colors.brand.goldDark, lineHeight: 20 },

  // Bottom CTA
  bottomBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bg.card,
    borderTopWidth: 1, borderTopColor: colors.border.default,
    padding: 16, paddingBottom: 28, gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 12,
  },
  bottomInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bottomCardName: { fontSize: 12, color: colors.text.secondary, fontWeight: "600", flex: 1, marginRight: 8 },
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
