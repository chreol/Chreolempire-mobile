import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 0.7 }}
        transition={{ type: "timing", duration: 800, loop: true }}
        style={styles.shimmer}
      />
      <View style={styles.content}>
        <View style={styles.icon} />
        <View style={styles.lineShort} />
        <View style={styles.lineLong} />
        <View style={styles.lineShort} />
      </View>
    </View>
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
    height: 160,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg.elevated,
  },
  content: { padding: 14, gap: 10 },
  icon: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: colors.bg.elevated,
  },
  lineShort: {
    height: 12, width: "50%",
    borderRadius: 6,
    backgroundColor: colors.bg.elevated,
  },
  lineLong: {
    height: 14, width: "80%",
    borderRadius: 7,
    backgroundColor: colors.bg.elevated,
  },
});
