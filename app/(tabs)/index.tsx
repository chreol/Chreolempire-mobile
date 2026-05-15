import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Linking, Dimensions, Modal, TextInput,
  KeyboardAvoidingView, Platform, Pressable, RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useState, useCallback } from "react";
import { colors, radius } from "@/constants/theme";
import RateTicker from "@/components/RateTicker";
import PromoBanner from "@/components/PromoBanner";
import { CONTACT } from "@/constants/services";
import { useHistory } from "@/contexts/HistoryContext";

const { width } = Dimensions.get("window");
const CARD_W = (width - 44) / 2;

const LOGO         = require("../../assets/chreolempire logo avec contact m.webp");
const STORE_BG     = require("../../assets/boutique.webp");
const IMG_PSN      = require("../../assets/PlayStation_Store_Card.webp");
const IMG_ITU      = require("../../assets/itunes-gifts-for-business-hero_2x.webp");
const IMG_ROB      = require("../../assets/App-icon-roblox.webp");
const IMG_UBA      = require("../../assets/UBA Cameroun logo.png");
const IMG_UBA_CARD = require("../../assets/Carte UBA Cameroun pour RECHARGE.webp");
const IMG_TRANS    = require("../../assets/contenu-pack-transcash.webp");
const IMG_CRYPTO   = require("../../assets/Monnaie Crypto Chreol Empire en cfa mobile money.webp");
// Réseaux sociaux
const IC_WA        = require("../../assets/whatsapp.webp");
const IC_INSTA     = require("../../assets/instagram.webp");
const IC_TG        = require("../../assets/telegram.webp");
const IC_X         = require("../../assets/x-twitter.webp");
const IC_EMAIL     = require("../../assets/email.webp");

