import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import { usePromotions, Promo } from "@/hooks/usePromotions";
import { colors, radius } from "@/constants/theme";

const { width: SW } = Dimensions.get("window");
const CARD_W = SW - 32;
const AUTO_SCROLL_MS = 3500;

function PromoCard({ promo }: { promo: Promo }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: promo.color + "18", borderColor: promo.color + "55" }]}
      activeOpacity={0.85}
      onPress={() => router.push("/services/cartes-cadeaux")}
    >
      <View style={styles.cardLeft}>
        {promo.badge && (
          <View style={[styles.badge, { backgroundColor: promo.color + "33" }]}>
            <Text style={[styles.badgeText, { color: promo.color }]}>{promo.badge}</Text>
          </View>
        )}
        <Text style={styles.title}>{promo.emoji}  {promo.title}</Text>
        <Text style={styles.sub}>{promo.subtitle}</Text>
      </View>
      <View style={[styles.ctaDot, { backgroundColor: promo.color }]}>
        <Text style={styles.ctaArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PromoBanner() {
  const { promos } = usePromotions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % promos.length;
        scrollRef.current?.scrollTo({ x: next * CARD_W, animated: true });
        return next;
      });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(t);
  }, [promos.length]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>🔥 Offres & Taux en cours</Text>
        <View style={styles.dots}>
          {promos.map((_, i) => (
            <MotiView
              key={i}
              animate={{ width: i === index ? 16 : 6, backgroundColor: i === index ? colors.brand.gold : colors.border.strong }}
              transition={{ type: "timing", duration: 200 }}
              style={styles.dot}
            />
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 0 }}
        style={{ width: CARD_W }}
      >
        {promos.map(p => (
          <View key={p.id} style={{ width: CARD_W }}>
            <PromoCard promo={p} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: "800", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  dots: { flexDirection: "row", gap: 4, alignItems: "center" },
  dot: { height: 6, borderRadius: 3 },

  card: {
    borderRadius: radius.xl, borderWidth: 1.5,
    padding: 14, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    minHeight: 72,
  },
  cardLeft: { flex: 1, gap: 4 },
  badge: {
    alignSelf: "flex-start", borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2, marginBottom: 2,
  },
  badgeText: { fontSize: 10, fontWeight: "800" },
  title: { fontSize: 15, fontWeight: "900", color: colors.text.primary },
  sub: { fontSize: 11, color: colors.text.secondary, lineHeight: 16 },
  ctaDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", marginLeft: 12,
  },
  ctaArrow: { fontSize: 20, color: "#fff", fontWeight: "700", marginTop: -2 },
});
