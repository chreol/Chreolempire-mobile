import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import * as Haptics from "expo-haptics";
import { MotiView, MotiText } from "moti";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { colors, radius } from "@/constants/theme";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) throw new Error("Impossible d'obtenir le token Google");

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);

      // Upsert profile in Supabase
      await supabase.from("profiles").upsert({
        firebase_uid: result.user.uid,
        email: result.user.email ?? "",
        display_name: result.user.displayName ?? "Utilisateur",
        photo_url: result.user.photoURL ?? undefined,
      }, { onConflict: "firebase_uid" });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur de connexion";
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ type: "timing", duration: 1500 }}
        style={styles.glow}
      />

      {/* Logo */}
      <MotiView
        from={{ opacity: 0, scale: 0.8, translateY: -20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", delay: 100, damping: 14 }}
        style={styles.logoContainer}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>CE</Text>
        </View>
        <Text style={styles.appName}>Chreol Empire</Text>
        <Text style={styles.tagline}>Premium Digital Store 🇨🇲</Text>
      </MotiView>

      {/* Cards preview strip */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 400 }}
        style={styles.previewStrip}
      >
        {["🎮 Robux", "🎬 Netflix", "🎮 PSN", "💵 USDT"].map((item, i) => (
          <View key={i} style={styles.previewChip}>
            <Text style={styles.previewChipText}>{item}</Text>
          </View>
        ))}
      </MotiView>

      {/* Bottom sheet style auth card */}
      <MotiView
        from={{ translateY: 100, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: "spring", delay: 500, damping: 18 }}
        style={styles.authCard}
      >
        <Text style={styles.welcomeTitle}>Bienvenue 👋</Text>
        <Text style={styles.welcomeSubtitle}>
          Connectez-vous pour acheter vos cartes cadeaux et crédits préférés en quelques secondes.
        </Text>

        {/* Google Sign-In button */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
          style={[styles.googleButton, loading && styles.googleButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={colors.bg.primary} size="small" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continuer avec Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Error */}
        {error && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.errorBox}
          >
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </MotiView>
        )}

        {/* Security note */}
        <Text style={styles.securityNote}>
          🔒 Connexion sécurisée par Google. Aucun mot de passe requis.
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 80,
  },
  glow: {
    position: "absolute",
    top: -50,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: colors.brand.blue,
  },
  logoContainer: { alignItems: "center", gap: 12 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.brand.blue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brand.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 18,
  },
  logoText: { fontSize: 32, fontWeight: "900", color: "#fff" },
  appName: { fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: colors.text.secondary },
  previewStrip: { flexDirection: "row", gap: 8, paddingHorizontal: 24, flexWrap: "wrap", justifyContent: "center" },
  previewChip: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  previewChipText: { color: colors.text.secondary, fontSize: 13 },
  authCard: {
    width: "100%",
    backgroundColor: colors.bg.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    borderTopWidth: 1,
    borderColor: colors.border.default,
    gap: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderRadius: radius.full,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  googleButtonDisabled: { opacity: 0.6 },
  googleIcon: {
    fontSize: 18,
    fontWeight: "900",
    color: "#4285F4",
    fontStyle: "italic",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.bg.primary,
    letterSpacing: 0.2,
  },
  errorBox: {
    backgroundColor: "#EF444422",
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EF444444",
  },
  errorText: { color: "#EF4444", fontSize: 13 },
  securityNote: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "center",
    marginTop: 4,
  },
});
