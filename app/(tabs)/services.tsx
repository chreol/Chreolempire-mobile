import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { SERVICES } from "@/constants/services";

const ALL_SERVICES = [
  ...SERVICES,
  {
    id: "paypal",
    title: "PAYPAL EUROPE",
    subtitle: "Achat & Vente de solde",
    description: "Recharge rapide via Mobile Money",
    image: "https://chreolempirev1.vercel.app/img/paypal_hero.png",
    route: "/services/paypal",
  },
];

export default function ServicesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nos Services</Text>
        <Text style={styles.headerSub}>Tous vos services digitaux en un seul endroit</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {ALL_SERVICES.map((service, i) => (
          <MotiView
            key={service.id}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: i * 80 }}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(service.route as any)}
              activeOpacity={0.88}
            >
              <Image source={{ uri: service.image }} style={styles.cardImage} contentFit="cover" />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardSubtitle}>{service.subtitle}</Text>
                <Text style={styles.cardDesc}>{service.description}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </MotiView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.secondary },
  header: {
    backgroundColor: colors.bg.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: colors.text.primary },
  headerSub: { fontSize: 13, color: colors.text.secondary, marginTop: 3 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: { width: 60, height: 60, borderRadius: radius.md },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 12, fontWeight: "800", color: colors.text.primary, textTransform: "uppercase" },
  cardSubtitle: { fontSize: 11, fontWeight: "700", color: colors.brand.gold, marginTop: 2, textTransform: "uppercase" },
  cardDesc: { fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  arrow: { fontSize: 22, color: colors.brand.gold, fontWeight: "700" },
});
