import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { useLoyalty, STAMPS_FOR_REWARD } from "@/contexts/LoyaltyContext";
import { colors, radius } from "@/constants/theme";

const STAMP_ICONS = ["🎮", "💵", "🎟️", "₿", "🎁", "💶", "🎯", "⚡", "🌟", "👑"];

function Stamp({ filled, index }: { filled: boolean; index: number }) {
  return (
    <MotiView
      from={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", delay: index * 40, damping: 14 }}
      style={[styles.stamp, filled ? styles.stampFilled : styles.stampEmpty]}
    >
      {filled ? (
        <Text style={styles.stampIcon}>{STAMP_ICONS[index]}</Text>
      ) : (
        <Text style={styles.stampNum}>{index + 1}</Text>
      )}
    </MotiView>
  );
}

export default function LoyaltyCard() {
  const { activeStamps, stamps, redeemed, canRedeem, redeemReward } = useLoyalty();

  const handleRedeem = async () => {
    if (!canRedeem) return;
    Alert.alert(
      "🎁 Récompense disponible !",
      "Présentez cette notification à notre équipe WhatsApp pour bénéficier de votre avantage fidélité.\n\nContactez-nous pour réclamer votre récompense.",
      [
        { text: "Plus tard", style: "cancel" },
        {
          text: "Réclamer sur WhatsApp",
          onPress: async () => {
            await redeemReward();
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const totalCompleted = Math.floor(stamps / STAMPS_FOR_REWARD);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>👑 Carte de Fidélité</Text>
          <Text style={styles.sub}>
            {activeStamps}/{STAMPS_FOR_REWARD} tampons — {totalCompleted} carte{totalCompleted !== 1 ? "s" : ""} complétée{totalCompleted !== 1 ? "s" : ""}
          </Text>
        </View>
        {canRedeem && (
          <TouchableOpacity style={styles.redeemBtn} onPress={handleRedeem} activeOpacity={0.8}>
            <Text style={styles.redeemBtnText}>🎁 Réclamer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <MotiView
          animate={{ width: `${(activeStamps / STAMPS_FOR_REWARD) * 100}%` as any }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.progressFill}
        />
      </View>

      {/* Stamp grid */}
      <View style={styles.grid}>
        {Array.from({ length: STAMPS_FOR_REWARD }).map((_, i) => (
          <Stamp key={i} filled={i < activeStamps} index={i} />
        ))}
      </View>

      {/* Reward info */}
      <View style={[styles.rewardInfo, canRedeem && { backgroundColor: "#C9A84C22" }]}>
        <Text style={styles.rewardText}>
          {canRedeem
            ? "🎉 Vous avez une récompense disponible ! Appuyez sur « Réclamer » ci-dessus."
            : `Encore ${STAMPS_FOR_REWARD - activeStamps} commande${STAMPS_FOR_REWARD - activeStamps > 1 ? "s" : ""} pour débloquer une récompense exclusive.`}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stamps}</Text>
          <Text style={styles.statLabel}>Tampons totaux</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{redeemed}</Text>
          <Text style={styles.statLabel}>Récompenses</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.brand.gold }]}>{totalCompleted}</Text>
          <Text style={styles.statLabel}>Cartes VIP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.card,
    borderRadius: radius["2xl"],
    borderWidth: 1.5, borderColor: colors.brand.gold + "44",
    padding: 16, gap: 14,
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 16, fontWeight: "900", color: colors.text.primary },
  sub: { fontSize: 11, color: colors.text.muted, marginTop: 3 },
  redeemBtn: {
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  redeemBtnText: { fontSize: 12, fontWeight: "900", color: "#0A0A0A" },

  progressTrack: {
    height: 6, backgroundColor: colors.bg.elevated,
    borderRadius: 3, overflow: "hidden",
  },
  progressFill: {
    height: 6, backgroundColor: colors.brand.gold,
    borderRadius: 3,
    shadowColor: colors.brand.gold, shadowOpacity: 0.6, shadowRadius: 4,
  },

  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 8, justifyContent: "center",
  },
  stamp: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  stampFilled: {
    backgroundColor: colors.brand.gold + "33",
    borderWidth: 2, borderColor: colors.brand.gold,
    shadowColor: colors.brand.gold, shadowOpacity: 0.4, shadowRadius: 6, elevation: 3,
  },
  stampEmpty: {
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5, borderColor: colors.border.default,
    borderStyle: "dashed",
  },
  stampIcon: { fontSize: 22 },
  stampNum: { fontSize: 12, fontWeight: "700", color: colors.text.muted },

  rewardInfo: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg, padding: 10,
  },
  rewardText: { fontSize: 12, color: colors.text.secondary, textAlign: "center", lineHeight: 17 },

  statsRow: {
    flexDirection: "row", backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg, padding: 12, alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  statLabel: { fontSize: 10, color: colors.text.muted, marginTop: 2 },
  statDiv: { width: 1, height: 28, backgroundColor: colors.border.default },
});
