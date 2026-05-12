import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { colors } from "@/constants/theme";

const { width: SCREEN_W } = Dimensions.get("window");

const RATES = [
  { label: "USDT",       buy: "700 FCFA/$",  sell: "580 FCFA/$",  color: "#26A17B" },
  { label: "BTC",        buy: "70M FCFA",     sell: "58M FCFA",    color: "#F7931A" },
  { label: "TRX",        buy: "182 FCFA",     sell: "151 FCFA",    color: "#EB0029" },
  { label: "PayPal",     buy: "700 FCFA/€",  sell: "580 FCFA/€",  color: "#003087" },
  { label: "PCS",        buy: "—",            sell: "440 FCFA/€",  color: "#C9A84C" },
  { label: "Transcash",  buy: "—",            sell: "440 FCFA/€",  color: "#5B5EA6" },
  { label: "USDC",       buy: "700 FCFA/$",  sell: "580 FCFA/$",  color: "#2775CA" },
  { label: "SOL",        buy: "Sur demande",  sell: "Sur demande", color: "#9945FF" },
];

function buildTickerText(): string {
  return RATES.map(r =>
    `${r.label}  ▸  Achat ${r.buy}  •  Vente ${r.sell}`
  ).join("     ◆     ");
}

const TICKER_TEXT = buildTickerText() + "     ◆     " + buildTickerText();
const DURATION = 28000; // ms for one full scroll

export default function RateTicker() {
  const anim = useRef(new Animated.Value(0)).current;
  const textWidth = useRef(0);

  const startAnim = (w: number) => {
    anim.setValue(0);
    Animated.loop(
      Animated.timing(anim, {
        toValue: -w,
        duration: DURATION,
        useNativeDriver: true,
      })
    ).start();
  };

  return (
    <View style={styles.container}>
      {/* Left gradient overlay */}
      <View style={styles.fadeLeft} pointerEvents="none" />

      <View style={styles.track}>
        {/* Live dot */}
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>LIVE</Text>
        <View style={styles.sep} />

        <Animated.View
          style={[styles.scrollWrap, { transform: [{ translateX: anim }] }]}
          onLayout={e => {
            const w = e.nativeEvent.layout.width / 2;
            textWidth.current = w;
            startAnim(w);
          }}
        >
          <Text style={styles.ticker} numberOfLines={1}>
            {TICKER_TEXT}
          </Text>
        </Animated.View>
      </View>

      {/* Right gradient overlay */}
      <View style={styles.fadeRight} pointerEvents="none" />
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
  track: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#10B981",
    marginLeft: 10,
    shadowColor: "#10B981",
    shadowOpacity: 0.8, shadowRadius: 4,
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
  scrollWrap: {
    flexDirection: "row",
  },
  ticker: {
    fontSize: 11.5, fontWeight: "700",
    color: colors.brand.gold,
    letterSpacing: 0.3,
    fontVariant: ["tabular-nums"],
  },
  fadeLeft: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: 0,
    zIndex: 2,
  },
  fadeRight: {
    position: "absolute", right: 0, top: 0, bottom: 0, width: 20,
    zIndex: 2,
  },
});
