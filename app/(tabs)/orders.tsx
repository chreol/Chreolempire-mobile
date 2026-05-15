import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Alert, Linking, Modal, ScrollView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useHistory, HistoryEntry, OrderType, OrderStatus } from "@/contexts/HistoryContext";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

const TYPE_CONFIG: Record<OrderType, { label: string; color: string; emoji: string }> = {
  achat:         { label: "Achat",          color: colors.brand.gold, emoji: "🛒" },
  coupon:        { label: "Échange coupon", color: "#60A5FA",          emoji: "🎟️" },
  "crypto-sell": { label: "Vente crypto",  color: "#26A17B",          emoji: "₿"  },
  "paypal-sell": { label: "Vente PayPal",  color: "#003087",          emoji: "💶" },
  mixte:         { label: "Demande mixte", color: "#F97316",          emoji: "📦" },
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; emoji: string }> = {
  pending:     { label: "En attente",      color: "#F97316", emoji: "⏳" },
  processing:  { label: "Prise en charge", color: "#3B82F6", emoji: "✅" },
  in_progress: { label: "En livraison",    color: "#A78BFA", emoji: "⚙️" },
  done:        { label: "Terminé",         color: "#25D366", emoji: "🎉" },
  cancelled:   { label: "Annulé",          color: "#EF4444", emoji: "❌" },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "processing", "in_progress", "done", "cancelled"];

const FILTER_TABS: { key: OrderType | "all"; label: string }[] = [
  { key: "all",         label: "🗂 Tous"         },
  { key: "achat",       label: "🛒 Achat"        },
  { key: "coupon",      label: "🎟️ Coupon"       },
  { key: "crypto-sell", label: "₿ Vente crypto"  },
  { key: "paypal-sell", label: "💶 Vente PayPal"  },
  { key: "mixte",       label: "📦 Mixte"        },
];

