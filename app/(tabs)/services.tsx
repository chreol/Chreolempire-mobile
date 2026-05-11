import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";

const { width } = Dimensions.get("window");

const IMG_PSN    = require("../../assets/PlayStation_Store_Card.png");
const IMG_ITU    = require("../../assets/itunes-gifts-for-business-hero_2x.jpg");
const IMG_ROB    = require("../../assets/App-icon-roblox.webp");
const IMG_CRYPTO = require("../../assets/Monnaie Crypto Chreol Empire en cfa mobile money.png");
const IMG_UBA    = require("../../assets/UBA Cameroun logo.png");
const IMG_TRANS  = require("../../assets/contenu-pack-transcash.jpg");

const HERO_TILES = [
  { img: IMG_PSN, label: "PSN" },
  { img: IMG_ITU, label: "iTunes" },
  { img: IMG_ROB, label: "Roblox" },
  { img: IMG_CRYPTO, label: "Crypto" },
];

const CATEGORIES = [
  {
    id: "cartes-cadeaux",
    title: "Cartes Cadeaux",
    sub: "PSN · iTunes · Roblox · Steam",
    icon: "🎮",
    color: "#003791",
    img: IMG_PSN,
    route: "/services/cartes-cadeaux",
  },
  {
    id: "uba",
    title: "UBA Cameroun",
    sub: "Achat de carte & recharge",
    icon: "🏦",
    color: "#C9A84C",
    img: IMG_UBA,
    route: "/services/uba",
  },
  {
    id: "coupons",
    title: "Échange Coupons",
    sub: "Transcash · PCS Mastercard",
    icon: "🎟",
    color: "#1B5E20",
    img: IMG_TRANS,
    route: "/services/coupons",
  },
  {
    id: "crypto",
    title: "Crypto & PayPal",
    sub: "USDT · BTC · TRX · PayPal",
    icon: "₿",
    color: "#26A17B",
    img: IMG_CRYPTO,
    route: "/services/crypto",
  },
];

export default function ServicesScreen() {
  const router = useRouter();
  const { count } = useCart();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.hero}
        >
          {/* Left panel */}
          <View style={styles.heroLeft}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🇨🇲 Douala, Cameroun</Text>
            </View>
            <Text style={styles.heroTitle}>Services{"\n"}Digitaux</Text>
            <Text style={styles.heroSub}>Livraison express{"\n"}15–30 min</Text>
            <TouchableOpacity
              style={styles.heroCta}
              onPress={() => router.push("/services/cartes-cadeaux")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroCtaText}>Commander →</Text>
            </TouchableOpacity>
          </View>

          {/* Right: 2×2 tiles */}
          <View style={styles.heroGrid}>
            {HERO_TILES.map((tile, i) => (
              <View key={i} style={styles.heroTile}>
                <Image source={tile.img} style={styles.heroTileImg} contentFit="cover" />
                <View style={styles.heroTileOverlay} />
                <Text style={styles.heroTileLabel}>{tile.label}</Text>
              </View>
            ))}
          </View>
        </MotiView>

        {/* Highlight strip */}
        <View style={styles.strip}>
          {["✅ 100% Sécurisé", "⚡ Express 30 min", "💳 Mobile Money"].map((item, i) => (
            <View key={i} style={styles.stripChip}>
              <Text style={styles.stripText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Nos Services</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat, i) => (
            <MotiView
              key={cat.id}
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: i * 80, damping: 16 }}
            >
              <TouchableOpacity
                style={styles.catCard}
                onPress={() => router.push(cat.route as any)}
                activeOpacity={0.88}
              >
                <View style={[styles.catImgWrap, { borderColor: cat.color + "55" }]}>
                  <Image source={cat.img} style={styles.catImg} contentFit="cover" />
                  <View style={[styles.catImgOverlay, { backgroundColor: cat.color + "33" }]} />
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                </View>
                <View style={styles.catBody}>
                  <Text style={styles.catTitle}>{cat.title}</Text>
                  <Text style={styles.catSub}>{cat.sub}</Text>
                </View>
                <Text style={styles.catArrow}>›</Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Cart FAB */}
      {count > 0 && (
        <TouchableOpacity
          style={styles.cartFab}
          onPress={() => router.push("/cart")}
          activeOpacity={0.88}
        >
          <Text style={styles.cartFabIcon}>🛒</Text>
          <View style={styles.cartFabCount}>
            <Text style={styles.cartFabCountText}>{count}</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const TILE_SIZE = (width - 48 - 8) / 2 / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  // Hero
  hero: {
    margin: 16,
    borderRadius: radius["2xl"],
    backgroundColor: colors.bg.card,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.strong,
    minHeight: 200,
  },
  heroLeft: {
    flex: 1,
    padding: 18,
    gap: 10,
    justifyContent: "center",
  },
  heroBadge: {
    backgroundColor: colors.brand.goldLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.brand.gold + "44",
  },
  heroBadgeText: { fontSize: 10, color: colors.brand.goldDark, fontWeight: "700" },
  heroTitle: { fontSize: 22, fontWeight: "900", color: colors.text.primary, lineHeight: 26 },
  heroSub: { fontSize: 12, color: colors.text.secondary, lineHeight: 18 },
  heroCta: {
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignSelf: "flex-start",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  heroCtaText: { fontSize: 13, fontWeight: "800", color: "#0A0A0A" },

  heroGrid: {
    width: (width - 32) * 0.42,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    gap: 6,
    alignContent: "center",
  },
  heroTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.md,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  heroTileImg: { ...StyleSheet.absoluteFillObject },
  heroTileOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  heroTileLabel: { fontSize: 9, fontWeight: "800", color: "#fff", paddingBottom: 4, zIndex: 1 },

  // Strip
  strip: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  stripChip: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  stripText: { fontSize: 11, color: colors.text.secondary, fontWeight: "600" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  // Category cards
  catGrid: { paddingHorizontal: 16, gap: 10 },
  catCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  catImgWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  catImg: { ...StyleSheet.absoluteFillObject },
  catImgOverlay: { ...StyleSheet.absoluteFillObject },
  catIcon: { fontSize: 22, zIndex: 1 },
  catBody: { flex: 1 },
  catTitle: { fontSize: 15, fontWeight: "800", color: colors.text.primary },
  catSub: { fontSize: 12, color: colors.text.secondary, marginTop: 3 },
  catArrow: { fontSize: 22, color: colors.brand.gold, fontWeight: "700" },

  // Cart FAB
  cartFab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  cartFabIcon: { fontSize: 22 },
  cartFabCount: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#E50914",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartFabCountText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});
