import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking,
  Alert, Clipboard, Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

// ─── Assets ───────────────────────────────────────────────────────────────────
const IMG: Record<string, any> = {
  mtn:     require("../../assets/MTN Mobile Money (MoMo) Payment .png"),
  orange:  require("../../assets/orange-money.png"),
  paypal:  require("../../assets/Paypal.jpg"),
  neero:   require("../../assets/neero paiement.jpg"),
  especes: require("../../assets/Espece.png"),
  crypto:  require("../../assets/Cryptomonnaies-visuel.jpg"),
  uba:     require("../../assets/ubaCameroun_logo.png"),
};

// ─── WhatsApp subjects ────────────────────────────────────────────────────────
const WA_SUBJECTS = [
  { id: "preuve",   emoji: "📸", label: "Preuve de paiement",       msg: "Bonjour Chreol Empire 👋,\nVoici ma preuve de paiement pour ma commande :" },
  { id: "suivi",    emoji: "📦", label: "Suivi de commande",         msg: "Bonjour Chreol Empire 👋,\nJe voudrais avoir un suivi sur ma commande." },
  { id: "question", emoji: "❓", label: "Question sur un service",   msg: "Bonjour Chreol Empire 👋,\nJ'ai une question concernant vos services :" },
  { id: "taux",     emoji: "💱", label: "Taux du jour",              msg: "Bonjour Chreol Empire 👋,\nQuels sont vos taux du jour pour :" },
  { id: "rdv",      emoji: "🏪", label: "Rendez-vous au bureau",     msg: "Bonjour Chreol Empire 👋,\nJe souhaiterais passer au bureau. Êtes-vous disponible ?" },
  { id: "autre",    emoji: "💬", label: "Autre demande",             msg: "Bonjour Chreol Empire 👋," },
];

// ─── Payment methods data ──────────────────────────────────────────────────────
type Step    = { icon: string; text: string };
type InfoRow = { label: string; value: string; highlight?: boolean; copyable?: boolean };

interface PayMethod {
  id: string;
  name: string;
  tagline: string;
  color: string;
  badge?: string;
  rows: InfoRow[];
  steps: Step[];
  actions?: Array<{ label: string; color: string; onPress: () => void }>;
}

