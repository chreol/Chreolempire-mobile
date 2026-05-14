import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";

const { width } = Dimensions.get("window");
const TILE_W = (width - 32 - 8) / 2;

const IMG_PSN      = require("../../assets/PlayStation_Store_Card.webp");
const IMG_ITU      = require("../../assets/itunes-gifts-for-business-hero_2x.webp");
const IMG_ROB      = require("../../assets/App-icon-roblox.webp");
const IMG_STEAM    = require("../../assets/Steam_Gift_Cards.webp");
const IMG_CRYPTO   = require("../../assets/Cryptomonnaies-visuel.webp");
const IMG_UBA      = require("../../assets/UBA Cameroun logo.png");
const IMG_TRANS    = require("../../assets/contenu-pack-transcash.webp");
const IMG_PAYPAL   = require("../../assets/Paypal.webp");
const IMG_FACTURES = require("../../assets/paiement-+-facture-services.webp");

const PRODUCT_TILES = [
  { img: IMG_ROB,    label: "Roblox",      route: "/services/cartes-cadeaux" },
  { img: IMG_PSN,    label: "PSN",         route: "/services/cartes-cadeaux" },
  { img: IMG_ITU,    label: "iTunes",      route: "/services/cartes-cadeaux" },
  { img: IMG_STEAM,  label: "Steam",       route: "/services/cartes-cadeaux" },
];

const OTHER_SERVICES = [
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
    title: "Crypto & Échange MoMo",
    sub: "USDT · BTC · TRX · 0% commission",
    icon: "₿",
    color: "#26A17B",
    img: IMG_CRYPTO,
    route: "/services/crypto",
  },
  {
    id: "paypal",
    title: "PayPal Europe",
    sub: "Achat & vente de solde PayPal",
    icon: "🔵",
    color: "#003087",
    img: IMG_PAYPAL,
    route: "/services/paypal",
  },
  {
    id: "factures",
    title: "Paiement Factures",
    sub: "Canal+ · Eneo · Camwater · StarTimes",
    icon: "🧾",
    color: "#FF6B00",
    img: IMG_FACTURES,
    route: "/services/factures",
  },
];

export default function ServicesScreen() {
  const router = useRouter();
  const { count } = useCart();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.hero}
        >
          {/* Warm accent glow */}
          <View style={styles.heroGlow} />

          {/* Top row: badge + card image */}
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeIcon}>🛡️</Text>
              <Text style={styles.heroBadgeText}>Magasin officiel</Text>
            </View>
            <Image source={IMG_ROB} style={styles.heroCardImg} contentFit="cover" />
          </View>

          {/* Title */}
          <Text style={styles.heroTitle}>
            Achetez vos cartes cadeaux{"\n"}en toute sécurité au Cameroun
          </Text>

          {/* Bullets */}
          <View style={styles.heroBullets}>
            {[
              "Livraison express 15–30 min",
              "Codes authentiques garantis",
              "Support WhatsApp 7j/7",
            ].map((b, i) => (
              <View key={i} style={styles.heroBullet}>
                <Text style={styles.heroBulletCheck}>✅</Text>
                <Text style={styles.heroBulletText}>{b}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.heroCta}
            onPress={() => router.push("/services/cartes-cadeaux")}
            activeOpacity={0.85}
          >
            <Text style={styles.heroCtaText}>Voir le catalogue  →</Text>
          </TouchableOpacity>
        </MotiView>

        {/* ── PRODUCT TILES 2×2 ── */}
        <Text style={styles.sectionTitle}>Cartes Cadeaux</Text>
        <View style={styles.tileGrid}>
          {PRODUCT_TILES.map((tile, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: i * 60, damping: 18 }}
            >
              <TouchableOpacity
                style={styles.tile}
                onPress={() => router.push(tile.route as any)}
                activeOpacity={0.88}
              >
                <Image source={tile.img} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                <View style={styles.tileOverlay} />
                <View style={styles.tileBottom}>
                  <Text style={styles.tileLabel}>{tile.label}</Text>
                  <Text style={styles.tileArrow}>›</Text>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* ── OTHER SERVICES ── */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Autres Services</Text>
        <View style={styles.serviceList}>
          {OTHER_SERVICES.map((s, i) => (
            <MotiView
              key={s.id}
              from={{ opacity: 0, translateX: -16 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", delay: i * 80, duration: 350 }}
            >
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => router.push(s.route as any)}
                activeOpacity={0.88}
              >
                <View style={[styles.serviceImgWrap, { borderColor: s.color + "55" }]}>
                  <Image source={s.img} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                  <View style={[styles.serviceImgOverlay, { backgroundColor: s.color + "33" }]} />
                  <Text style={styles.serviceIcon}>{s.icon}</Text>
                </View>
                <View style={styles.serviceBody}>
                  <Text style={styles.serviceTitle}>{s.title}</Text>
                  <Text style={styles.serviceSub}>{s.sub}</Text>
                </View>
                <Text style={styles.serviceArrow}>›</Text>
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
          <View style={styles.cartFabBadge}>
            <Text style={styles.cartFabBadgeText}>{count}</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  // Hero
  hero: {
    margin: 16,
    borderRadius: radius["2xl"],
    backgroundColor: colors.bg.card,
    padding: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.strong,
    gap: 14,
  },
  heroGlow: {
    position: "absolute",
    top: -60, right: -60,
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: colors.brand.gold,
    opacity: 0.08,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeIcon: { fontSize: 13 },
  heroBadgeText: { fontSize: 12, fontWeight: "800", color: "#0A0A0A" },
  heroCardImg: {
    width: 90,
    height: 65,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text.primary,
    lineHeight: 27,
  },
  heroBullets: { gap: 6 },
  heroBullet: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroBulletCheck: { fontSize: 13 },
  heroBulletText: { fontSize: 13, color: colors.text.secondary, flex: 1 },
  heroCta: {
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  heroCtaText: { fontSize: 14, fontWeight: "800", color: "#0A0A0A" },

  // Section title
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text.primary,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // Product tiles 2×2
  tileGrid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tile: {
    width: TILE_W,
    height: 130,
    borderRadius: radius.xl,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  tileBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  tileLabel: { fontSize: 14, fontWeight: "800", color: "#fff" },
  tileArrow: { fontSize: 20, color: "#fff", fontWeight: "700" },

  // Other services list
  serviceList: { paddingHorizontal: 16, gap: 10 },
  serviceCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  serviceImgWrap: {
    width: 60, height: 60,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceImgOverlay: { ...StyleSheet.absoluteFillObject },
  serviceIcon: { fontSize: 22, zIndex: 1 },
  serviceBody: { flex: 1 },
  serviceTitle: { fontSize: 15, fontWeight: "800", color: colors.text.primary },
  serviceSub: { fontSize: 12, color: colors.text.secondary, marginTop: 3 },
  serviceArrow: { fontSize: 22, color: colors.brand.gold, fontWeight: "700" },

  // Cart FAB
  cartFab: {
    position: "absolute",
    bottom: 20, right: 20,
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    width: 56, height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  cartFabIcon: { fontSize: 24 },
  cartFabBadge: {
    position: "absolute",
    top: 6, right: 6,
    backgroundColor: "#E50914",
    borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartFabBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});
