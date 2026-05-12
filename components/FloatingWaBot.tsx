import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Modal, Pressable } from "react-native";
import { usePathname } from "expo-router";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

const CONTEXT_MESSAGES: Record<string, { icon: string; label: string; msg: string }> = {
  "/":                      { icon: "🏠", label: "Accueil",           msg: "Bonjour Chreol Empire 👋, je suis sur votre application et j'aimerais passer une commande." },
  "/(tabs)/index":          { icon: "🏠", label: "Accueil",           msg: "Bonjour Chreol Empire 👋, je suis sur votre application et j'aimerais passer une commande." },
  "/(tabs)/services":       { icon: "📋", label: "Services",          msg: "Bonjour Chreol Empire 👋, j'aimerais avoir des informations sur vos services." },
  "/(tabs)/orders":         { icon: "📦", label: "Historique",        msg: "Bonjour Chreol Empire 👋, je voudrais suivre l'état de ma commande." },
  "/(tabs)/paiement":       { icon: "💳", label: "Paiement",          msg: "Bonjour Chreol Empire 👋, j'ai une question sur vos modes de paiement." },
  "/(tabs)/profile":        { icon: "👤", label: "Mon compte",        msg: "Bonjour Chreol Empire 👋, j'ai besoin d'aide avec mon compte." },
  "/services/cartes-cadeaux":{ icon: "🎮", label: "Cartes cadeaux",   msg: "Bonjour Chreol Empire 👋, je suis intéressé par vos cartes cadeaux. Pouvez-vous m'aider ?" },
  "/services/crypto":       { icon: "₿",  label: "Crypto",           msg: "Bonjour Chreol Empire 👋, je voudrais acheter ou vendre de la crypto. Quels sont vos taux ?" },
  "/services/paypal":       { icon: "💶", label: "PayPal",            msg: "Bonjour Chreol Empire 👋, j'aimerais faire une opération PayPal. Quel est le taux du jour ?" },
  "/services/coupons":      { icon: "🎟️", label: "Coupons",          msg: "Bonjour Chreol Empire 👋, je veux échanger un coupon PCS ou Transcash." },
  "/services/uba":          { icon: "🏦", label: "UBA",              msg: "Bonjour Chreol Empire 👋, j'ai besoin d'aide pour une opération UBA." },
  "/cart":                  { icon: "🛒", label: "Mon panier",        msg: "Bonjour Chreol Empire 👋, j'ai une question sur ma commande en cours." },
};

const DEFAULT_CTX = { icon: "💬", label: "WhatsApp", msg: "Bonjour Chreol Empire 👋, j'ai besoin d'aide." };

export default function FloatingWaBot() {
  const pathname = usePathname();
  const [bubbleOpen, setBubbleOpen] = useState(false);

  const ctx = CONTEXT_MESSAGES[pathname] ?? DEFAULT_CTX;

  const openWA = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBubbleOpen(false);
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(ctx.msg)}`);
  };

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBubbleOpen(v => !v);
  };

  return (
    <>
      {/* Bubble tooltip */}
      {bubbleOpen && (
        <>
          <Pressable style={styles.bubbleBackdrop} onPress={() => setBubbleOpen(false)} />
          <MotiView
            from={{ opacity: 0, scale: 0.85, translateY: 10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 16 }}
            style={styles.bubble}
          >
            <Text style={styles.bubbleContext}>{ctx.icon} {ctx.label}</Text>
            <Text style={styles.bubbleMsg} numberOfLines={2}>{ctx.msg}</Text>
            <TouchableOpacity style={styles.bubbleBtn} onPress={openWA} activeOpacity={0.85}>
              <Text style={styles.bubbleBtnText}>💬 Envoyer sur WhatsApp</Text>
            </TouchableOpacity>
          </MotiView>
        </>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={toggle} activeOpacity={0.85}>
        <MotiView
          animate={{ rotate: bubbleOpen ? "45deg" : "0deg" }}
          transition={{ type: "timing", duration: 200 }}
        >
          <Text style={styles.fabIcon}>{bubbleOpen ? "✕" : "🤖"}</Text>
        </MotiView>
        {!bubbleOpen && (
          <View style={styles.fabDot} />
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 90, left: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#1A1A2E",
    borderWidth: 1.5, borderColor: colors.brand.gold + "88",
    alignItems: "center", justifyContent: "center",
    elevation: 10,
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 8,
    zIndex: 100,
  },
  fabIcon: { fontSize: 22 },
  fabDot: {
    position: "absolute", top: 6, right: 6,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#25D366",
    borderWidth: 1.5, borderColor: "#0A0A0A",
  },
  bubbleBackdrop: {
    position: "absolute", inset: 0,
    zIndex: 99,
  },
  bubble: {
    position: "absolute",
    bottom: 152, left: 14,
    width: 260,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.brand.gold + "55",
    padding: 14, gap: 8,
    zIndex: 101,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 14,
  },
  bubbleContext: { fontSize: 11, fontWeight: "800", color: colors.brand.gold },
  bubbleMsg: { fontSize: 12, color: colors.text.secondary, lineHeight: 18 },
  bubbleBtn: {
    backgroundColor: "#25D366",
    borderRadius: radius.full,
    paddingVertical: 10, alignItems: "center",
    marginTop: 2,
  },
  bubbleBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});
