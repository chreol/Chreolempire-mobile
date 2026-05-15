import { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Modal, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://voiagfmtqezelocvjjcb.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_h1zlS_9W8IrLnNg75bAEYA_bK_S7obJ";

interface Order {
  id: string;
  type: string;
  summary: string;
  total: number;
  payment_method: string | null;
  status: "pending" | "processing" | "done" | "cancelled";
  gift_code: string | null;
  client_name: string | null;
  client_email: string | null;
  client_city: string | null;
  details: Record<string, string> | null;
  push_token: string | null;
  created_at: string;
}

const DETAILS_LABELS: Record<string, string> = {
  card: "Carte", clientId: "ID Client", wallet: "Wallet", cryptoType: "Crypto",
  paypalEmail: "Email PayPal", operator: "Opérateur", momoNumber: "N° MoMo",
  couponType: "Type coupon", amount: "Montant estimé", txHash: "Hash TX",
  walletNetwork: "Réseau",
};

const TYPE_INFO: Record<string, { icon: string; label: string; color: string }> = {
  achat:          { icon: "🎮", label: "Achat carte cadeau", color: "#C9A84C" },
  coupon:         { icon: "🎟️", label: "Échange coupon",     color: "#60A5FA" },
  "crypto-sell":  { icon: "₿",  label: "Vente crypto",       color: "#26A17B" },
  "paypal-sell":  { icon: "💶", label: "Vente PayPal",        color: "#6BA3BE" },
  mixte:          { icon: "🔄", label: "Demande mixte",       color: "#8B5CF6" },
};

const STATUS_INFO: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  pending:     { label: "En attente",      color: "#9CA3AF", bg: "rgba(156,163,175,0.15)", emoji: "⏳" },
  processing:  { label: "Prise en charge", color: "#3B82F6", bg: "rgba(59,130,246,0.15)",  emoji: "✅" },
  in_progress: { label: "En livraison",   color: "#A78BFA", bg: "rgba(167,139,250,0.15)", emoji: "⚙️" },
  done:        { label: "Terminée",        color: "#25D366", bg: "rgba(37,211,102,0.15)",  emoji: "🎉" },
  cancelled:   { label: "Annulée",         color: "#EF4444", bg: "rgba(239,68,68,0.15)",   emoji: "❌" },
};

// Ce vers quoi on peut basculer depuis chaque état
const NEXT: Record<string, Array<"processing" | "in_progress" | "done" | "cancelled">> = {
  pending:     ["processing", "cancelled"],
  processing:  ["in_progress", "done", "cancelled"],
  in_progress: ["done", "cancelled"],
  done:        [],
  cancelled:   [],
};

const FILTER_TABS = [
  { key: "all",         label: "Toutes" },
  { key: "pending",     label: "⏳ En attente" },
  { key: "processing",  label: "✅ Prise en charge" },
  { key: "in_progress", label: "⚙️ En livraison" },
  { key: "done",        label: "🎉 Terminées" },
  { key: "cancelled",   label: "❌ Annulées" },
];

function callAdmin(endpoint: string, body: object, adminSecret: string) {
  return fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ adminSecret, ...body }),
  }).then(r => r.json());
}

