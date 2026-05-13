import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

const { width: SCREEN_W } = Dimensions.get("window");

const RATES = [
  { label: "USDT",      buy: "700 FCFA/$",  sell: "580 FCFA/$",  color: "#26A17B" },
  { label: "BTC",       buy: "70M FCFA",    sell: "58M FCFA",    color: "#F7931A" },
  { label: "TRX",       buy: "182 FCFA",    sell: "151 FCFA",    color: "#EB0029" },
  { label: "PayPal",    buy: "700 FCFA/€",  sell: "580 FCFA/€",  color: "#003087" },
  { label: "PCS",       buy: "—",           sell: "440 FCFA/€",  color: "#C9A84C" },
  { label: "Transcash", buy: "—",           sell: "440 FCFA/€",  color: "#5B5EA6" },
  { label: "USDC",      buy: "700 FCFA/$",  sell: "580 FCFA/$",  color: "#2775CA" },
  { label: "SOL",       buy: "Sur demande", sell: "Sur demande", color: "#9945FF" },
];

const TICKER_TEXT = RATES.map(r =>
  `${r.label}  ▸  Achat ${r.buy}  •  Vente ${r.sell}`
).join("     ◆     ");

// Largeur estimée du texte complet (caractères × largeur moyenne par char)
const ESTIMATED_TEXT_W = TICKER_TEXT.length * 7.2;
const DURATION = Math.round(ESTIMATED_TEXT_W / 0.055); // ~18 000 ms

export default function RateTicker() {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-ESTIMATED_TEXT_W, {
        duration: DURATION,
        easing: Easing.linear,
      }),
      -1, // infini
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
        <View style={styles.overflow}>
          <Animated.View style={[styles.row, animStyle]}>
            <Text style={styles.ticker} numberOfLines={1}>
              {TICKER_TEXT + "     ◆     " + TICKER_TEXT}
            </Text>
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
    flexDirection: "row",
    alignItems: "center",
  },
  track: {
    flex: 1, flexDirection: "row", alignItems: "center",
  },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#10B981",
    marginLeft: 10,
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
  overflow: { flex: 1, overflow: "hidden" },
  row: { flexDirection: "row" },
  ticker: {
    fontSize: 11.5, fontWeight: "700",
    color: colors.brand.gold,
    letterSpacing: 0.3,
  },
});
