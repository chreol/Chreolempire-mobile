import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "true";

const menuItems = [
  { id: "support", emoji: "💬", label: "Support WhatsApp", subtitle: "Répond en moins de 5 min", color: "#25D366", action: "whatsapp" },
  { id: "telegram", emoji: "✈️", label: "Telegram Bot", subtitle: "Commandes automatisées", color: "#0088CC", action: "telegram" },
  { id: "terms", emoji: "📄", label: "Conditions d'utilisation", subtitle: "CGU et politique de confidentialité", color: colors.text.muted, action: null },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const { orders } = useOrders(user?.uid);
  const router = useRouter();

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const totalSpent = orders
    .filter((o) => o.status !== "failed")
    .reduce((acc, o) => acc + o.amount_fcfa, 0);

  const handleSignOut = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion", style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (!DEMO_MODE) {
            const { signOut } = await import("firebase/auth");
            const { auth } = await import("@/lib/firebase");
            await signOut(auth);
          }
          router.replace("/auth");
        },
      },
    ]);
  };

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

      {/* User card */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.userCard}
      >
        <View style={styles.avatarSection}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>
                {(user?.displayName ?? "U")[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.userName}>{user?.displayName ?? "Utilisateur"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Google vérifié</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{deliveredCount}</Text>
            <Text style={styles.statLabel}>Livrées</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.brand.gold }]}>
              {totalSpent.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>FCFA dépensés</Text>
          </View>
        </View>
      </MotiView>

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

      {/* Sign out */}
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton} activeOpacity={0.8}>
        <Text style={styles.signOutText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>

      {/* App version */}
      <Text style={styles.version}>Chreol Empire v1.0.0 · 🇨🇲</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.4 },
  userCard: {
    marginHorizontal: 16,
    backgroundColor: colors.bg.card,
    borderRadius: radius["2xl"],
    padding: 20,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 20,
  },
  avatarSection: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.brand.gold,
    alignItems: "center", justifyContent: "center",
  },
  avatarLetter: { fontSize: 26, fontWeight: "800", color: "#fff" },
  userName: { fontSize: 18, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.3 },
  userEmail: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  verifiedBadge: {
    marginTop: 6,
    backgroundColor: colors.accent.green + "22",
    borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: "flex-start",
  },
  verifiedText: { color: colors.accent.green, fontSize: 11, fontWeight: "700" },
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
  signOutButton: {
    margin: 16, marginTop: 4,
    backgroundColor: "#EF444422",
    borderRadius: radius.xl, padding: 16,
    alignItems: "center",
    borderWidth: 1, borderColor: "#EF444433",
  },
  signOutText: { color: "#EF4444", fontSize: 15, fontWeight: "700" },
  version: { textAlign: "center", color: colors.text.muted, fontSize: 12, paddingBottom: 20 },
});
