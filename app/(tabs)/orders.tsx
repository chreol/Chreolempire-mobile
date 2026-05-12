import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useHistory, HistoryEntry, OrderType } from "@/contexts/HistoryContext";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

const TYPE_CONFIG: Record<OrderType, { label: string; color: string; emoji: string }> = {
  achat:        { label: "Achat",          color: colors.brand.gold,  emoji: "🛒" },
  coupon:       { label: "Échange coupon", color: "#60A5FA",           emoji: "🎟️" },
  "crypto-sell":{ label: "Vente crypto",  color: "#26A17B",           emoji: "₿"  },
  "paypal-sell":{ label: "Vente PayPal",  color: "#003087",           emoji: "💶" },
  mixte:        { label: "Demande mixte", color: "#F97316",           emoji: "📦" },
};

function HistoryCard({ entry, index }: { entry: HistoryEntry; index: number }) {
  const cfg = TYPE_CONFIG[entry.type];
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const isSell = entry.type === "coupon" || entry.type === "crypto-sell" || entry.type === "paypal-sell";

  const handleRelancer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const typeLabel = cfg.label;
    const msg = `Bonjour Chreol Empire 👋,\n\nJe souhaite relancer ma commande du ${dateStr} :\n\n📋 *Type :* ${typeLabel}\n📝 *Détails :* ${entry.summary}\n💰 *Montant :* ${entry.total.toLocaleString("fr-FR")} FCFA${entry.paymentMethod ? `\n💳 *Paiement :* ${entry.paymentMethod}` : ""}\n\nMerci de confirmer le statut.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 320, delay: index * 60 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeTag, { backgroundColor: cfg.color + "22", borderColor: cfg.color + "55" }]}>
          <Text style={[styles.typeTagText, { color: cfg.color }]}>{cfg.emoji} {cfg.label}</Text>
        </View>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>

      <Text style={styles.summary} numberOfLines={2}>{entry.summary}</Text>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.totalLabel}>{isSell ? "À recevoir" : "Total payé"}</Text>
          <Text style={[styles.totalValue, { color: isSell ? "#25D366" : colors.brand.gold }]}>
            {entry.total.toLocaleString("fr-FR")} FCFA
          </Text>
        </View>
        <View style={styles.statusBubble}>
          <Text style={styles.statusText}>⏳ Envoyé sur WhatsApp</Text>
        </View>
      </View>

      {entry.paymentMethod && (
        <Text style={styles.payMethod}>💳 {entry.paymentMethod}</Text>
      )}

      {/* Relancer */}
      <TouchableOpacity style={styles.relancerBtn} onPress={handleRelancer} activeOpacity={0.8}>
        <Text style={styles.relancerText}>🔁 Relancer la commande</Text>
      </TouchableOpacity>
    </MotiView>
  );
}

export default function OrdersScreen() {
  const { history, clearHistory } = useHistory();

  const confirmClear = () => Alert.alert(
    "Vider l'historique",
    "Êtes-vous sûr(e) de vouloir effacer tout votre historique ?",
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "Tout effacer", style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          clearHistory();
        },
      },
    ]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={confirmClear} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.emptyState}
        >
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>Aucun historique</Text>
          <Text style={styles.emptySub}>
            {"Vos commandes et demandes d'échange apparaîtront ici après chaque envoi sur WhatsApp."}
          </Text>
        </MotiView>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <HistoryCard entry={item} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.4 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  clearBtnText: { fontSize: 13, color: "#E50914", fontWeight: "700" },

  list: { padding: 16, gap: 12, paddingBottom: 40 },

  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    padding: 16, gap: 10,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeTag: {
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  typeTagText: { fontSize: 11, fontWeight: "800" },
  dateText: { fontSize: 11, color: colors.text.muted },
  summary: { fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  totalLabel: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  totalValue: { fontSize: 18, fontWeight: "900" },
  statusBubble: {
    backgroundColor: "#F9731622", borderRadius: radius.full,
    borderWidth: 1, borderColor: "#F9731644",
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700", color: "#F97316" },
  payMethod: { fontSize: 11, color: colors.text.muted, marginTop: -4 },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.text.secondary, textAlign: "center", lineHeight: 21 },

  relancerBtn: {
    borderRadius: radius.full, borderWidth: 1,
    borderColor: "#25D36655", backgroundColor: "#25D36618",
    paddingVertical: 10, alignItems: "center", marginTop: 2,
  },
  relancerText: { fontSize: 13, fontWeight: "800", color: "#25D366" },
});
