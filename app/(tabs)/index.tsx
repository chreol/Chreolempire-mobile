import { useState, useMemo } from "react";
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, FlatList, Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import { PRODUCTS, CATEGORIES } from "@/constants/products";
import { colors, radius } from "@/constants/theme";

const { width } = Dimensions.get("window");

const HERO_BANNERS = [
  {
    id: "1",
    title: "Robux en Promo 🎮",
    subtitle: "400 Robux à 2400 FCFA aujourd'hui seulement",
    bg: ["#10B981", "#065F46"],
    emoji: "🟢",
  },
  {
    id: "2",
    title: "PSN 20€ Disponible ⚡",
    subtitle: "Livraison en moins de 5 minutes",
    bg: ["#2563EB", "#1E3A8A"],
    emoji: "🎮",
  },
  {
    id: "3",
    title: "Netflix 4K Premium 🎬",
    subtitle: "Accès immédiat, qualité garantie",
    bg: ["#E50914", "#7F1D1D"],
    emoji: "🎬",
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBanner, setActiveBanner] = useState(0);
  const router = useRouter();

  const firstName = user?.displayName?.split(" ")[0] ?? "vous";

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const popular = PRODUCTS.filter((p) => p.popular);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Que voulez-vous acheter aujourd&apos;hui ?</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push("/(tabs)/profile")}>
            <Text style={styles.avatarText}>
              {(user?.displayName ?? "U")[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sticky search bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Rechercher un produit..."
              placeholderTextColor={colors.text.muted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Banner Carousel */}
        {search.length === 0 && (
          <View style={styles.heroSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / (width - 48)));
              }}
              style={styles.heroBannerList}
            >
              {HERO_BANNERS.map((banner, i) => (
                <MotiView
                  key={banner.id}
                  from={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 100 }}
                  style={[styles.heroBanner, { width: width - 48 }]}
                >
                  <View style={[styles.heroBannerBg, { backgroundColor: banner.bg[0] }]} />
                  <View style={[styles.heroBannerAccent, { backgroundColor: banner.bg[1] }]} />
                  <View style={styles.heroBannerContent}>
                    <Text style={styles.heroBannerEmoji}>{banner.emoji}</Text>
                    <View style={styles.heroBannerText}>
                      <Text style={styles.heroBannerTitle}>{banner.title}</Text>
                      <Text style={styles.heroBannerSub}>{banner.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.heroBannerAction}>
                    <Text style={styles.heroBannerActionText}>Voir →</Text>
                  </View>
                </MotiView>
              ))}
            </ScrollView>

            {/* Dots */}
            <View style={styles.bannerDots}>
              {HERO_BANNERS.map((_, i) => (
                <MotiView
                  key={i}
                  animate={{ width: i === activeBanner ? 20 : 6, opacity: i === activeBanner ? 1 : 0.4 }}
                  transition={{ type: "timing", duration: 200 }}
                  style={styles.bannerDot}
                />
              ))}
            </View>
          </View>
        )}

        {/* Category pills */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  activeCategory === cat.id && styles.categoryPillActive,
                ]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: activeCategory === cat.id ? "#fff" : colors.text.secondary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular section */}
        {search.length === 0 && activeCategory === "all" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Populaires</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularList}>
              {popular.map((product, i) => (
                <View key={product.id} style={styles.popularCardWrapper}>
                  <ProductCard product={product} index={i} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Full catalog */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {search.length > 0
              ? `${filtered.length} résultat${filtered.length > 1 ? "s" : ""} pour "${search}"`
              : "📦 Tout le catalogue"}
          </Text>

          {filtered.length === 0 ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.emptyState}
            >
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
              <Text style={styles.emptySubText}>Essayez un autre terme ou catégorie</Text>
            </MotiView>
          ) : (
            <View style={styles.catalogGrid}>
              {filtered.map((product, i) => (
                <View key={product.id} style={styles.catalogCell}>
                  <ProductCard product={product} index={i} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  greeting: { fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.4 },
  subGreeting: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brand.blue,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  searchWrapper: {
    backgroundColor: colors.bg.primary,
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  searchBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    paddingHorizontal: 14, height: 44,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: colors.text.primary, fontSize: 15 },
  clearSearch: { color: colors.text.muted, fontSize: 16, paddingHorizontal: 4 },
  heroSection: { paddingTop: 16, paddingHorizontal: 24 },
  heroBannerList: { marginBottom: 10 },
  heroBanner: {
    borderRadius: radius["2xl"],
    overflow: "hidden",
    height: 130,
    marginRight: 12,
    justifyContent: "space-between",
    padding: 18,
  },
  heroBannerBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  heroBannerAccent: {
    position: "absolute", right: -30, top: -30,
    width: 140, height: 140,
    borderRadius: 70,
    opacity: 0.5,
  },
  heroBannerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroBannerEmoji: { fontSize: 36 },
  heroBannerText: { flex: 1 },
  heroBannerTitle: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: -0.3 },
  heroBannerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3 },
  heroBannerAction: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radius.full,
  },
  heroBannerActionText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  bannerDots: { flexDirection: "row", gap: 5, justifyContent: "center", marginBottom: 8 },
  bannerDot: { height: 6, borderRadius: 3, backgroundColor: colors.brand.blue },
  categoriesSection: { paddingVertical: 8 },
  categoriesList: { paddingHorizontal: 20, gap: 8 },
  categoryPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.bg.card,
    borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border.default,
  },
  categoryPillActive: {
    backgroundColor: colors.brand.blue,
    borderColor: colors.brand.blue,
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: 13, fontWeight: "600" },
  section: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: colors.text.primary,
    marginBottom: 12, letterSpacing: -0.2,
  },
  popularList: { gap: 12 },
  popularCardWrapper: { width: 180 },
  catalogGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  catalogCell: { width: "47%" },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  emptySubText: { fontSize: 13, color: colors.text.secondary, marginTop: 6 },
});
