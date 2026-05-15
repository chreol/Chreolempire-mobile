import { useRef, useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

interface Rate {
  name: string;
  buy?: string;
  sell?: string;
}

const RATES_URL = "https://chreolempirev1.vercel.app/rates.json";

const FALLBACK_RATES: Rate[] = [
  { name: "USDT",        buy: "580 FCFA/$",  sell: "700 FCFA/$"       },
  { name: "BTC",         buy: "580 FCFA",    sell: "700 FCFA"         },
  { name: "TRX",         buy: "151 FCFA",    sell: "182 FCFA"         },
  { name: "PayPal",      buy: "580 FCFA/€",  sell: "700 FCFA/€"       },
  { name: "PCS",         buy: "450 FCFA/€"                            },
  { name: "Transcash",   buy: "450 FCFA/€"                            },
  { name: "USDC",        buy: "580 FCFA/$",  sell: "700 FCFA/$"       },
  { name: "SOL & autres",                    sell: "Tarif sur demande" },
];

function buildTickerText(rates: Rate[]): string {
  return rates.map(r => {
    let seg = `${r.name}  ▸`;
    if (r.buy)  seg += `  Achetons à ${r.buy}`;
    if (r.buy && r.sell) seg += "  •";
    if (r.sell) seg += `  Vendons à ${r.sell}`;
    return seg + "     ◆     ";
  }).join("");
}

export default function RateTicker() {
  const [tickerText, setTickerText] = useState(() => buildTickerText(FALLBACK_RATES));
  const translateX = useSharedValue(0);
  const started = useRef(false);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    fetch(RATES_URL, { signal: AbortSignal.timeout?.(4000) })
      .then(r => r.json())
      .then((data: Rate[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setTickerText(buildTickerText(data));
          // Reset animation when rates update
          started.current = false;
          setTextWidth(0);
          translateX.value = 0;
        }
      })
      .catch(() => { /* keep fallback */ });
  }, []);

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
      <View style={styles.ghost} pointerEvents="none">
        <Text style={styles.ticker} onLayout={onGhostLayout}>{tickerText}</Text>
      </View>

      <View style={styles.livePart}>
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>LIVE</Text>
        <View style={styles.sep} />
      </View>

      <View style={styles.clip}>
        <Animated.View style={[styles.row, animStyle, textWidth > 0 && { width: textWidth * 2 }]}>
          <Text style={[styles.ticker, textWidth > 0 && { width: textWidth }]} numberOfLines={1}>
            {tickerText}
          </Text>
          <Text style={[styles.ticker, textWidth > 0 && { width: textWidth }]} numberOfLines={1}>
            {tickerText}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36, backgroundColor: "#0F0F0F",
    borderBottomWidth: 1, borderBottomColor: colors.brand.gold + "33",
    flexDirection: "row", alignItems: "center", overflow: "hidden",
  },
  ghost: { position: "absolute", top: -200, left: 0, opacity: 0 },
  livePart: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#10B981", marginLeft: 10 },
  liveLabel: { fontSize: 9, fontWeight: "900", color: "#10B981", letterSpacing: 1.5, marginLeft: 5 },
  sep: { width: 1, height: 16, backgroundColor: colors.brand.gold + "55", marginHorizontal: 10 },
  clip: { flex: 1, overflow: "hidden" },
  row: { flexDirection: "row" },
  ticker: { fontSize: 11.5, fontWeight: "700", color: colors.brand.gold, letterSpacing: 0.3, flexShrink: 0 },
});
