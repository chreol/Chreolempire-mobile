import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";

type SitemapNode = {
  label: string;
  emoji: string;
  route?: string;
  children?: { label: string; route?: string }[];
};

const STRUCTURE: SitemapNode[] = [
  {
    label: "Accueil",
    emoji: "🏠",
    route: "/(tabs)/",
    children: [
      { label: "Taux en direct (RateTicker)" },
      { label: "Accès rapide aux services" },
      { label: "Section actualités & promos" },
      { label: "Bouton panier flottant" },
    ],
  },
  {
    label: "Services",
    emoji: "🛍️",
    route: "/(tabs)/services",
    children: [
      { label: "Cartes Cadeaux (PSN, iTunes, Roblox, Steam…)", route: "/services/cartes-cadeaux" },
      { label: "UBA Cameroun — Achat & Recharge", route: "/services/uba" },
      { label: "Coupons — PCS Mastercard & Transcash", route: "/services/coupons" },
      { label: "Crypto & PayPal — Achat / Vente", route: "/services/crypto" },
      { label: "PayPal Europe — Solde", route: "/services/paypal" },
      { label: "Paiement Factures — Canal+, Eneo, Camwater…", route: "/services/factures" },
    ],
  },
  {
    label: "Panier & Paiement",
    emoji: "🛒",
    route: "/cart",
    children: [
      { label: "Récapitulatif des articles" },
      { label: "Choix du mode de paiement (Orange Money / MTN MoMo)" },
      { label: "Envoi de commande sur WhatsApp" },
    ],
  },
  {
    label: "Historique des commandes",
    emoji: "📋",
    route: "/(tabs)/orders",
    children: [
      { label: "Liste de toutes les commandes" },
      { label: "Statut modifiable (En attente, En traitement, Terminé, Annulé)" },
      { label: "Bouton « Relancer la commande » sur WhatsApp" },
    ],
  },
  {
    label: "Paiement",
    emoji: "💳",
    route: "/(tabs)/paiement",
    children: [
      { label: "Orange Money — Numéros & instructions" },
      { label: "MTN MoMo — Numéros & instructions" },
    ],
  },
  {
    label: "Mon Profil",
    emoji: "👤",
    route: "/(tabs)/profile",
    children: [
      { label: "Carte de fidélité (tampons & récompenses)" },
      { label: "Statistiques (commandes, FCFA total)" },
      { label: "Support WhatsApp — formulaire intégré" },
      { label: "Telegram — @chreolempire0" },
      { label: "Site officiel — chreolempire.com" },
      { label: "Bot Telegram — @chreolempireBot" },
      { label: "Avis Google Maps" },
      { label: "Modifier mon profil" },
      { label: "Se déconnecter" },
    ],
  },
  {
    label: "Informations",
    emoji: "ℹ️",
    children: [
      { label: "À Propos de Chreol Empire" },
      { label: "FAQ — Questions fréquentes" },
      { label: "Contact" },
      { label: "Conditions d'utilisation (CGU)", route: "/terms" },
      { label: "Plan du site", route: "/sitemap" },
    ],
  },
  {
    label: "Accueil / Onboarding",
    emoji: "🌟",
    route: "/welcome",
    children: [
      { label: "Étape 1 — Prénom & Ville" },
      { label: "Étape 2 — Email (optionnel)" },
      { label: "Étape 3 — Mois de naissance (optionnel)" },
    ],
  },
];

export default function SitemapScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan du site</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Retrouvez ici l'ensemble des sections et fonctionnalités disponibles dans l'application Chreol Empire.
        </Text>

        {STRUCTURE.map((node, i) => (
          <View key={i} style={styles.nodeCard}>
            <View style={styles.nodeHeader}>
              <Text style={styles.nodeEmoji}>{node.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.nodeLabel}>{node.label}</Text>
                {node.route && (
                  <Text style={styles.nodeRoute}>{node.route}</Text>
                )}
              </View>
            </View>

            {node.children && node.children.length > 0 && (
              <View style={styles.childrenList}>
                {node.children.map((child, j) => (
                  <View key={j} style={styles.childRow}>
                    <View style={styles.childDot} />
                    <Text style={styles.childLabel}>{child.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>Statistiques de l'application</Text>
          <View style={styles.statsGrid}>
            {[
              { value: "8", label: "Sections" },
              { value: "6", label: "Services" },
              { value: "5", label: "Onglets" },
              { value: "2", label: "Modaux" },
            ].map(s => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>Chreol Empire · Application mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.bg.card,
    borderWidth: 1, borderColor: colors.border.default,
    alignItems: "center", justifyContent: "center",
  },
  backIcon: { fontSize: 28, color: colors.text.primary, lineHeight: 34 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: colors.text.primary },

  content: { padding: 16, gap: 10, paddingBottom: 40 },

  intro: {
    fontSize: 13, color: colors.text.secondary, lineHeight: 20,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl, padding: 14,
    borderWidth: 1, borderColor: colors.border.default,
    marginBottom: 4,
  },

  nodeCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    overflow: "hidden",
  },
  nodeHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14,
    backgroundColor: colors.bg.elevated,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  nodeEmoji: { fontSize: 22 },
  nodeLabel: { fontSize: 15, fontWeight: "800", color: colors.text.primary },
  nodeRoute: { fontSize: 11, color: colors.brand.gold, fontFamily: "monospace", marginTop: 2 },

  childrenList: { padding: 12, gap: 6 },
  childRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  childDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.brand.gold + "88", flexShrink: 0,
  },
  childLabel: { fontSize: 13, color: colors.text.secondary, flex: 1, lineHeight: 18 },

  statsBox: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl, padding: 16,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 12, marginTop: 4,
  },
  statsTitle: { fontSize: 13, fontWeight: "800", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  statsGrid: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 26, fontWeight: "900", color: colors.brand.gold },
  statLabel: { fontSize: 11, color: colors.text.muted },

  footer: { fontSize: 12, color: colors.text.muted, textAlign: "center", paddingTop: 8 },
});
