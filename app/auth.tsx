import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

const LOGO = require("../assets/Fond vide logo chreol empire.png");

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "true";

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 1000));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
        return;
      }

      const { GoogleSignin } = await import("@react-native-google-signin/google-signin");
      const { GoogleAuthProvider, signInWithCredential } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      const { supabase } = await import("@/lib/supabase");

      GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error("Token introuvable");

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);

      await supabase.from("profiles").upsert({
        firebase_uid: result.user.uid,
        email: result.user.email ?? "",
        display_name: result.user.displayName ?? "Utilisateur",
        photo_url: result.user.photoURL ?? undefined,
      }, { onConflict: "firebase_uid" });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gold glow top */}
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 2 }}
        transition={{ type: "timing", duration: 1200 }}
        style={styles.glow}
      />

      {/* Logo + branding */}
      <MotiView
        from={{ opacity: 0, scale: 0.85, translateY: -20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", delay: 100, damping: 14 }}
        style={styles.brandWrap}
      >
        <View style={styles.logoRing}>
          <Image source={LOGO} style={styles.logo} contentFit="contain" />
        </View>
        <Text style={styles.appName}>Chreol Empire</Text>
        <Text style={styles.tagline}>Le Premium des Services Digitaux 🇨🇲</Text>
      </MotiView>

      {/* Service chips */}
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 400 }}
        style={styles.chips}
      >
        {["🎮 PSN", "🍎 iTunes", "🟥 Roblox", "₿ Crypto", "🔵 PayPal", "🏦 UBA"].map((item, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </MotiView>

      {/* Auth card */}
      <MotiView
        from={{ translateY: 80, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: "spring", delay: 500, damping: 18 }}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>Bienvenue 👋</Text>
        <Text style={styles.cardSub}>
          Connectez-vous pour accéder à tous vos services digitaux.
        </Text>

        {DEMO_MODE && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>🧪 Mode démo — aucune vraie connexion requise</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          style={[styles.googleBtn, loading && { opacity: 0.6 }]}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={colors.bg.primary} size="small" />
            : (
              <>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleText}>{DEMO_MODE ? "Continuer en démo" : "Continuer avec Google"}</Text>
              </>
            )}
        </TouchableOpacity>

        {error && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </MotiView>
        )}

        <Text style={styles.secNote}>
          🔒 {DEMO_MODE ? "Mode démo — données fictives" : "Connexion sécurisée Google"}
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg.primary,
    alignItems: "center", justifyContent: "space-between", paddingTop: 70,
  },
  glow: {
    position: "absolute", top: -60,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: colors.brand.gold,
  },
  brandWrap: { alignItems: "center", gap: 10 },
  logoRing: {
    width: 90, height: 90, borderRadius: 45,
    overflow: "hidden",
    borderWidth: 2, borderColor: colors.brand.gold + "44",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  logo: { width: 90, height: 90 },
  appName: { fontSize: 24, fontWeight: "900", color: colors.text.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: colors.text.secondary },
  chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, paddingHorizontal: 24 },
  chip: {
    backgroundColor: colors.bg.secondary, borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.border.default,
  },
  chipText: { fontSize: 13, color: colors.text.secondary, fontWeight: "500" },
  card: {
    width: "100%", backgroundColor: colors.bg.card,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, borderTopWidth: 1, borderColor: colors.border.default, gap: 14,
    shadowColor: colors.brand.gold, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
  },
  cardTitle: { fontSize: 22, fontWeight: "800", color: colors.text.primary },
  cardSub: { fontSize: 14, color: colors.text.secondary, lineHeight: 21 },
  demoBanner: {
    backgroundColor: colors.brand.goldLight,
    borderRadius: radius.md, padding: 10,
    borderWidth: 1, borderColor: colors.brand.gold + "55",
  },
  demoBannerText: { color: colors.brand.goldDark, fontSize: 12, fontWeight: "600", textAlign: "center" },
  googleBtn: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full, height: 54,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
    shadowColor: colors.brand.gold, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  googleG: { fontSize: 18, fontWeight: "900", color: "#0A0A0A", fontStyle: "italic" },
  googleText: { fontSize: 15, fontWeight: "700", color: "#0A0A0A" },
  errorBox: { backgroundColor: "#2A0A0A", borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: "#5A1A1A" },
  errorText: { color: "#DC2626", fontSize: 13 },
  secNote: { fontSize: 12, color: colors.text.muted, textAlign: "center" },
});