export default function AdminScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [giftCode, setGiftCode] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const verifyPin = () => {
    const adminSecret = process.env.EXPO_PUBLIC_ADMIN_SECRET;
    if (pin === adminSecret) {
      setUnlocked(true);
      loadOrders("all");
    } else {
      Alert.alert("Accès refusé", "Code incorrect.");
      setPin("");
    }
  };

  const loadOrders = useCallback(async (status: string) => {
    setLoading(true);
    setFilterStatus(status);
    try {
      const data = await callAdmin("admin-get-orders", { status }, process.env.EXPO_PUBLIC_ADMIN_SECRET!);
      setOrders(data.orders ?? []);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  const changeStatus = async (newStatus: "processing" | "done" | "cancelled") => {
    if (!selected) return;
    setUpdating(newStatus);
    try {
      const body: Record<string, string> = { orderId: selected.id, status: newStatus };
      if (giftCode.trim()) body.giftCode = giftCode.trim();

      const data = await callAdmin("admin-update-order", body, process.env.EXPO_PUBLIC_ADMIN_SECRET!);
      if (data.error) throw new Error(data.error);

      setOrders(prev =>
        prev.map(o => o.id === selected.id
          ? { ...o, status: newStatus, gift_code: giftCode.trim() || o.gift_code }
          : o
        )
      );
      setSelected(null);
      setGiftCode("");
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    } finally {
      setUpdating(null);
    }
  };

  const saveCodeOnly = async () => {
    if (!selected || !giftCode.trim()) return;
    setUpdating("code");
    try {
      const data = await callAdmin(
        "admin-update-order",
        { orderId: selected.id, status: selected.status, giftCode: giftCode.trim() },
        process.env.EXPO_PUBLIC_ADMIN_SECRET!
      );
      if (data.error) throw new Error(data.error);
      setOrders(prev =>
        prev.map(o => o.id === selected.id ? { ...o, gift_code: giftCode.trim() } : o)
      );
      setSelected(null);
      setGiftCode("");
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    } finally {
      setUpdating(null);
    }
  };

  // ── Écran PIN ──────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.pinScreen}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.pinEmoji}>🔐</Text>
          <Text style={styles.pinTitle}>Accès Admin</Text>
          <Text style={styles.pinSub}>Entrez le code secret pour accéder au panneau d'administration.</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={setPin}
            placeholder="Code secret"
            placeholderTextColor={colors.text.muted}
            secureTextEntry
            autoCapitalize="none"
            onSubmitEditing={verifyPin}
          />
          <TouchableOpacity style={styles.pinBtn} onPress={verifyPin} activeOpacity={0.85}>
            <Text style={styles.pinBtnText}>Accéder →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Panel admin ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commandes</Text>
        <TouchableOpacity onPress={() => loadOrders(filterStatus)} style={styles.headerBtn}>
          <Ionicons name="refresh" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TABS.map(tab => {
          const active = filterStatus === tab.key;
          const info = tab.key !== "all" ? STATUS_INFO[tab.key] : null;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterChip,
                active && { borderColor: info?.color ?? colors.brand.gold, backgroundColor: info?.bg ?? "rgba(201,168,76,0.15)" },
              ]}
              onPress={() => loadOrders(tab.key)}
            >
              <Text style={[
                styles.filterChipText,
                active && { color: info?.color ?? colors.brand.gold, fontWeight: "800" },
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Liste */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.gold} size="large" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Aucune commande</Text>
            </View>
          }
          renderItem={({ item }) => {
            const st = STATUS_INFO[item.status] ?? STATUS_INFO.pending;
            const ty = TYPE_INFO[item.type] ?? { icon: "📦", label: item.type, color: colors.text.muted };
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => { setSelected(item); setGiftCode(item.gift_code ?? ""); }}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardTypeRow}>
                    <Text style={styles.cardIcon}>{ty.icon}</Text>
                    <Text style={[styles.cardType, { color: ty.color }]}>{ty.label}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusPillText, { color: st.color }]}>{st.emoji} {st.label}</Text>
                  </View>
                </View>

                <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>

                {(item.client_name || item.client_city) && (
                  <Text style={styles.cardClient}>
                    👤 {item.client_name ?? "—"}{item.client_city ? `  📍 ${item.client_city}` : ""}
                  </Text>
                )}
                {item.client_email && (
                  <Text style={styles.cardEmail}>✉️ {item.client_email}</Text>
                )}

                <View style={styles.cardBottom}>
                  <Text style={styles.cardTotal}>{item.total.toLocaleString("fr-FR")} FCFA</Text>
                  {item.payment_method && (
                    <Text style={styles.cardPayment}>{item.payment_method}</Text>
                  )}
                  <Text style={styles.cardDate}>
                    {new Date(item.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </Text>
                </View>

                {item.gift_code && (
                  <View style={styles.codeRow}>
                    <Text style={styles.codeLabel}>Code :</Text>
                    <Text style={styles.codeValue}>{item.gift_code}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ── Modal détail + changement statut ───────────────────────────────── */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={() => setSelected(null)} />

          {selected && (() => {
            const ty = TYPE_INFO[selected.type] ?? { icon: "📦", label: selected.type, color: colors.text.muted };
            const st = STATUS_INFO[selected.status] ?? STATUS_INFO.pending;
            const next = NEXT[selected.status] ?? [];

            return (
              <View style={styles.sheet}>
                {/* En-tête */}
                <View style={styles.sheetHead}>
                  <Text style={styles.sheetIcon}>{ty.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sheetType, { color: ty.color }]}>{ty.label}</Text>
                    <Text style={styles.sheetId}>#{selected.id.slice(-10)}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusPillText, { color: st.color }]}>{st.emoji} {st.label}</Text>
                  </View>
                </View>

                {/* Détails commande */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailSummary}>{selected.summary}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Total</Text>
                    <Text style={styles.detailVal}>{selected.total.toLocaleString("fr-FR")} FCFA</Text>
                  </View>
                  {selected.payment_method && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Paiement</Text>
                      <Text style={styles.detailVal}>{selected.payment_method}</Text>
                    </View>
                  )}
                  {selected.client_name && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Client</Text>
                      <Text style={styles.detailVal}>{selected.client_name}</Text>
                    </View>
                  )}
                  {selected.client_email && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Email</Text>
                      <Text style={[styles.detailVal, { color: "#60A5FA" }]}>{selected.client_email}</Text>
                    </View>
                  )}
                  {selected.client_city && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Ville</Text>
                      <Text style={styles.detailVal}>📍 {selected.client_city}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Date</Text>
                    <Text style={styles.detailVal}>
                      {new Date(selected.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>

                {/* Détails formulaire client */}
                {selected.details && Object.keys(selected.details).filter(k => k !== "type").length > 0 && (
                  <>
                    <Text style={styles.sheetLabel}>INFORMATIONS CLIENT</Text>
                    <View style={styles.detailBox}>
                      {Object.entries(selected.details)
                        .filter(([k]) => k !== "type")
                        .map(([k, v]) => v ? (
                          <View key={k} style={styles.detailRow}>
                            <Text style={styles.detailKey}>{DETAILS_LABELS[k] ?? k}</Text>
                            <Text style={[styles.detailVal, { fontFamily: "monospace", fontSize: 12 }]} selectable>{v}</Text>
                          </View>
                        ) : null)}
                    </View>
                  </>
                )}

                {/* Code / Référence */}
                <Text style={styles.sheetLabel}>CODE / RÉFÉRENCE</Text>
                <TextInput
                  style={styles.codeInput}
                  value={giftCode}
                  onChangeText={setGiftCode}
                  placeholder="XXXX-XXXX-XXXX"
                  placeholderTextColor={colors.text.muted}
                  autoCapitalize="characters"
                />

                {/* Bouton sauvegarder code uniquement */}
                {giftCode.trim() !== (selected.gift_code ?? "") && giftCode.trim() && (
                  <TouchableOpacity
                    style={styles.saveCodeBtn}
                    onPress={saveCodeOnly}
                    disabled={!!updating}
                  >
                    {updating === "code" ? (
                      <ActivityIndicator size="small" color="#25D366" />
                    ) : (
                      <Text style={styles.saveCodeText}>💾 Sauvegarder le code</Text>
                    )}
                  </TouchableOpacity>
                )}

                {/* Boutons de changement de statut */}
                {next.length > 0 && (
                  <>
                    <Text style={styles.sheetLabel}>CHANGER LE STATUT</Text>
                    <View style={styles.statusBtns}>
                      {next.map(s => {
                        const info = STATUS_INFO[s];
                        const isLoading = updating === s;
                        return (
                          <TouchableOpacity
                            key={s}
                            style={[styles.statusBtn, { backgroundColor: info.bg, borderColor: info.color }]}
                            onPress={() => changeStatus(s)}
                            disabled={!!updating}
                            activeOpacity={0.8}
                          >
                            {isLoading ? (
                              <ActivityIndicator size="small" color={info.color} />
                            ) : (
                              <Text style={[styles.statusBtnText, { color: info.color }]}>
                                {info.emoji}{"  "}{info.label}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {next.length === 0 && (
                  <View style={[styles.terminalBox, { backgroundColor: st.bg, borderColor: st.color + "44" }]}>
                    <Text style={[styles.terminalText, { color: st.color }]}>
                      {st.emoji} Commande {st.label.toLowerCase()} — statut final
                    </Text>
                  </View>
                )}

                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                  <Text style={styles.closeBtnText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            );
          })()}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  // PIN
  pinScreen: { flex: 1, padding: 32, justifyContent: "center" },
  backBtn: { position: "absolute", top: 0, left: 0, padding: 8 },
  pinEmoji: { fontSize: 48, textAlign: "center", marginBottom: 16 },
  pinTitle: { fontSize: 26, fontWeight: "900", color: colors.text.primary, textAlign: "center", marginBottom: 8 },
  pinSub: { fontSize: 14, color: colors.text.secondary, lineHeight: 21, textAlign: "center", marginBottom: 32 },
  pinInput: {
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, color: colors.text.primary, fontWeight: "700",
    marginBottom: 16, textAlign: "center", letterSpacing: 6,
  },
  pinBtn: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingVertical: 16, alignItems: "center",
  },
  pinBtnText: { fontSize: 16, fontWeight: "900", color: "#0A0A0A" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },

  // Filtres
  filterScroll: { maxHeight: 52 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
  },
  filterChipText: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },

  // Liste
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyText: { color: colors.text.muted, fontSize: 15 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 10 },

  // Card commande
  card: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border.default,
    gap: 8,
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTypeRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  cardIcon: { fontSize: 18 },
  cardType: { fontSize: 13, fontWeight: "700" },
  cardSummary: { fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
  cardClient: { fontSize: 12, color: colors.text.muted },
  cardEmail:  { fontSize: 11, color: "#60A5FA" },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  cardTotal: { fontSize: 15, fontWeight: "900", color: colors.brand.gold },
  cardPayment: { fontSize: 11, color: colors.text.muted, fontWeight: "600" },
  cardDate: { fontSize: 11, color: colors.text.muted, marginLeft: "auto" },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  codeLabel: { fontSize: 11, color: colors.text.muted, fontWeight: "600" },
  codeValue: { fontSize: 12, fontWeight: "800", color: "#25D366", fontFamily: "monospace" },

  // Status pill
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusPillText: { fontSize: 11, fontWeight: "700" },

  // Modal
  overlay: { flex: 1, justifyContent: "flex-end" },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.7)" },
  sheet: {
    backgroundColor: colors.bg.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36, gap: 12,
  },
  sheetHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  sheetIcon: { fontSize: 28 },
  sheetType: { fontSize: 15, fontWeight: "800" },
  sheetId: { fontSize: 11, color: colors.text.muted, fontFamily: "monospace", marginTop: 2 },

  // Détails
  detailBox: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg,
    padding: 14, gap: 8,
  },
  detailSummary: { fontSize: 14, color: colors.text.primary, fontWeight: "600", lineHeight: 20, marginBottom: 4 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  detailKey: { fontSize: 12, color: colors.text.muted, fontWeight: "600", flex: 1 },
  detailVal: { fontSize: 12, color: colors.text.secondary, fontWeight: "700", flex: 2, textAlign: "right" },

  // Code input
  sheetLabel: {
    fontSize: 10, fontWeight: "700", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  codeInput: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: "#25D366", fontWeight: "800",
    textAlign: "center", letterSpacing: 3,
  },
  saveCodeBtn: {
    backgroundColor: "rgba(37,211,102,0.1)", borderRadius: radius.lg,
    borderWidth: 1, borderColor: "rgba(37,211,102,0.3)",
    paddingVertical: 11, alignItems: "center",
  },
  saveCodeText: { fontSize: 13, fontWeight: "700", color: "#25D366" },

  // Statut buttons
  statusBtns: { flexDirection: "row", gap: 10 },
  statusBtn: {
    flex: 1, paddingVertical: 16, borderRadius: radius.xl,
    alignItems: "center", borderWidth: 1.5,
  },
  statusBtnText: { fontSize: 15, fontWeight: "900" },

  // Terminal
  terminalBox: {
    borderRadius: radius.lg, borderWidth: 1,
    paddingVertical: 14, alignItems: "center",
  },
  terminalText: { fontSize: 13, fontWeight: "700" },

  // Fermer
  closeBtn: { alignItems: "center", paddingVertical: 10, marginTop: 4 },
  closeBtnText: { fontSize: 14, color: colors.text.muted, fontWeight: "600" },
});
