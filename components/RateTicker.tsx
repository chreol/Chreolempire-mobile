import { useRef, useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

const TICKER_TEXT =
  "USDT  ▸  Achat 700 FCFA/$  •  Vente 580 FCFA/$     ◆     " +
  "BTC  ▸  Achat 70M FCFA  •  Vente 58M FCFA     ◆     " +
  "TRX  ▸  Achat 182 FCFA  •  Vente 151 FCFA     ◆     " +
  "PayPal  ▸  Achat 700 FCFA/€  •  Vente 580 FCFA/€     ◆     " +
  "PCS  ▸  Vente 440 FCFA/€     ◆     " +
  "Transcash  ▸  Vente 440 FCFA/€     ◆     " +
  "USDC  ▸  Achat 700 FCFA/$  •  Vente 580 FCFA/$     ◆     " +
  "SOL  ▸  Sur demande     ◆     ";

export default function RateTicker() {
  const translateX = useSharedValue(0);
  const started = useRef(false);
  const [textWidth, setTextWidth] = useState(0);

  const onGhostLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && !started.current) {
      started.current = true;
      setTextWidth(w);
      translateX.value = withRepeat(
        withTiming(-w, { duration: w * 20, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>

      {/* Ghost invisible — mesure la largeur naturelle sans contrainte */}
      <View style={styles.ghost} pointerEvents="none">
        <Text style={styles.ticker} onLayout={onGhostLayout}>{TICKER_TEXT}</Text>
      </View>

      {/* Ticker visible */}
      <View style={styles.livePart}>
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>LIVE</Text>
        <View style={styles.sep} />
      </View>

      <View style={styles.clip}>
        <Animated.View style={[styles.row, animStyle, textWidth > 0 && { width: textWidth * 2 }]}>
          <Text style={[styles.ticker, textWidth > 0 && { width: textWidth }]} numberOfLines={1}>
            {TICKER_TEXT}
          </Text>
          <Text style={[styles.ticker, textWidth > 0 && { width: textWidth }]} numberOfLines={1}>
            {TICKER_TEXT}
          </Text>
        </Animated.View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: "#0F0F0F",
    borderBottomWidth: 1,
    borderBottomColor: colors.brand.gold + "33",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  // Ghost hors écran, opacity 0, aucune contrainte de largeur
  ghost: {
    position: "absolute",
    top: -200,
    left: 0,
    opacity: 0,
  },
  livePart: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#10B981", marginLeft: 10,
  },
  liveLabel: {
    fontSize: 9, fontWeight: "900", color: "#10B981",
    letterSpacing: 1.5, marginLeft: 5,
  },
  sep: {
    width: 1, height: 16,
    backgroundColor: colors.brand.gold + "55",
    marginHorizontal: 10,
  },
  clip: { flex: 1, overflow: "hidden" },
  row: { flexDirection: "row" },
  ticker: {
    fontSize: 11.5, fontWeight: "700",
    color: colors.brand.gold, letterSpacing: 0.3,
    flexShrink: 0,
  },
});
