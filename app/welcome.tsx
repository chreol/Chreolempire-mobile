import { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { FontAwesome } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/hooks/useAuth";

const LOGO = require("../assets/chreolempire logo avec contact m.webp");

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const CITIES = ["Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua", "France", "Belgique", "Autre"];

export default function WelcomeScreen() {
  const router = useRouter();
  const { saveProfile } = useProfile();
  const { signInWithGoogle, signingIn } = useAuth();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [email, setEmail] = useState("");
  const [birthMonth, setBirthMonth] = useState<number | null>(null);

  const nameRef = useRef<TextInput>(null);
  const finalCity = city === "Autre" ? customCity : city;

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { user: googleUser, isNew } = await signInWithGoogle();

      await saveProfile({
        name: googleUser.displayName,
        email: googleUser.email,
        city: "",
        birthMonth: null,
        photoUri: googleUser.photoURL,
      });

      if (isNew && googleUser.email) {
        const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        fetch(`${url}/functions/v1/send-welcome-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({ email: googleUser.email, displayName: googleUser.displayName }),
        }).catch(() => {});
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err?.message !== "cancelled") {
        Alert.alert("Erreur", "Impossible de se connecter avec Google. Vérifiez votre connexion.");
      }
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!name.trim()) {
        Alert.alert("Requis", "Veuillez entrer votre prénom pour continuer.");
        return;
      }
      if (!finalCity.trim()) {
        Alert.alert("Requis", "Veuillez sélectionner ou entrer votre ville.");
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(1);
    } else if (step === 1) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(2);
    } else {
      await finish();
    }
  };

  const finish = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      city: finalCity.trim(),
      birthMonth,
      photoUri: null,
    });

    if (email.trim()) {
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      fetch(`${url}/functions/v1/send-welcome-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), displayName: name.trim() }),
      }).catch(() => {});
    }

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        <View style={styles.logoWrap}>
          <Image source={LOGO} style={styles.logo} contentFit="contain" />
        </View>

        {/* Google Sign-In — toujours visible en haut */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.googleSection}
        >
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
            disabled={signingIn}
            activeOpacity={0.85}
          >
            {signingIn ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <FontAwesome name="google" size={18} color="#fff" style={{ marginRight: 10 }} />
            )}
            <Text style={styles.googleBtnText}>
              {signingIn ? "Connexion en cours..." : "Continuer avec Google"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou créer un profil</Text>
            <View style={styles.dividerLine} />
          </View>
        </MotiView>

        {/* Step dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <MotiView
              key={i}
              animate={{ width: step === i ? 24 : 8, backgroundColor: step === i ? colors.brand.gold : colors.border.default }}
              transition={{ type: "timing", duration: 250 }}
              style={styles.dot}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── STEP 0 — Nom + Ville ── */}
          {step === 0 && (
            <MotiView from={{ opacity: 0, translateX: 40 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: "timing", duration: 320 }}>
              <Text style={styles.stepTitle}>Bienvenue chez{"\n"}Chreol Empire 👑</Text>
              <Text style={styles.stepSub}>Créez votre profil pour profiter de la carte de fidélité et des offres exclusives.</Text>

              <Text style={styles.label}>Votre prénom *</Text>
              <TextInput
                ref={nameRef}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex : Jean, Marie, Alain..."
                placeholderTextColor={colors.text.muted}
                autoCapitalize="words"
                autoFocus
              />

              <Text style={styles.label}>Votre ville *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
                {CITIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, city === c && styles.chipActive]}
                    onPress={() => setCity(c)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, city === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {city === "Autre" && (
                <TextInput
                  style={[styles.input, { marginTop: 10 }]}
                  value={customCity}
                  onChangeText={setCustomCity}
                  placeholder="Entrez votre ville"
                  placeholderTextColor={colors.text.muted}
                  autoCapitalize="words"
                />
              )}
            </MotiView>
          )}

          {/* ── STEP 1 — Email ── */}
          {step === 1 && (
            <MotiView from={{ opacity: 0, translateX: 40 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: "timing", duration: 320 }}>
              <Text style={styles.stepTitle}>Votre adresse{"\n"}email 📧</Text>
              <Text style={styles.stepSub}>
                Pour recevoir vos confirmations de commande et les offres exclusives réservées aux membres.
              </Text>

              <View style={styles.benefitRow}>
                {["✅ Confirmations de commande", "🎁 Offres exclusives membres", "⭐ Invitations à laisser votre avis"].map(b => (
                  <View key={b} style={styles.benefit}>
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.label}>Email (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="exemple@gmail.com"
                placeholderTextColor={colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <Text style={styles.hint}>Vous pouvez ignorer cette étape et l'ajouter plus tard dans votre profil.</Text>
            </MotiView>
          )}

          {/* ── STEP 2 — Mois de naissance ── */}
          {step === 2 && (
            <MotiView from={{ opacity: 0, translateX: 40 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: "timing", duration: 320 }}>
              <Text style={styles.stepTitle}>Votre mois{"\n"}de naissance 🎂</Text>
              <Text style={styles.stepSub}>
                Recevez un tampon bonus le mois de votre anniversaire — un cadeau de Chreol Empire rien que pour vous 🥰!
              </Text>

              <View style={styles.monthGrid}>
                {MONTHS.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.monthBtn, birthMonth === i + 1 && styles.monthBtnActive]}
                    onPress={() => setBirthMonth(i + 1)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.monthText, birthMonth === i + 1 && styles.monthTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hint}>Optionnel — vous pouvez ignorer si vous préférez.</Text>
            </MotiView>
          )}
        </ScrollView>

        <View style={styles.actions}>
          {step > 0 && step < 2 && (
            <TouchableOpacity onPress={handleNext} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipText}>Ignorer cette étape</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.87}>
            <Text style={styles.nextBtnText}>
              {step === 2 ? "Commencer l'expérience 🚀" : "Suivant →"}
            </Text>
          </TouchableOpacity>
          {step === 2 && (
            <TouchableOpacity onPress={finish} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipText}>Ignorer et commencer</Text>
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  logoWrap: { alignItems: "center", paddingTop: 16 },
  logo: { width: 80, height: 80, borderRadius: 40 },

  googleSection: { paddingHorizontal: 24, marginTop: 16 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a73e8",
    borderRadius: radius.full,
    paddingVertical: 14,
    shadowColor: "#1a73e8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  googleBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  divider: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border.default },
  dividerText: { fontSize: 12, color: colors.text.muted, fontWeight: "600" },

  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 16, marginBottom: 8 },
  dot: { height: 8, borderRadius: 4 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, gap: 16 },

  stepTitle: { fontSize: 28, fontWeight: "900", color: colors.text.primary, letterSpacing: -0.5, lineHeight: 36 },
  stepSub: { fontSize: 14, color: colors.text.secondary, lineHeight: 21, marginTop: 10 },

  label: { fontSize: 11, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 16 },
  input: {
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: colors.text.primary, fontWeight: "600",
    marginTop: 8,
  },
  hint: { fontSize: 11, color: colors.text.muted, marginTop: 8, lineHeight: 16 },

  chipScroll: { marginTop: 10 },
  chipRow: { gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
  },
  chipActive: { borderColor: colors.brand.gold, backgroundColor: colors.brand.goldLight },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.text.secondary },
  chipTextActive: { color: colors.brand.gold, fontWeight: "800" },

  benefitRow: { gap: 8, marginTop: 16 },
  benefit: {
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  benefitText: { fontSize: 13, color: colors.text.secondary, fontWeight: "600" },

  monthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  monthBtn: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
  },
  monthBtnActive: { borderColor: colors.brand.gold, backgroundColor: colors.brand.goldLight },
  monthText: { fontSize: 13, fontWeight: "600", color: colors.text.secondary },
  monthTextActive: { color: colors.brand.gold, fontWeight: "800" },

  actions: { padding: 20, gap: 10 },
  nextBtn: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingVertical: 16, alignItems: "center",
    shadowColor: colors.brand.gold, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  nextBtnText: { fontSize: 16, fontWeight: "900", color: "#0A0A0A" },
  skipBtn: { alignItems: "center", paddingVertical: 4 },
  skipText: { fontSize: 13, color: colors.text.muted, fontWeight: "600" },
});
