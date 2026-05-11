import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/constants/theme";

const LOGO = require("../assets/Fond vide logo chreol empire.png");

export default function SplashIndex() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => {
        router.replace(user ? "/(tabs)" : "/onboarding");
      }, 2600);
      return () => clearTimeout(t);
    }
  }, [loading, user]);

  return (
    <View style={styles.container}>
      {/* Gold glow */}
      <MotiView
        from={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 0.18, scale: 2.5 }}
        transition={{ type: "timing", duration: 1800 }}
        style={styles.glow}
      />

      {/* Logo */}
      <MotiView
        from={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", delay: 200, damping: 14 }}
        style={styles.logoWrap}
      >
        <Image source={LOGO} style={styles.logo} contentFit="contain" />
      </MotiView>

      {/* Name */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 600 }}
        style={styles.nameWrap}
      >
        <Text style={styles.name}>Chreol Empire</Text>
        <Text style={styles.tagline}>Le Premium des Services Digitaux 🇨🇲</Text>
      </MotiView>

      {/* Dots */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1200 }}
        style={styles.dots}
      >
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ scale: 0.4, opacity: 0.2 }}
            animate={{ scale: [0.4, 1, 0.4], opacity: [0.2, 1, 0.2] }}
            transition={{ type: "timing", duration: 900, delay: i * 220, loop: true }}
            style={styles.dot}
          />
        ))}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg.primary,
    alignItems: "center", justifyContent: "center", gap: 24,
  },
  glow: {
    position: "absolute",
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: colors.brand.gold,
  },
  logoWrap: {
    width: 140, height: 140, borderRadius: 70,
    overflow: "hidden",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 32, elevation: 20,
  },
  logo: { width: 140, height: 140 },
  nameWrap: { alignItems: "center", gap: 8 },
  name: { fontSize: 28, fontWeight: "900", color: colors.text.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: colors.text.secondary, letterSpacing: 0.3 },
  dots: { flexDirection: "row", gap: 8, marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.gold },
});