const METHODS: PayMethod[] = [
  {
    id: "mtn",
    name: "MTN Mobile Money",
    tagline: "Flotte Marchand — Paiement instantané",
    color: "#FACC15",
    rows: [
      { label: "Numéro marchand", value: "672 416 141" },
      { label: "Nom affiché",     value: "ETS Content" },
      { label: "Code USSD",       value: "*126*14*672416141*MONTANT#", highlight: true, copyable: true },
      { label: "Délai",           value: "< 5 min" },
    ],
    steps: [
      { icon: "1️⃣", text: "Composez le code USSD sur votre téléphone MTN" },
      { icon: "2️⃣", text: "Remplacez MONTANT par le total exact de votre commande" },
      { icon: "3️⃣", text: "Confirmez avec votre code PIN MoMo" },
      { icon: "4️⃣", text: "Faites une capture du reçu et envoyez-la sur WhatsApp" },
    ],
    actions: [{ label: "📋 Copier le code USSD", color: "#FACC15", onPress: () => { Clipboard.setString("*126*14*672416141*MONTANT#"); Alert.alert("Copié !", "Remplacez MONTANT par votre total"); } }],
  },
  {
    id: "orange",
    name: "Orange Money",
    tagline: "Transfert UV Marchand",
    color: "#FF6600",
    rows: [
      { label: "Code marchand",   value: "518554" },
      { label: "Numéro marchand", value: "692 251 299" },
      { label: "Nom affiché",     value: "Ets Tagny" },
      { label: "Code USSD",       value: "#150*14*518554*692251299*MONTANT#", highlight: true, copyable: true },
      { label: "Délai",           value: "< 5 min" },
    ],
    steps: [
      { icon: "1️⃣", text: "Composez le code USSD sur votre téléphone Orange" },
      { icon: "2️⃣", text: "Remplacez MONTANT par le total exact de votre commande" },
      { icon: "3️⃣", text: "Confirmez avec votre code PIN Orange Money" },
      { icon: "4️⃣", text: "Faites une capture du reçu et envoyez-la sur WhatsApp" },
    ],
    actions: [{ label: "📋 Copier le code USSD", color: "#FF6600", onPress: () => { Clipboard.setString("#150*14*518554*692251299*MONTANT#"); Alert.alert("Copié !", "Remplacez MONTANT par votre total"); } }],
  },
  {
    id: "paypal",
    name: "PayPal Europe",
    tagline: "Envoi Famille / Proche — Devise €",
    color: "#003087",
    badge: "⚠️ Famille / Proche",
    rows: [
      { label: "Email PayPal",  value: "LARAMBAMBO@GMAIL.COM", highlight: true, copyable: true },
      { label: "Type d'envoi", value: "Famille ou Proche UNIQUEMENT" },
      { label: "Devise",       value: "Euros (€) — pas de FCFA" },
      { label: "Taux",         value: "700 FCFA / €" },
      { label: "Délai",        value: "< 15 min" },
    ],
    steps: [
      { icon: "1️⃣", text: "Ouvrez votre application PayPal" },
      { icon: "2️⃣", text: "Choisissez « Envoyer de l'argent » → entrez l'email ci-dessus" },
      { icon: "3️⃣", text: "Sélectionnez « Famille ou Proche » — JAMAIS « Biens ou Services »" },
      { icon: "4️⃣", text: "Entrez le montant en EUROS correspondant à votre commande" },
      { icon: "5️⃣", text: "Faites une capture et envoyez-la sur WhatsApp" },
    ],
    actions: [{ label: "📋 Copier l'email PayPal", color: "#003087", onPress: () => { Clipboard.setString("LARAMAMBO@GMAIL.COM"); Alert.alert("Copié !", "Email PayPal copié"); } }],
  },
  {
    id: "neero",
    name: "Neero",
    tagline: "Paiement via l'application Neero",
    color: "#8B5CF6",
    rows: [
      { label: "Code marchand",   value: "@blondelccde", highlight: true, copyable: true },
      { label: "Nom du marchand", value: "Blondel" },
      { label: "Devise",          value: "FCFA" },
      { label: "Délai",           value: "< 10 min" },
    ],
    steps: [
      { icon: "1️⃣", text: "Ouvrez l'application Neero sur votre téléphone" },
      { icon: "2️⃣", text: "Recherchez le code marchand @blondelccde" },
      { icon: "3️⃣", text: "Entrez le montant exact de votre commande en FCFA" },
      { icon: "4️⃣", text: "Confirmez et faites une capture d'écran" },
      { icon: "5️⃣", text: "Envoyez la capture sur WhatsApp pour validation" },
    ],
    actions: [{ label: "📋 Copier @blondelccde", color: "#8B5CF6", onPress: () => { Clipboard.setString("@blondelccde"); Alert.alert("Copié !", "Code marchand Neero copié"); } }],
  },
  {
    id: "especes",
    name: "Espèces Cash",
    tagline: "Paiement en personne à notre bureau, Deido",
    color: "#25D366",
    rows: [
      { label: "📍 Adresse",  value: "Vallée 3 Boutiques – Deido, Douala" },
      { label: "📞 Tél",      value: "(237) 694 360 978" },
      { label: "🕐 Horaires", value: "Lun – Sam : 8h00 – 20h00" },
      { label: "Livraison",   value: "Immédiate sur place" },
    ],
    steps: [
      { icon: "1️⃣", text: "Contactez-nous sur WhatsApp ou appelez pour confirmer votre commande" },
      { icon: "2️⃣", text: "Venez à notre bureau : Vallée 3 Boutiques, Deido, Douala" },
      { icon: "3️⃣", text: "Effectuez le paiement en espèces au guichet" },
      { icon: "4️⃣", text: "Vous recevez vos codes ou services immédiatement sur place" },
    ],
    actions: [
      { label: "📞 Appeler pour un RDV", color: "#25D366", onPress: () => Linking.openURL("tel:+237694360978") },
      { label: "🗺 Voir sur Google Maps", color: "#4CAF50", onPress: () => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent("Vallée 3 Boutiques Deido Douala Cameroun")}`) },
    ],
  },
  {
    id: "crypto",
    name: "Crypto",
    tagline: "USDT · BTC · TRX · SOL · LTC · ETH — Sur demande",
    color: "#26A17B",
    badge: "Sur demande",
    rows: [
      { label: "Cryptos",     value: "USDT, USDC, BTC, TRX, SOL, LTC, ETH, ADA, BNB" },
      { label: "Réseaux",     value: "TRC-20, ERC-20, BEP-20, BTC, SOL…" },
      { label: "Taux achat",  value: "700 FCFA / $" },
      { label: "Taux vente",  value: "580 FCFA / $" },
      { label: "Délai",       value: "Selon confirmation blockchain" },
    ],
    steps: [
      { icon: "1️⃣", text: "Contactez-nous sur WhatsApp pour initier la transaction" },
      { icon: "2️⃣", text: "Nous vous communiquons l'adresse wallet et le réseau à utiliser" },
      { icon: "3️⃣", text: "Envoyez le montant exact sur le bon réseau — vérifiez le réseau !" },
      { icon: "4️⃣", text: "Partagez le hash de la transaction blockchain sur WhatsApp" },
      { icon: "5️⃣", text: "Commande traitée après confirmation blockchain (1–3 blocs)" },
    ],
    actions: [{ label: "💬 Initier une transaction crypto", color: "#26A17B", onPress: () => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=Bonjour%2C%20je%20voudrais%20payer%20en%20crypto.`) }],
  },
  {
    id: "uba",
    name: "Virement UBA",
    tagline: "Virement bancaire UBA Cameroun — Sur demande",
    color: "#C9A84C",
    badge: "Sur demande",
    rows: [
      { label: "Banque",          value: "United Bank for Africa (UBA)" },
      { label: "Pays",            value: "Cameroun" },
      { label: "Coordonnées",     value: "Communiquées sur demande" },
      { label: "Délai",           value: "24–48h ouvrées" },
    ],
    steps: [
      { icon: "1️⃣", text: "Contactez-nous sur WhatsApp pour demander les coordonnées UBA" },
      { icon: "2️⃣", text: "Effectuez le virement depuis votre compte bancaire" },
      { icon: "3️⃣", text: "Faites une capture du bordereau de virement" },
      { icon: "4️⃣", text: "Envoyez la capture sur WhatsApp — traitement sous 24–48h" },
    ],
    actions: [{ label: "🏦 Demander les coordonnées UBA", color: "#C9A84C", onPress: () => Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=Bonjour%2C%20je%20voudrais%20les%20coordonn%C3%A9es%20UBA.`) }],
  },
];

// ─── InfoRow ──────────────────────────────────────────────────────────────────
function InfoRowItem({ row }: { row: InfoRow }) {
  const copy = () => {
    Clipboard.setString(row.value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copié !", row.value);
  };
  return (
    <TouchableOpacity style={styles.infoRow} onPress={row.copyable ? copy : undefined} activeOpacity={row.copyable ? 0.6 : 1} disabled={!row.copyable}>
      <Text style={styles.infoRowLabel}>{row.label}</Text>
      <View style={styles.infoRowRight}>
        <Text style={[styles.infoRowValue, row.highlight && styles.infoRowHighlight]} numberOfLines={2}>{row.value}</Text>
        {row.copyable && <Text style={styles.copyHint}>📋</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── MethodCard ───────────────────────────────────────────────────────────────
function MethodCard({ method, isOpen, onToggle }: { method: PayMethod; isOpen: boolean; onToggle: () => void }) {
  return (
    <View style={[styles.card, { borderColor: isOpen ? method.color + "88" : colors.border.default }]}>
      <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.8}>
        <View style={[styles.imgWrap, { backgroundColor: method.color + "22" }]}>
          <Image source={IMG[method.id]} style={styles.methodImg} contentFit="contain" />
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardName}>{method.name}</Text>
            {method.badge && (
              <View style={[styles.badge, { backgroundColor: method.color + "33", borderColor: method.color + "55" }]}>
                <Text style={[styles.badgeText, { color: method.color }]}>{method.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTagline} numberOfLines={1}>{method.tagline}</Text>
        </View>
        <MotiView animate={{ rotate: isOpen ? "90deg" : "0deg" }} transition={{ type: "timing", duration: 200 }}>
          <Text style={[styles.chevron, isOpen && { color: method.color }]}>›</Text>
        </MotiView>
      </TouchableOpacity>

      {isOpen && (
        <MotiView from={{ opacity: 0, translateY: -6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 260 }} style={styles.cardBody}>
          <View style={[styles.accentStrip, { backgroundColor: method.color }]} />

          <View style={styles.rowsBlock}>
            {method.rows.map((row, i) => (
              <View key={i}>
                {i > 0 && <View style={styles.rowDivider} />}
                <InfoRowItem row={row} />
              </View>
            ))}
          </View>

          <View style={styles.stepsBlock}>
            <Text style={styles.stepsTitle}>Comment ça marche ?</Text>
            {method.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>

          {method.actions && method.actions.length > 0 && (
            <View style={styles.actionsBlock}>
              {method.actions.map((action, i) => (
                <TouchableOpacity key={i} style={[styles.actionBtn, { borderColor: action.color + "66", backgroundColor: action.color + "18" }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); action.onPress(); }} activeOpacity={0.75}>
                  <Text style={[styles.actionBtnText, { color: action.color }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </MotiView>
      )}
    </View>
  );
}

// ─── WhatsApp Modal Form ──────────────────────────────────────────────────────
function WaModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [subject, setSubject] = useState("preuve");
  const [note, setNote] = useState("");

  const send = () => {
    const sub = WA_SUBJECTS.find(s => s.id === subject)!;
    const extra = note.trim() ? `\n${note.trim()}` : "";
    const msg = encodeURIComponent(`${sub.msg}${extra}`);
    Linking.openURL(`https://wa.me/${CONTACT.whatsapp}?text=${msg}`);
    onClose();
    setNote("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalSheet}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>💬 Contacter sur WhatsApp</Text>
          <Text style={styles.modalSub}>Choisissez le motif de votre message</Text>

          {/* Subject chips */}
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            <View style={styles.subjectList}>
              {WA_SUBJECTS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.subjectChip, subject === s.id && styles.subjectChipActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSubject(s.id); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.subjectEmoji}>{s.emoji}</Text>
                  <Text style={[styles.subjectLabel, subject === s.id && styles.subjectLabelActive]}>{s.label}</Text>
                  {subject === s.id && <Text style={styles.subjectCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Optional note */}
          <View style={styles.noteWrap}>
            <Text style={styles.noteLabel}>Message additionnel (optionnel)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Ex : N° de commande, question précise…"
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.85}>
            <Text style={styles.sendBtnText}>💬  Ouvrir WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PaiementScreen() {
  const [openId, setOpenId]     = useState<string | null>(null);
  const [waOpen, setWaOpen]     = useState(false);

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOpenId(prev => prev === id ? null : id);
  };

  const openMaps = () =>
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent("Vallée 3 Boutiques Deido Douala Cameroun")}`);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Modes de Paiement</Text>
        <Text style={styles.headerSub}>Appuyez sur un mode pour voir les détails</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Reminder */}
        <View style={styles.reminderBox}>
          <Text style={styles.reminderText}>
            📸 Après chaque paiement, envoyez la capture de votre reçu sur WhatsApp — votre commande est traitée en 15–30 min.
          </Text>
        </View>

        {METHODS.map(m => (
          <MethodCard key={m.id} method={m} isOpen={openId === m.id} onToggle={() => toggle(m.id)} />
        ))}

        {/* WhatsApp CTA */}
        <TouchableOpacity style={styles.waCta} onPress={() => setWaOpen(true)} activeOpacity={0.85}>
          <Text style={styles.waCtaText}>💬  Contacter sur WhatsApp</Text>
        </TouchableOpacity>

        {/* Clickable address → Google Maps */}
        <TouchableOpacity style={styles.addressBox} onPress={openMaps} activeOpacity={0.75}>
          <Text style={styles.addressPin}>📍</Text>
          <View style={styles.addressTexts}>
            <Text style={styles.addressMain}>Vallée 3 Boutiques – Deido, Douala</Text>
            <Text style={styles.addressSub}>Appuyez pour ouvrir Google Maps →</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      <WaModal visible={waOpen} onClose={() => setWaOpen(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: colors.text.secondary, marginTop: 3 },

  scroll: { padding: 16, gap: 12 },

  reminderBox: {
    backgroundColor: colors.brand.gold + "18", borderRadius: radius.lg,
    padding: 14, borderWidth: 1, borderColor: colors.brand.gold + "44",
  },
  reminderText: { fontSize: 13, color: colors.brand.gold, lineHeight: 20 },

  // Cards
  card: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1.5, overflow: "hidden",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  imgWrap: { width: 52, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  methodImg: { width: 44, height: 44 },
  cardMeta: { flex: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  cardName: { fontSize: 15, fontWeight: "800", color: colors.text.primary },
  badge: { borderRadius: radius.full, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: "800" },
  cardTagline: { fontSize: 11, color: colors.text.muted, marginTop: 3 },
  chevron: { fontSize: 24, color: colors.text.muted, fontWeight: "300", marginRight: 2 },

  cardBody: { gap: 0 },
  accentStrip: { height: 2, marginHorizontal: 14, borderRadius: 1, marginBottom: 14 },

  rowsBlock: {
    marginHorizontal: 14, backgroundColor: colors.bg.elevated,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border.default,
    marginBottom: 14, overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  infoRowLabel: { fontSize: 12, color: colors.text.muted, fontWeight: "600", flex: 1 },
  infoRowRight: { flexDirection: "row", alignItems: "center", gap: 6, flex: 2, justifyContent: "flex-end" },
  infoRowValue: { fontSize: 12, color: colors.text.secondary, fontWeight: "700", textAlign: "right", flexShrink: 1 },
  infoRowHighlight: { color: colors.brand.gold },
  copyHint: { fontSize: 12 },
  rowDivider: { height: 1, backgroundColor: colors.border.default },

  stepsBlock: { marginHorizontal: 14, marginBottom: 14, gap: 10 },
  stepsTitle: {
    fontSize: 12, fontWeight: "800", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepIcon: { fontSize: 16, lineHeight: 22 },
  stepText: { fontSize: 13, color: colors.text.secondary, lineHeight: 20, flex: 1 },

  actionsBlock: { marginHorizontal: 14, marginBottom: 16, gap: 8 },
  actionBtn: { borderRadius: radius.full, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  actionBtnText: { fontSize: 13, fontWeight: "800" },

  // Bottom
  waCta: {
    backgroundColor: "#25D366", borderRadius: radius.full,
    paddingVertical: 16, alignItems: "center", marginTop: 4,
    shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  waCtaText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  addressBox: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: "#4CAF5055",
    padding: 14, marginTop: 4,
  },
  addressPin: { fontSize: 24 },
  addressTexts: { flex: 1 },
  addressMain: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  addressSub: { fontSize: 11, color: "#4CAF50", marginTop: 2, fontWeight: "600" },

  // WhatsApp Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00000088" },
  modalSheet: {
    backgroundColor: colors.bg.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36, gap: 14,
    borderWidth: 1, borderColor: colors.border.default,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border.strong,
    alignSelf: "center", marginBottom: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: colors.text.primary, textAlign: "center" },
  modalSub: { fontSize: 13, color: colors.text.muted, textAlign: "center", marginTop: -8 },

  subjectList: { gap: 8 },
  subjectChip: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default,
    padding: 13,
  },
  subjectChipActive: {
    borderColor: "#25D366" + "99",
    backgroundColor: "#25D36618",
  },
  subjectEmoji: { fontSize: 20 },
  subjectLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text.secondary },
  subjectLabelActive: { color: colors.text.primary },
  subjectCheck: { fontSize: 14, color: "#25D366", fontWeight: "900" },

  noteWrap: { gap: 6 },
  noteLabel: { fontSize: 12, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  noteInput: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default,
    padding: 12, color: colors.text.primary, fontSize: 14,
    minHeight: 80,
  },
  sendBtn: {
    backgroundColor: "#25D366", borderRadius: radius.full,
    paddingVertical: 16, alignItems: "center",
    shadowColor: "#25D366", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  sendBtnText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { fontSize: 14, color: colors.text.muted, fontWeight: "600" },
});
