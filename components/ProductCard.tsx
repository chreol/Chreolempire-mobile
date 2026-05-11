import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import type { Product } from "@/constants/products";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${product.id}`);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay: index * 80 }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.88}
        style={styles.card}
      >
        {/* Color accent top bar */}
        <View style={[styles.accentBar, { backgroundColor: product.color }]} />

        {/* Card content */}
        <View style={styles.content}>
          {/* Icon + badges row */}
          <View style={styles.topRow}>
            <View style={[styles.iconContainer, { backgroundColor: product.color + "22" }]}>
              <Text style={styles.emoji}>{product.emoji}</Text>
            </View>
            <View style={styles.badges}>
              {product.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>⚡ Populaire</Text>
                </View>
              )}
              {product.inStock ? (
                <View style={styles.stockBadge}>
                  <View style={styles.stockDot} />
                  <Text style={styles.stockText}>En stock</Text>
                </View>
              ) : (
                <View style={[styles.stockBadge, { backgroundColor: "#EF444422" }]}>
                  <View style={[styles.stockDot, { backgroundColor: "#EF4444" }]} />
                  <Text style={[styles.stockText, { color: "#EF4444" }]}>Indisponible</Text>
                </View>
              )}
            </View>
          </View>

          {/* Product name */}
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>

          {/* Starting price */}
          <Text style={styles.priceFrom}>
            À partir de{" "}
            <Text style={styles.price}>
              {product.amounts[0].value.toLocaleString()} {product.amounts[0].currency}
            </Text>
          </Text>

          {/* Footer: delivery + CTA */}
          <View style={styles.footer}>
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryText}>⚡ {product.deliveryTime}</Text>
            </View>
            <View style={[styles.buyButton, { backgroundColor: product.color }]}>
              <Text style={styles.buyButtonText}>Acheter</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: "hidden",
    flex: 1,
  },
  accentBar: { height: 3 },
  content: { padding: 14, gap: 10 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 26 },
  badges: { alignItems: "flex-end", gap: 5 },
  popularBadge: {
    backgroundColor: colors.brand.gold + "22",
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.brand.gold + "44",
  },
  popularBadgeText: { color: colors.brand.gold, fontSize: 10, fontWeight: "700" },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B98122",
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  stockDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent.green },
  stockText: { color: colors.accent.green, fontSize: 10, fontWeight: "600" },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  priceFrom: { fontSize: 12, color: colors.text.secondary },
  price: { color: colors.brand.gold, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  deliveryBadge: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  deliveryText: { color: colors.text.secondary, fontSize: 11 },
  buyButton: {
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  buyButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
