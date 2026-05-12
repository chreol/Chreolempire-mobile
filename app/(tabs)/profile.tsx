import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";
import LoyaltyCard from "@/components/LoyaltyCard";
import { useHistory } from "@/contexts/HistoryContext";

const menuItems = [
  { id: "support", emoji: "💬", label: "Support WhatsApp", subtitle: "Répond en moins de 5 min", color: "#25D366", action: "whatsapp" },
  { id: "telegram", emoji: "✈️", label: "Telegram Bot", subtitle: "Commandes automatisées", color: "#0088CC", action: "telegram" },
  { id: "terms", emoji: "📄", label: "Conditions d'utilisation", subtitle: "CGU et politique de confidentialité", color: colors.text.muted, action: null },
];

export default function ProfileScreen() {
  const { history } = useHistory();

  const totalSpent = history
    .filter(e => e.type === "achat")
    .reduce((acc, e) => acc + e.total, 0);
  const sellCount = history.filter(e => e.type !== "achat").length;

  const handleMenuPress = (action: string | null) => {
    if (action === "whatsapp") Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`);
    else if (action === "telegram") Linking.openURL(CONTACT.telegram);
    else Haptics.selectionAsync();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Brand card */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.brandCard}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandAvatar}>
              <Text style={styles.brandAvatarText}>👑</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Chreol Empire</Text>
              <Text style={styles.brandSub}>Le Premium des Services Digitaux 🇨🇲</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Service vérifié</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{history.length}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{sellCount}</Text>
              <Text style={styles.statLabel}>Échanges</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.brand.gold }]}>
                {totalSpent > 0 ? (totalSpent / 1000).toFixed(0) + "k" : "0"}
              </Text>
              <Text style={styles.statLabel}>FCFA dépensés</Text>
            </View>
          </View>
        </MotiView>

        {/* Loyalty Card */}
        <View style={styles.loyaltyWrap}>
          <LoyaltyCard />
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, i) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateX: -16 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 150 + i * 80, type: "timing", duration: 350 }}
            >
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.8}
                onPress={() => handleMenuPress(item.action)}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        <Text style={styles.version}>Chreol Empire v1.0.0 · 🇨🇲 Douala</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.4 },
  brandCard: {
    marginHorizontal: 16,
    backgroundColor: colors.bg.card,
    borderRadius: radius["2xl"],
    padding: 20,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 20,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  brandAvatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.brand.gold,
    alignItems: "center", justifyContent: "center",
  },
  brandAvatarText: { fontSize: 28 },
  brandName: { fontSize: 18, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.3 },
  brandSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  badge: {
    marginTop: 6,
    backgroundColor: colors.accent.green + "22",
    borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeText: { color: colors.accent.green, fontSize: 11, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl, padding: 16,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.text.primary },
  statLabel: { fontSize: 11, color: colors.text.muted, marginTop: 3 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border.default },
  loyaltyWrap: { marginHorizontal: 16, marginTop: 16 },
  menuSection: { padding: 16, gap: 8 },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl, padding: 16,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 12,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  menuEmoji: { fontSize: 20 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: colors.text.primary },
  menuSubtitle: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  menuArrow: { fontSize: 20, color: colors.text.muted },
  version: { textAlign: "center", color: colors.text.muted, fontSize: 12, paddingBottom: 20, marginTop: 8 },
});
