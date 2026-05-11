import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

const PAYMENT_METHODS = [
  {
    id: "orange",
    name: "Orange Money",
    icon: "🟠",
    color: "#FF6B00",
    number: "+237 697 657 734",
    description: "Transfert Mobile Money Orange",
  },
  {
    id: "mtn",
    name: "MTN MoMo",
    icon: "🟡",
    color: "#FACC15",
    number: "+237 694 360 978",
    description: "Transfert Mobile Money MTN",
  },
  {
    id: "crypto",
    name: "Crypto (USDT/BTC)",
    icon: "₿",
    color: "#26A17B",
    number: "Via WhatsApp",
    description: "Paiement en cryptomonnaie",
  },
  {
    id: "paypal",
    name: "PayPal Europe",
    icon: "🔵",
    color: "#0070BA",
    number: CONTACT.paypalEmail,
    description: "Virement PayPal sécurisé",
  },
];

export default function PaiementScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paiement</Text>
        <Text style={styles.headerSub}>Modes de paiement acceptés</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Après paiement, envoyez votre capture d&apos;écran sur WhatsApp pour validation immédiate.
          </Text>
        </View>

        {PAYMENT_METHODS.map((method) => (
          <View key={method.id} style={[styles.card, { borderLeftColor: method.color, borderLeftWidth: 4 }]}>
            <Text style={styles.cardIcon}>{method.icon}</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{method.name}</Text>
              <Text style={styles.cardDesc}>{method.description}</Text>
              <Text style={[styles.cardNumber, { color: method.color }]}>{method.number}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={() => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=Bonjour%2C%20voici%20ma%20capture%20de%20paiement`)}
        >
          <Text style={styles.whatsappIcon}>💬</Text>
          <Text style={styles.whatsappText}>Envoyer la capture WhatsApp</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          📍 {CONTACT.address}
        </Text>
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
  content: { padding: 16, gap: 12 },
  infoBox: {
    backgroundColor: colors.brand.goldLight,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.brand.gold + "66",
  },
  infoText: { fontSize: 13, color: colors.brand.goldDark, lineHeight: 20 },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  cardDesc: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  cardNumber: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  whatsappButton: {
    backgroundColor: "#25D366",
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    marginTop: 8,
  },
  whatsappIcon: { fontSize: 22 },
  whatsappText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  note: { fontSize: 12, color: colors.text.muted, textAlign: "center", marginTop: 8 },
});
