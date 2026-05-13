import { useRef, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

const RATES = [
  { label: "USDT",      buy: "700 FCFA/$",  sell: "580 FCFA/$" },
  { label: "BTC",       buy: "70M FCFA",    sell: "58M FCFA" },
  { label: "TRX",       buy: "182 FCFA",    sell: "151 FCFA" },
  { label: "PayPal",    buy: "700 FCFA/€",  sell: "580 FCFA/€" },
  { label: "PCS",       buy: "—",           sell: "440 FCFA/€" },
  { label: "Transcash", buy: "—",           sell: "440 FCFA/€" },
  { label: "USDC",      buy: "700 FCFA/$",  sell: "580 FCFA/$" },
  { label: "SOL",       buy: "Sur demande", sell: "Sur demande" },
];

const TICKER_TEXT = RATES.map(r =>
  `${r.label}  ▸  Achat ${r.buy}  •  Vente ${r.sell}`
).join("     ◆     ") + "     ◆     ";

export default function RateTicker() {
  const translateX = useSharedValue(0);
  const measured = useRef(false);

  const startAnim = useCallback((oneWidth: number) => {
    if (oneWidth <= 0 || measured.current) return;
    measured.current = true;
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-oneWidth, {
        duration: oneWidth * 18, // ~18 ms per px → vitesse constante
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>LIVE</Text>
        <View style={styles.sep} />
        <View style={styles.clip}>
          {/* Deux copies côte à côte — la 1ère mesurée pour connaître la vraie largeur */}
          <Animated.View style={[styles.row, animStyle]}>
            <Text
              style={styles.ticker}
              onLayout={e => startAnim(e.nativeEvent.layout.width)}
            >
              {TICKER_TEXT}
            </Text>
            {/* 2ème copie pour le défilement sans coupure */}
            <Text style={styles.ticker}>{TICKER_TEXT}</Text>
          </Animated.View>
        </View>
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
  },
  track: { flex: 1, flexDirection: "row", alignItems: "center" },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#10B981", marginLeft: 10,
    shadowColor: "#10B981", shadowOpacity: 0.8, shadowRadius: 4,
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
  },
});