function StatusModal({
  entry, onClose, onSelect,
}: {
  entry: HistoryEntry | null;
  onClose: () => void;
  onSelect: (id: string, status: OrderStatus) => void;
}) {
  if (!entry) return null;
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Mettre à jour le statut</Text>
          <Text style={styles.modalSub} numberOfLines={1}>{entry.summary}</Text>
          <View style={styles.statusList}>
            {ALL_STATUSES.map(s => {
              const cfg = STATUS_CONFIG[s];
              const isActive = entry.status === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusOption, isActive && { borderColor: cfg.color, backgroundColor: cfg.color + "18" }]}
                  onPress={() => { onSelect(entry.id, s); onClose(); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.statusOptionEmoji}>{cfg.emoji}</Text>
                  <Text style={[styles.statusOptionLabel, isActive && { color: cfg.color, fontWeight: "800" }]}>
                    {cfg.label}
                  </Text>
                  {isActive && <Text style={[styles.statusCheck, { color: cfg.color }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.modalCancelText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function HistoryCard({
  entry, index, onStatusPress,
}: {
  entry: HistoryEntry;
  index: number;
  onStatusPress: (entry: HistoryEntry) => void;
}) {
  const cfg = TYPE_CONFIG[entry.type];
  const statusCfg = STATUS_CONFIG[entry.status ?? "pending"];
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const isSell = entry.type === "coupon" || entry.type === "crypto-sell" || entry.type === "paypal-sell";

  const handleRelancer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const msg = `Bonjour Chreol Empire 👋,\n\nJe souhaite relancer ma commande du ${dateStr} :\n\n📋 *Type :* ${cfg.label}\n📝 *Détails :* ${entry.summary}\n💰 *Montant :* ${entry.total.toLocaleString("fr-FR")} FCFA${entry.paymentMethod ? `\n💳 *Paiement :* ${entry.paymentMethod}` : ""}\n\nMerci de confirmer le statut.`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  const handleReorder = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg = `Bonjour Chreol Empire 👋,\n\nJe souhaite renouveler une commande similaire :\n\n📝 *Détails :* ${entry.summary}\n💰 *Montant précédent :* ${entry.total.toLocaleString("fr-FR")} FCFA${entry.paymentMethod ? `\n💳 *Mode de paiement :* ${entry.paymentMethod}` : ""}\n\nMerci de me confirmer la disponibilité et le montant actuel.`;
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
        <TouchableOpacity
          style={[styles.statusBubble, { backgroundColor: statusCfg.color + "22", borderColor: statusCfg.color + "55" }]}
          onPress={() => { Haptics.selectionAsync(); onStatusPress(entry); }}
          activeOpacity={0.75}
        >
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.emoji} {statusCfg.label}
          </Text>
          <Text style={[styles.statusEdit, { color: statusCfg.color }]}>✎</Text>
        </TouchableOpacity>
      </View>

      {entry.paymentMethod && (
        <Text style={styles.payMethod}>💳 {entry.paymentMethod}</Text>
      )}

      {entry.giftCode && (
        <TouchableOpacity
          style={styles.giftCodeBox}
          onPress={async () => {
            await Clipboard.setStringAsync(entry.giftCode!);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Copié !", `Code copié : ${entry.giftCode}`);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.giftCodeLabel}>🎁 Votre code</Text>
          <Text style={styles.giftCodeValue}>{entry.giftCode}</Text>
          <Text style={styles.giftCodeCopy}>📋 Appuyez pour copier</Text>
        </TouchableOpacity>
      )}

      {/* Commander à nouveau — uniquement sur les commandes terminées d'achat */}
      {entry.status === "done" && !isSell && (
        <TouchableOpacity style={styles.reorderBtn} onPress={handleReorder} activeOpacity={0.8}>
          <Text style={styles.reorderText}>🔄 Commander à nouveau</Text>
        </TouchableOpacity>
      )}

      {entry.status !== "done" && entry.status !== "cancelled" && (
        <TouchableOpacity style={styles.relancerBtn} onPress={handleRelancer} activeOpacity={0.8}>
          <Text style={styles.relancerText}>🔁 Relancer la commande</Text>
        </TouchableOpacity>
      )}
    </MotiView>
  );
}

export default function OrdersScreen() {
  const { history, updateStatus, clearHistory } = useHistory();
  const [statusEntry, setStatusEntry] = useState<HistoryEntry | null>(null);
  const [filterType, setFilterType] = useState<OrderType | "all">("all");
  const router = useRouter();

  const filtered = filterType === "all" ? history : history.filter(e => e.type === filterType);

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateStatus(id, status);
  };

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
          router.replace("/(tabs)/services");
        },
      },
    ]
  );

  const filterChips = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
      style={styles.filterScroll}
    >
      {FILTER_TABS.map(tab => {
        const isActive = filterType === tab.key;
        const color = tab.key !== "all" ? TYPE_CONFIG[tab.key as OrderType].color : colors.brand.gold;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterChip, isActive && { borderColor: color, backgroundColor: color + "22" }]}
            onPress={() => setFilterType(tab.key as OrderType | "all")}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, isActive && { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
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
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <HistoryCard entry={item} index={index} onStatusPress={setStatusEntry} />
          )}
          ListHeaderComponent={filterChips}
          ListEmptyComponent={
            <View style={styles.emptyFiltered}>
              <Text style={styles.emptyFilteredText}>Aucune commande dans cette catégorie</Text>
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <StatusModal
        entry={statusEntry}
        onClose={() => setStatusEntry(null)}
        onSelect={handleStatusUpdate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.4 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  clearBtnText: { fontSize: 13, color: "#E50914", fontWeight: "700" },

  // Filter chips
  filterScroll: { flexGrow: 0 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1.5,
    borderColor: colors.border.default, backgroundColor: colors.bg.elevated,
  },
  filterChipText: { fontSize: 12, fontWeight: "700", color: colors.text.muted },

  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.text.secondary, textAlign: "center", lineHeight: 21 },
  emptyFiltered: { paddingVertical: 40, alignItems: "center" },
  emptyFilteredText: { fontSize: 14, color: colors.text.muted },

  card: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    padding: 16, gap: 10,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeTag: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  typeTagText: { fontSize: 11, fontWeight: "800" },
  dateText: { fontSize: 11, color: colors.text.muted },
  summary: { fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  totalLabel: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  totalValue: { fontSize: 18, fontWeight: "900" },
  statusBubble: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: radius.full, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusEdit: { fontSize: 11, opacity: 0.7 },
  payMethod: { fontSize: 11, color: colors.text.muted, marginTop: -4 },

  relancerBtn: {
    borderRadius: radius.full, borderWidth: 1,
    borderColor: "#25D36655", backgroundColor: "#25D36618",
    paddingVertical: 10, alignItems: "center", marginTop: 2,
  },
  relancerText: { fontSize: 13, fontWeight: "800", color: "#25D366" },

  reorderBtn: {
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.brand.gold + "55", backgroundColor: colors.brand.gold + "15",
    paddingVertical: 10, alignItems: "center", marginTop: 2,
  },
  reorderText: { fontSize: 13, fontWeight: "800", color: colors.brand.gold },

  giftCodeBox: {
    borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.brand.gold + "88",
    backgroundColor: colors.brand.goldLight,
    padding: 14, alignItems: "center", gap: 4,
  },
  giftCodeLabel: { fontSize: 11, fontWeight: "700", color: colors.brand.gold, textTransform: "uppercase", letterSpacing: 0.5 },
  giftCodeValue: { fontSize: 20, fontWeight: "900", color: colors.brand.gold, letterSpacing: 2, fontVariant: ["tabular-nums"] },
  giftCodeCopy: { fontSize: 11, color: colors.text.muted, marginTop: 2 },

  // Status modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: colors.bg.card,
    borderTopLeftRadius: radius["2xl"], borderTopRightRadius: radius["2xl"],
    padding: 24, gap: 12,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border.strong, alignSelf: "center", marginBottom: 4,
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },
  modalSub: { fontSize: 12, color: colors.text.muted, marginBottom: 4 },
  statusList: { gap: 8 },
  statusOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.border.default,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  statusOptionEmoji: { fontSize: 18 },
  statusOptionLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text.primary },
  statusCheck: { fontSize: 16, fontWeight: "900" },
  modalCancel: {
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border.default,
    paddingVertical: 14, alignItems: "center", marginTop: 4,
  },
  modalCancelText: { fontSize: 15, fontWeight: "700", color: colors.text.secondary },
});
