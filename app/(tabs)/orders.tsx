import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import SkeletonCard from "@/components/SkeletonCard";
import { colors, radius } from "@/constants/theme";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; emoji: string; step: number }> = {
  pending: { label: "En attente", color: "#F97316", emoji: "⏳", step: 1 },
  paid: { label: "Payé", color: "#2563EB", emoji: "💳", step: 2 },
  delivered: { label: "Code Livré", color: "#10B981", emoji: "✅", step: 3 },
  failed: { label: "Échoué", color: "#EF4444", emoji: "❌", step: 0 },
};

function OrderTimeline({ status }: { status: OrderStatus }) {
  const steps = ["pending", "paid", "delivered"] as OrderStatus[];
  const currentStep = STATUS_CONFIG[status].step;

  return (
    <View style={timelineStyles.container}>
      {steps.map((step, i) => {
        const cfg = STATUS_CONFIG[step];
        const isCompleted = currentStep > cfg.step || (status !== "failed" && currentStep >= cfg.step);
        const isCurrent = status !== "failed" && currentStep === cfg.step;

        return (
          <View key={step} style={timelineStyles.stepRow}>
            <View style={timelineStyles.stepLeft}>
              <MotiView
                animate={{ backgroundColor: isCompleted ? cfg.color : colors.bg.elevated }}
                transition={{ type: "timing", duration: 400 }}
                style={[timelineStyles.stepDot, isCurrent && { borderWidth: 2, borderColor: cfg.color }]}
              >
                <Text style={timelineStyles.stepDotText}>{isCompleted ? "✓" : (i + 1).toString()}</Text>
              </MotiView>
              {i < steps.length - 1 && (
                <MotiView
                  animate={{ backgroundColor: currentStep > cfg.step ? cfg.color : colors.border.default }}
                  transition={{ type: "timing", duration: 400, delay: 200 }}
                  style={timelineStyles.stepLine}
                />
              )}
            </View>
            <Text style={[timelineStyles.stepLabel, isCompleted && { color: colors.text.primary }]}>
              {cfg.emoji} {cfg.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <View style={codeStyles.container}>
      <View style={codeStyles.codeBox}>
        <Text style={codeStyles.codeLabel}>🔑 Votre code</Text>
        <Text style={codeStyles.code} selectable>{code}</Text>
      </View>
      <TouchableOpacity
        onPress={handleCopy}
        activeOpacity={0.8}
        style={[
          codeStyles.copyButton,
          copied && codeStyles.copyButtonSuccess,
        ]}
      >
        <MotiView
          key={copied ? "copied" : "copy"}
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14 }}
          style={codeStyles.copyInner}
        >
          <Text style={codeStyles.copyText}>
            {copied ? "✓ Copié !" : "📋 Copier le code"}
          </Text>
        </MotiView>
      </TouchableOpacity>
    </View>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350, delay: index * 70 }}
      style={orderStyles.card}
    >
      {/* Card header */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
        style={orderStyles.header}
      >
        <View style={orderStyles.productInfo}>
          <View style={[orderStyles.statusDot, { backgroundColor: cfg.color }]} />
          <View>
            <Text style={orderStyles.productName}>{order.product_name}</Text>
            <Text style={orderStyles.productMeta}>{order.amount_label} · {order.amount_fcfa.toLocaleString()} FCFA</Text>
          </View>
        </View>

        <View style={orderStyles.statusBadge}>
          <Text style={[orderStyles.statusText, { color: cfg.color }]}>
            {cfg.emoji} {cfg.label}
          </Text>
          <Text style={orderStyles.chevron}>{expanded ? "▲" : "▼"}</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: undefined }}
          transition={{ type: "timing", duration: 300 }}
          style={orderStyles.body}
        >
          {/* Timeline */}
          {order.status !== "failed" && <OrderTimeline status={order.status} />}

          {/* Copy code if delivered */}
          {order.status === "delivered" && order.code && (
            <CopyCodeButton code={order.code} />
          )}

          {/* Order meta */}
          <View style={orderStyles.meta}>
            <Text style={orderStyles.metaLabel}>Réf:</Text>
            <Text style={orderStyles.metaValue} selectable>
              #{order.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <View style={orderStyles.meta}>
            <Text style={orderStyles.metaLabel}>Date:</Text>
            <Text style={orderStyles.metaValue}>
              {new Date(order.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </Text>
          </View>
          <View style={orderStyles.meta}>
            <Text style={orderStyles.metaLabel}>Paiement:</Text>
            <Text style={orderStyles.metaValue}>{order.payment_method.replace("_", " ")}</Text>
          </View>

          {order.status === "failed" && (
            <View style={orderStyles.failedBanner}>
              <Text style={orderStyles.failedText}>
                ❌ Commande échouée. Veuillez contacter le support si vous avez été débité.
              </Text>
            </View>
          )}
        </MotiView>
      )}
    </MotiView>
  );
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const { orders, loading } = useOrders(user?.uid);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Commandes</Text>
        <View style={styles.liveBadge}>
          <MotiView
            from={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 800, loop: true }}
            style={styles.liveDot}
          />
          <Text style={styles.liveText}>Temps réel</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.skeletons}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </View>
      ) : orders.length === 0 ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.emptyState}
        >
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptySubtitle}>Vos commandes apparaîtront ici dès votre premier achat.</Text>
        </MotiView>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <OrderCard order={item} index={index} />}
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
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: colors.accent.green + "22",
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent.green },
  liveText: { color: colors.accent.green, fontSize: 11, fontWeight: "700" },
  list: { padding: 16, gap: 12 },
  skeletons: { padding: 16, gap: 12 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text.primary, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.text.secondary, textAlign: "center", lineHeight: 20 },
});

const orderStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default, overflow: "hidden",
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16,
  },
  productInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  productName: { fontSize: 15, fontWeight: "700", color: colors.text.primary },
  productMeta: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  statusBadge: { alignItems: "flex-end", gap: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },
  chevron: { color: colors.text.muted, fontSize: 11 },
  body: {
    borderTopWidth: 1, borderTopColor: colors.border.default,
    padding: 16, gap: 12,
  },
  meta: { flexDirection: "row", gap: 8 },
  metaLabel: { fontSize: 13, color: colors.text.muted, width: 72 },
  metaValue: { fontSize: 13, color: colors.text.secondary, flex: 1 },
  failedBanner: {
    backgroundColor: "#EF444422",
    borderRadius: radius.md, padding: 12,
    borderWidth: 1, borderColor: "#EF444444",
  },
  failedText: { color: "#EF4444", fontSize: 13, lineHeight: 18 },
});

const timelineStyles = StyleSheet.create({
  container: { gap: 0 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 40 },
  stepLeft: { alignItems: "center", width: 28 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.bg.elevated,
  },
  stepDotText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  stepLine: { width: 2, flex: 1, marginVertical: 2, backgroundColor: colors.border.default },
  stepLabel: { fontSize: 14, color: colors.text.secondary, paddingTop: 4 },
});

const codeStyles = StyleSheet.create({
  container: { gap: 10 },
  codeBox: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl, padding: 16,
    borderWidth: 1.5, borderColor: colors.accent.green + "44",
    borderStyle: "dashed",
    gap: 6,
  },
  codeLabel: { fontSize: 12, color: colors.text.muted, fontWeight: "600" },
  code: {
    fontSize: 18, fontWeight: "800", color: colors.accent.green,
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: colors.brand.blue,
    borderRadius: radius.full, paddingVertical: 13,
    alignItems: "center",
  },
  copyButtonSuccess: { backgroundColor: colors.accent.green },
  copyInner: {},
  copyText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
