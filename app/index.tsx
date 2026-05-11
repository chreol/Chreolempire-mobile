import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from "react-native-reanimated";
import { MotiView, MotiText } from "moti";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/constants/theme";

export default function SplashIndex() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding");
        }
      }, 2200);
      return () => clearTimeout(timeout);
    }
  }, [loading, user]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary, alignItems: "center", justifyContent: "center" }}>
      {/* Glow background */}
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.25, scale: 2 }}
        transition={{ type: "timing", duration: 1500 }}
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: colors.brand.blue,
        }}
      />

      {/* Logo */}
      <MotiView
        from={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", delay: 200, damping: 15 }}
        style={{
          width: 96,
          height: 96,
          borderRadius: 28,
          backgroundColor: colors.brand.blue,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          shadowColor: colors.brand.blue,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 24,
          elevation: 20,
        }}
      >
        <MotiText
          style={{ fontSize: 42, fontWeight: "900", color: "#fff" }}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 500 }}
        >
          CE
        </MotiText>
      </MotiView>

      {/* Title */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 600 }}
      >
        <MotiText
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: colors.text.primary,
            textAlign: "center",
            letterSpacing: -0.5,
          }}
        >
          Chreol Empire
        </MotiText>
        <MotiText
          style={{
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: "center",
            marginTop: 6,
            letterSpacing: 0.5,
          }}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 900 }}
        >
          Premium Digital Store 🇨🇲
        </MotiText>
      </MotiView>

      {/* Loading dots */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1200 }}
        style={{ flexDirection: "row", gap: 8, marginTop: 48 }}
      >
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ scale: 0.5, opacity: 0.3 }}
            animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
            transition={{ type: "timing", duration: 900, delay: i * 200, loop: true }}
            style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand.blue }}
          />
        ))}
      </MotiView>
    </View>
  );
}