export default function HomeScreen() {
  const router = useRouter();
  const { history } = useHistory();

  const [contactOpen, setContactOpen] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [msgText, setMsgText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [promoKey, setPromoKey] = useState(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPromoKey(k => k + 1);
    await new Promise<void>(r => setTimeout(r, 900));
    setRefreshing(false);
  }, []);

  const openWhatsApp = () =>
    Linking.openURL(
      `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Bonjour Chreol Empire, je voudrais commander")}`
    );

  const sendContact = () => {
    if (!pseudo.trim() && !msgText.trim()) return;
    const txt = `Pseudo: ${pseudo.trim() || "—"}\nMessage: ${msgText.trim()}`;
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(txt)}`);
    setContactOpen(false);
    setPseudo("");
    setMsgText("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoRing}>
            <Image source={LOGO} style={styles.logo} contentFit="contain" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Chreol Empire</Text>
            <Text style={styles.headerSlogan} numberOfLines={1}>
              L'Autorité des Services Digitaux au 🇨🇲
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Contact WhatsApp */}
          <TouchableOpacity style={styles.waBtn} onPress={() => setContactOpen(true)} activeOpacity={0.85}>
            <Text style={styles.waBtnText}>💬</Text>
          </TouchableOpacity>
          {/* Panier */}
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push("/(tabs)/orders")} activeOpacity={0.85}>
            <Text style={styles.cartEmoji}>🛒</Text>
            {history.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{history.length > 9 ? "9+" : history.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Modal Contact ── */}
      <Modal visible={contactOpen} transparent animationType="slide" onRequestClose={() => setContactOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setContactOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalWrap}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💬 Contacter via WhatsApp</Text>
              <Text style={styles.modalSub}>Nous répondons en moins de 5 min</Text>
            </View>

            <Text style={styles.inputLabel}>Votre pseudo / nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Jean-Pierre"
              placeholderTextColor={colors.text.muted}
              value={pseudo}
              onChangeText={setPseudo}
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Votre message</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Ex: Je veux acheter une carte PSN 20€..."
              placeholderTextColor={colors.text.muted}
              value={msgText}
              onChangeText={setMsgText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.sendBtn, (!pseudo.trim() && !msgText.trim()) && styles.sendBtnDisabled]}
              onPress={sendContact}
              activeOpacity={0.85}
            >
              <Text style={styles.sendBtnText}>📲 Envoyer sur WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Banderole taux défilante ── */}
      <RateTicker />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.gold} colors={[colors.brand.gold]} />
        }
      >

        {/* ── Hero Banner (photo seule, sans overlays) ── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 700 }}
          style={styles.hero}
        >
          <Image source={STORE_BG} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={300} />
          {/* Léger gradient bas pour lisibilité */}
          <View style={styles.heroGradient} />
        </MotiView>

        {/* ── Bannière promotions ── */}
        <PromoBanner key={promoKey} />

        {/* ── Service Cards 2×2 ── */}
        <View style={styles.grid}>

          {/* Card 1 — Cartes Cadeaux (bande images PSN/iTunes/Roblox) */}
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350, delay: 100 }} style={styles.cardWrap}>
            <TouchableOpacity style={styles.cardImg} activeOpacity={0.85}
              onPress={() => router.push("/services/cartes-cadeaux")}>
              <View style={styles.giftBand}>
                <Image source={IMG_PSN} style={styles.giftBandImg} contentFit="contain" />
                <Image source={IMG_ITU} style={styles.giftBandImg} contentFit="contain" />
                <Image source={IMG_ROB} style={styles.giftBandImgSm} contentFit="contain" />
              </View>
              <View style={styles.cardImgBody}>
                <Text style={styles.cardTitle}>{"CARTES CADEAUX\n(PSN, ITUNES, ROBLOX, ETC.)"}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.cardSub}>Achat et activation de vos cartes</Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          </MotiView>

          {/* Card 2 — UBA (logo + carte) */}
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350, delay: 160 }} style={styles.cardWrap}>
            <TouchableOpacity style={styles.cardImg} activeOpacity={0.85}
              onPress={() => router.push("/services/uba")}>
              <View style={styles.ubaBand}>
                <Image source={IMG_UBA} style={styles.ubaLogo} contentFit="contain" />
                <Image source={IMG_UBA_CARD} style={styles.ubaCard} contentFit="contain" />
              </View>
              <View style={styles.cardImgBody}>
                <Text style={styles.cardTitle}>{"ACHAT ET RECHARGE\nUBA CAMEROUN"}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.cardSub}>Vos opérations UBA en un clic</Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          </MotiView>

          {/* Card 3 — Coupons (contenu-pack-transcash) */}
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350, delay: 220 }} style={styles.cardWrap}>
            <TouchableOpacity style={styles.cardImg} activeOpacity={0.85}
              onPress={() => router.push("/services/coupons")}>
              <Image source={IMG_TRANS} style={styles.imgTop} contentFit="cover" transition={300} />
              <View style={styles.cardImgBody}>
                <Text style={styles.cardTitle}>{"ÉCHANGE COUPONS\n(TRANSCASH, PCS)"}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.cardSub}>Convertissez vos coupons</Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          </MotiView>

          {/* Card 4 — Crypto/PayPal (image locale) */}
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350, delay: 280 }} style={styles.cardWrap}>
            <TouchableOpacity style={styles.cardImg} activeOpacity={0.85}
              onPress={() => router.push("/services/crypto")}>
              <Image source={IMG_CRYPTO} style={styles.imgTop} contentFit="cover" transition={300} />
              <View style={styles.cardImgBody}>
                <Text style={styles.cardTitle}>{"ÉCHANGE ET VENTE\nCRYPTO/PAYPAL"}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.cardSub}>Achat, vente, et conversion</Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          </MotiView>

        </View>

        {/* ── CTA Section ── */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Bienvenue sur votre Empire mobile !</Text>
          <Text style={styles.ctaSub}>
            Cartes cadeaux · Crypto · Recharge UBA · Coupons{"\n"}Livraison en 15–30 min via WhatsApp
          </Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={openWhatsApp} activeOpacity={0.85}>
            <Text style={styles.ctaBtnTxt}>⚡ Commander maintenant</Text>
          </TouchableOpacity>

          {/* Réseaux sociaux */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialChip}
              onPress={() => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}`)}>
              <Image source={IC_WA} style={styles.socialIcon} contentFit="contain" />
              <Text style={styles.socialLabel}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialChip}
              onPress={() => Linking.openURL(CONTACT.telegram)}>
              <Image source={IC_TG} style={styles.socialIcon} contentFit="contain" />
              <Text style={styles.socialLabel}>Telegram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialChip}
              onPress={() => Linking.openURL("https://www.instagram.com/chreolempire")}>
              <Image source={IC_INSTA} style={styles.socialIcon} contentFit="contain" />
              <Text style={styles.socialLabel}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialChip}
              onPress={() => Linking.openURL("https://x.com/chreolempire")}>
              <Image source={IC_X} style={styles.socialIcon} contentFit="contain" />
              <Text style={styles.socialLabel}>X</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialChip}
              onPress={() => Linking.openURL(`mailto:${CONTACT.email}`)}>
              <Image source={IC_EMAIL} style={styles.socialIcon} contentFit="contain" />
              <Text style={styles.socialLabel}>Email</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => Linking.openURL("https://www.google.com/maps/place//data=!4m2!3m1!1s0x106113004d67824f:0x3fb825f9b60b9a06?sa=X&ved=1t:8290&ictx=111")}>
            <Text style={styles.address}>📍 {CONTACT.address}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── FAB WhatsApp ── */}
      <TouchableOpacity style={styles.fabWa} onPress={() => setContactOpen(true)} activeOpacity={0.85}>
        <Image source={IC_WA} style={styles.fabWaImg} contentFit="contain" />
      </TouchableOpacity>

      {/* ── FAB Panier (invisible si vide) ── */}
      {history.length > 0 && (
        <TouchableOpacity style={styles.fabCart} onPress={() => router.push("/(tabs)/orders")} activeOpacity={0.85}>
          <Text style={styles.fabCartEmoji}>🛒</Text>
          <View style={styles.fabCartBadge}>
            <Text style={styles.fabCartBadgeTxt}>{history.length}</Text>
          </View>
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  // ── Header ──
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: colors.bg.primary,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border.default,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logoRing: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: colors.brand.gold,
    overflow: "hidden",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 8, elevation: 6,
  },
  logo: { width: 42, height: 42 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.3 },
  headerSlogan: { fontSize: 9, color: colors.brand.gold, fontWeight: "600", marginTop: 1, letterSpacing: 0.1 },

  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  waBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#25D366",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#25D366", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  waBtnText: { fontSize: 18 },
  cartBtn: { padding: 4, position: "relative" },
  cartEmoji: { fontSize: 24 },
  cartBadge: {
    position: "absolute", top: 0, right: 0,
    backgroundColor: "#E50914", borderRadius: 9,
    minWidth: 17, height: 17,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  cartBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  // ── Modal Contact ──
  modalBackdrop: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalWrap: { flex: 1, justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: colors.bg.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    borderTopWidth: 1, borderColor: colors.border.default,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border.strong,
    alignSelf: "center", marginBottom: 20,
  },
  modalHeader: { marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.text.primary },
  modalSub: { fontSize: 13, color: colors.text.secondary, marginTop: 4 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: colors.brand.gold, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.md, padding: 14,
    borderWidth: 1, borderColor: colors.border.default,
    color: colors.text.primary, fontSize: 14,
  },
  inputMulti: { minHeight: 100, paddingTop: 12 },
  sendBtn: {
    marginTop: 20,
    backgroundColor: "#25D366", borderRadius: radius.full,
    paddingVertical: 15, alignItems: "center",
    shadowColor: "#25D366", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  // ── Hero ──
  hero: {
    height: 210, marginHorizontal: 16, marginTop: 14,
    borderRadius: radius.xl, overflow: "hidden",
    backgroundColor: colors.bg.elevated,
  },
  heroGradient: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  // ── Grid ──
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  cardWrap: { width: CARD_W },

  cardImg: {
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.default,
    overflow: "hidden",
    shadowColor: colors.brand.gold, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  imgTop: { width: "100%", height: 82 },
  cardImgBody: { padding: 10 },
  cardTitle: { fontSize: 11, fontWeight: "800", color: colors.text.primary, lineHeight: 15, letterSpacing: 0.1 },
  cardRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8 },
  cardSub: { fontSize: 10, color: colors.text.secondary, flex: 1, lineHeight: 13 },
  arrow: { fontSize: 20, color: colors.brand.gold, fontWeight: "700", marginLeft: 4 },

  // Card 1 — bande PSN/iTunes/Roblox
  giftBand: {
    height: 82, backgroundColor: colors.bg.elevated,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 8,
  },
  giftBandImg: { width: 58, height: 68, borderRadius: 6 },
  giftBandImgSm: { width: 38, height: 38, borderRadius: 10 },

  // Card 2 — UBA logo + carte
  ubaBand: {
    height: 82, backgroundColor: colors.bg.elevated,
    flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 10,
  },
  ubaLogo: { width: 60, height: 50 },
  ubaCard: { width: 72, height: 52, borderRadius: 6 },

  // ── CTA Section ──
  ctaSection: {
    marginHorizontal: 16, marginTop: 20,
    backgroundColor: colors.bg.card,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: colors.border.default,
    alignItems: "center", gap: 12,
  },
  ctaTitle: {
    fontSize: 18, fontWeight: "900", color: colors.text.primary,
    textAlign: "center", letterSpacing: -0.3,
  },
  ctaSub: {
    fontSize: 13, color: colors.text.secondary,
    textAlign: "center", lineHeight: 19,
  },
  ctaBtn: {
    backgroundColor: colors.brand.gold,
    borderRadius: radius.full, paddingVertical: 13, paddingHorizontal: 32,
    shadowColor: colors.brand.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  ctaBtnTxt: { color: "#0A0A0A", fontSize: 15, fontWeight: "900", letterSpacing: 0.2 },

  // Réseaux sociaux
  socialRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 },
  socialChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.border.default,
  },
  socialIcon: { width: 20, height: 20, borderRadius: 4 },
  socialLabel: { fontSize: 12, color: colors.text.secondary, fontWeight: "600" },

  address: { fontSize: 11, color: colors.brand.gold, textAlign: "center", marginTop: 4, textDecorationLine: "underline" },

  // ── FABs ──
  fabWa: {
    position: "absolute", bottom: 84, right: 20,
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: "#25D366",
    alignItems: "center", justifyContent: "center",
    elevation: 10,
    shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 14,
    overflow: "hidden",
  },
  fabWaImg: { width: 62, height: 62 },

  fabCart: {
    position: "absolute", bottom: 154, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#2563EB",
    alignItems: "center", justifyContent: "center",
    elevation: 8,
    shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12,
  },
  fabCartEmoji: { fontSize: 24 },
  fabCartBadge: {
    position: "absolute", top: 2, right: 2,
    backgroundColor: "#EF4444", borderRadius: 9,
    minWidth: 18, height: 18,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: colors.bg.primary,
  },
  fabCartBadgeTxt: { color: "#fff", fontSize: 9, fontWeight: "800" },
});
