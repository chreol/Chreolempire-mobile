import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Linking, ScrollView, Modal, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";
import LoyaltyCard from "@/components/LoyaltyCard";
import { useHistory } from "@/contexts/HistoryContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useLoyalty } from "@/contexts/LoyaltyContext";

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateEmail, updatePhoto } = useProfile();

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à vos photos pour changer votre image de profil.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      await updatePhoto(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  const { history } = useHistory();
  const { stamps } = useLoyalty();

  const [emailModal, setEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState(profile.email);

  const totalFcfa = history.reduce((sum, o) => sum + (o.total ?? 0), 0);

  const initials = profile.name
    ? profile.name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "👑";

  const currentMonth = new Date().getMonth() + 1;
  const isBirthMonth = profile.birthMonth === currentMonth;

  const handleSaveEmail = async () => {
    const val = emailInput.trim().toLowerCase();
    if (val && !val.includes("@")) {
      Alert.alert("Email invalide", "Veuillez entrer une adresse email valide.");
      return;
    }
    await updateEmail(val);
    setEmailModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const menuItems = [
    {
      id: "whatsapp", emoji: "💬", label: "Support WhatsApp",
      subtitle: "Répond en moins de 5 min", color: "#25D366",
      onPress: () => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`),
    },
    {
      id: "telegram", emoji: "✈️", label: "Telegram",
      subtitle: CONTACT.telegramHandle, color: "#0088CC",
      onPress: () => Linking.openURL(CONTACT.telegram),
    },
    {
      id: "googlemaps", emoji: "⭐", label: "Laisser un avis Google",
      subtitle: "Partagez votre expérience", color: "#FACC15",
      onPress: () => Linking.openURL(CONTACT.googleMaps),
    },
    {
      id: "edit", emoji: "✏️", label: "Modifier mon profil",
      subtitle: "Nom, ville, email, anniversaire", color: colors.brand.gold,
      onPress: () => router.push("/welcome"),
    },
    {
      id: "terms", emoji: "📄", label: "Conditions d'utilisation",
      subtitle: "CGU et politique de confidentialité", color: colors.text.muted,
      onPress: () => Linking.openURL(CONTACT.website),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Bannière anniversaire */}
        {isBirthMonth && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 14 }}
            style={styles.birthdayBanner}
          >
            <Text style={styles.birthdayText}>🎂 Bon anniversaire {profile.name} ! Votre tampon bonus ce mois-ci est activé.</Text>
          </MotiView>
        )}

        {/* Carte profil */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.userCard}
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85} style={styles.avatarWrap}>
              {profile.photoUri ? (
                <Image source={{ uri: profile.photoUri }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarLetter}>{initials}</Text>
                </View>
              )}
              <View style={styles.avatarCamera}>
                <Text style={styles.avatarCameraIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{profile.name || "Membre Chreol Empire"}</Text>
              <Text style={styles.userCity}>{profile.city ? `📍 ${profile.city}` : ""}</Text>
              {profile.email ? (
                <TouchableOpacity onPress={() => { setEmailInput(profile.email); setEmailModal(true); }}>
                  <Text style={styles.userEmail}>{profile.email} ✏️</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => { setEmailInput(""); setEmailModal(true); }} style={styles.addEmailBtn}>
                  <Text style={styles.addEmailText}>+ Ajouter un email</Text>
                </TouchableOpacity>
              )}
              {profile.birthMonth && (
                <Text style={styles.userBirth}>🎂 {MONTHS[profile.birthMonth - 1]}</Text>
              )}
            </View>
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>👑 VIP</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{history.length}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stamps}</Text>
              <Text style={styles.statLabel}>Tampons</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.brand.gold }]}>
                {totalFcfa > 0 ? (totalFcfa / 1000).toFixed(0) + "k" : "0"}
              </Text>
              <Text style={styles.statLabel}>FCFA total</Text>
            </View>
          </View>
        </MotiView>

        {/* Carte fidélité */}
        <View style={styles.loyaltyWrap}>
          <LoyaltyCard />
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, i) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateX: -16 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 100 + i * 70, type: "timing", duration: 320 }}
            >
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={item.onPress}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        <Text style={styles.version}>Chreol Empire v1.0.0 · 🇨🇲 Douala</Text>
      </ScrollView>

      {/* Modal email */}
      <Modal visible={emailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📧 Votre adresse email</Text>
            <Text style={styles.modalSub}>Pour recevoir vos confirmations et offres exclusives.</Text>
            <TextInput
              style={styles.modalInput}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="exemple@gmail.com"
              placeholderTextColor={colors.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEmailModal(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveEmail}>
                <Text style={styles.modalSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.4 },

  birthdayBanner: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: "#C9A84C22", borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.brand.gold + "66",
    padding: 14,
  },
  birthdayText: { fontSize: 13, color: colors.brand.goldDark, fontWeight: "700", textAlign: "center" },

  userCard: {
    marginHorizontal: 16,
    backgroundColor: colors.bg.card,
    borderRadius: radius["2xl"],
    padding: 20,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 20,
  },
  avatarSection: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatarImg: { width: 60, height: 60, borderRadius: 30 },
  avatarFallback: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.brand.gold,
    alignItems: "center", justifyContent: "center",
  },
  avatarLetter: { fontSize: 22, fontWeight: "800", color: "#0A0A0A" },
  avatarCamera: {
    position: "absolute", bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5, borderColor: colors.brand.gold,
    alignItems: "center", justifyContent: "center",
  },
  avatarCameraIcon: { fontSize: 11 },
  userName: { fontSize: 17, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.3 },
  userCity: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
  userEmail: { fontSize: 12, color: colors.brand.gold, marginTop: 4 },
  userBirth: { fontSize: 11, color: colors.text.muted, marginTop: 3 },
  addEmailBtn: { marginTop: 6, alignSelf: "flex-start" },
  addEmailText: { fontSize: 12, color: colors.brand.gold, fontWeight: "700" },
  vipBadge: {
    backgroundColor: colors.brand.goldLight,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.brand.gold + "55",
    paddingHorizontal: 10, paddingVertical: 4,
  },
  vipText: { fontSize: 11, fontWeight: "800", color: colors.brand.gold },

  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl, padding: 16,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.text.primary },
  statLabel: { fontSize: 11, color: colors.text.muted, marginTop: 3 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border.default },

  loyaltyWrap: { marginHorizontal: 16, marginTop: 16 },

  menuSection: { padding: 16, gap: 8 },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl, padding: 16,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 12,
  },
  menuIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  menuEmoji: { fontSize: 20 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: colors.text.primary },
  menuSubtitle: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  menuArrow: { fontSize: 20, color: colors.text.muted },

  version: { textAlign: "center", color: colors.text.muted, fontSize: 12, paddingBottom: 20 },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.bg.card,
    borderTopLeftRadius: radius["2xl"], borderTopRightRadius: radius["2xl"],
    padding: 24, gap: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  modalSub: { fontSize: 13, color: colors.text.secondary },
  modalInput: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: colors.text.primary,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalCancel: {
    flex: 1, borderRadius: radius.full, borderWidth: 1.5,
    borderColor: colors.border.default, paddingVertical: 14, alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "700", color: colors.text.secondary },
  modalSave: {
    flex: 2, backgroundColor: colors.brand.gold,
    borderRadius: radius.full, paddingVertical: 14, alignItems: "center",
  },
  modalSaveText: { fontSize: 15, fontWeight: "900", color: "#0A0A0A" },
});
