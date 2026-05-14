import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Linking, ScrollView, Modal, TextInput,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";
import LoyaltyCard from "@/components/LoyaltyCard";
import { useHistory } from "@/contexts/HistoryContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useLoyalty } from "@/contexts/LoyaltyContext";

const IC_TG = require("../../assets/telegram.webp");

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateEmail, updatePhoto, resetProfile } = useProfile();
  const { history } = useHistory();
  const { stamps } = useLoyalty();

  const [emailModal, setEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState(profile.email);

  const [waModal, setWaModal] = useState(false);
  const [waPseudo, setWaPseudo] = useState(profile.name);
  const [waMessage, setWaMessage] = useState("");

  const totalFcfa = history.reduce((sum, o) => sum + (o.total ?? 0), 0);

  const initials = profile.name
    ? profile.name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "👑";

  const currentMonth = new Date().getMonth() + 1;
  const isBirthMonth = profile.birthMonth === currentMonth;

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

  const handleSendWa = () => {
    if (!waMessage.trim()) {
      Alert.alert("Message vide", "Veuillez écrire votre message avant d'envoyer.");
      return;
    }
    const pseudo = waPseudo.trim() || "Client";
    const msg = `Bonjour Chreol Empire 👋,\n\n*Pseudo :* ${pseudo}\n\n*Message :*\n${waMessage.trim()}\n\n_Envoyé depuis l'application Chreol Empire_`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
    setWaModal(false);
    setWaMessage("");
  };

  const handleLogout = () => {
    Alert.alert(
      "Se déconnecter",
      "Votre profil local sera réinitialisé. Votre historique de commandes est conservé.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter", style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetProfile();
            router.replace("/welcome");
          },
        },
      ]
    );
  };

  type MenuItem = {
    id: string;
    emoji: string;
    image?: any;
    label: string;
    subtitle: string;
    color: string;
    onPress: () => void;
    danger?: boolean;
  };

  type MenuSection = {
    title: string;
    items: MenuItem[];
  };

  const SECTIONS: MenuSection[] = [
    {
      title: "Support",
      items: [
        {
          id: "whatsapp", emoji: "💬", label: "Support WhatsApp",
          subtitle: "Répond en moins de 5 min", color: "#25D366",
          onPress: () => { setWaPseudo(profile.name); setWaModal(true); },
        },
        {
          id: "telegram", emoji: "", image: IC_TG, label: "Telegram",
          subtitle: CONTACT.telegramHandle, color: "#0088CC",
          onPress: () => Linking.openURL(CONTACT.telegram),
        },
      ],
    },
    {
      title: "Chreol Empire",
      items: [
        {
          id: "website", emoji: "🌐", label: "Site officiel",
          subtitle: "www.chreolempire.com", color: colors.brand.gold,
          onPress: () => Linking.openURL(CONTACT.website),
        },
        {
          id: "bot", emoji: "🤖", label: "Bot Telegram",
          subtitle: "@chreolempireBot", color: "#0088CC",
          onPress: () => Linking.openURL("https://t.me/chreolempireBot"),
        },
        {
          id: "avis", emoji: "⭐", label: "Laisser un avis Google",
          subtitle: "Partagez votre expérience", color: "#FACC15",
          onPress: () => Linking.openURL(CONTACT.googleMaps),
        },
      ],
    },
    {
      title: "Informations",
      items: [
        {
          id: "about", emoji: "ℹ️", label: "À Propos",
          subtitle: "Qui sommes-nous ?", color: colors.brand.gold,
          onPress: () => Linking.openURL(CONTACT.aboutUrl),
        },
        {
          id: "faq", emoji: "❓", label: "FAQ",
          subtitle: "Questions fréquentes", color: "#60A5FA",
          onPress: () => Linking.openURL(CONTACT.faqUrl),
        },
        {
          id: "contact", emoji: "📞", label: "Contact",
          subtitle: "Nos coordonnées", color: "#26A17B",
          onPress: () => Linking.openURL(CONTACT.contactUrl),
        },
        {
          id: "sitemap", emoji: "🗺️", label: "Plan du site",
          subtitle: "Toutes les sections de l'app", color: colors.text.muted,
          onPress: () => router.push("/sitemap"),
        },
      ],
    },
    {
      title: "Légal",
      items: [
        {
          id: "terms", emoji: "📜", label: "Conditions d'utilisation",
          subtitle: "CGU et politique de confidentialité", color: colors.text.muted,
          onPress: () => router.push("/terms"),
        },
      ],
    },
    {
      title: "Mon Compte",
      items: [
        {
          id: "edit", emoji: "✏️", label: "Modifier mon profil",
          subtitle: "Nom, ville, email, anniversaire", color: colors.brand.gold,
          onPress: () => router.push("/welcome"),
        },
        {
          id: "logout", emoji: "🔴", label: "Se déconnecter",
          subtitle: "Réinitialiser le profil local", color: "#EF4444",
          onPress: handleLogout, danger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

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

        {/* Sections menu */}
        {SECTIONS.map((section, si) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            {section.items.map((item, i) => (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateX: -16 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: si * 40 + i * 60, type: "timing", duration: 300 }}
              >
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={item.onPress}>
                  <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
                    {item.image
                      ? <Image source={item.image} style={styles.menuImg} contentFit="contain" />
                      : <Text style={styles.menuEmoji}>{item.emoji}</Text>}
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, item.danger && { color: "#EF4444" }]}>{item.label}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Text style={[styles.menuArrow, item.danger && { color: "#EF4444" }]}>›</Text>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        ))}

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

      {/* Modal WhatsApp Support */}
      <Modal visible={waModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>💬 Support WhatsApp</Text>
            <Text style={styles.modalSub}>Notre équipe vous répond en moins de 5 minutes.</Text>

            <Text style={styles.fieldLabel}>Votre pseudo</Text>
            <TextInput
              style={styles.modalInput}
              value={waPseudo}
              onChangeText={setWaPseudo}
              placeholder="Votre prénom ou pseudo"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="words"
            />

            <Text style={styles.fieldLabel}>Votre message *</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={waMessage}
              onChangeText={setWaMessage}
              placeholder="Décrivez votre demande, problème ou question..."
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setWaModal(false); setWaMessage(""); }}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSave, { backgroundColor: "#25D366" }]} onPress={handleSendWa}>
                <Text style={styles.modalSaveText}>Envoyer 📲</Text>
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

  menuSection: { paddingHorizontal: 16, paddingTop: 20, gap: 8 },
  sectionTitle: {
    fontSize: 11, fontWeight: "800", color: colors.text.muted,
    letterSpacing: 0.8, marginBottom: 2,
  },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl, padding: 16,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 12,
  },
  menuIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  menuEmoji: { fontSize: 20 },
  menuImg: { width: 24, height: 24, borderRadius: 4 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: colors.text.primary },
  menuSubtitle: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  menuArrow: { fontSize: 20, color: colors.text.muted },

  version: { textAlign: "center", color: colors.text.muted, fontSize: 12, paddingTop: 20, paddingBottom: 8 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: colors.bg.card,
    borderTopLeftRadius: radius["2xl"], borderTopRightRadius: radius["2xl"],
    padding: 24, gap: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  modalSub: { fontSize: 13, color: colors.text.secondary, marginTop: -6 },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  modalInput: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: colors.text.primary,
  },
  textArea: { height: 110, paddingTop: 14 },
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
