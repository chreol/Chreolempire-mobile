import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { CONTACT } from "@/constants/services";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.p}>{children}</Text>;
}

function Li({ children }: { children: string }) {
  return (
    <View style={styles.liRow}>
      <Text style={styles.liBullet}>•</Text>
      <Text style={styles.liText}>{children}</Text>
    </View>
  );
}

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hero}>📜 CGU & Politique de confidentialité</Text>
        <Text style={styles.version}>Version 1.0 — Mai 2026</Text>

        <Section title="1. Présentation">
          <P>
            Chreol Empire est une entreprise de commerce de biens numériques basée à Douala, Cameroun. Nous
            proposons l'achat de cartes cadeaux (PSN, iTunes, Roblox, Steam, Nintendo, etc.), l'échange de
            coupons (PCS Mastercard, Transcash), l'achat et la vente de cryptomonnaies (USDT, Bitcoin, TRX,
            USDC), le solde PayPal Europe, la recharge UBA et le paiement de factures (Canal+, Eneo, Camwater,
            StarTimes, Express Union, Yoomee).
          </P>
          <P>
            {`Siège social : Vallée 3, Boutiques Deido, Douala, Cameroun\nContact : ${CONTACT.whatsappDisplay} (WhatsApp) · ${CONTACT.email}`}
          </P>
        </Section>

        <Section title="2. Acceptation des conditions">
          <P>
            En téléchargeant et en utilisant l'application Chreol Empire, vous acceptez sans réserve les
            présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez désinstaller
            l'application et cesser toute utilisation.
          </P>
        </Section>

        <Section title="3. Services proposés">
          <P>Chreol Empire propose les services suivants via l'application mobile :</P>
          <Li>Achat de cartes cadeaux numériques (PSN, iTunes, Roblox, Steam, Nintendo, Razer Gold, Google Play)</Li>
          <Li>Recharge de compte Robux</Li>
          <Li>Échange de coupons PCS Mastercard et Transcash en FCFA</Li>
          <Li>Achat et vente de cryptomonnaies (USDT, USDC, Bitcoin, TRX)</Li>
          <Li>Achat et vente de solde PayPal Europe</Li>
          <Li>Recharge de carte bancaire UBA Cameroun</Li>
          <Li>Paiement de factures Canal+, Eneo, Camwater, StarTimes, Express Union, Yoomee</Li>
        </Section>

        <Section title="4. Processus de commande">
          <P>
            Toutes les commandes sont initiées via l'application et finalisées sur WhatsApp avec un agent
            Chreol Empire. Le processus est le suivant :
          </P>
          <Li>L'utilisateur sélectionne un service et remplit le formulaire de commande dans l'application</Li>
          <Li>La commande est envoyée automatiquement sur WhatsApp au numéro +237 697 657 734</Li>
          <Li>Un agent Chreol Empire confirme la commande et indique le mode de paiement</Li>
          <Li>L'utilisateur effectue le paiement via Orange Money ou MTN MoMo</Li>
          <Li>La livraison (code, lien ou confirmation) est effectuée par WhatsApp ou email sous 15 à 30 minutes</Li>
          <P>
            Chreol Empire se réserve le droit de refuser toute commande jugée suspecte ou ne respectant pas
            les présentes conditions.
          </P>
        </Section>

        <Section title="5. Délais et disponibilité">
          <P>
            Les délais de livraison annoncés (15 à 30 minutes) sont indicatifs et s'appliquent aux jours et
            heures d'ouverture. Chreol Empire opère généralement de 8h00 à 22h00, 7 jours sur 7. Des délais
            supplémentaires peuvent survenir en cas de forte demande, maintenance ou circonstances
            exceptionnelles.
          </P>
        </Section>

        <Section title="6. Paiements acceptés">
          <Li>Orange Money Cameroun</Li>
          <Li>MTN Mobile Money (MoMo) Cameroun</Li>
          <P>
            Tous les paiements sont effectués en Franc CFA (FCFA). Les prix affichés dans l'application
            sont indicatifs et peuvent varier en fonction des taux de change du marché. Le prix définitif
            est confirmé par l'agent WhatsApp avant le paiement.
          </P>
        </Section>

        <Section title="7. Politique de remboursement">
          <P>
            En raison de la nature numérique et immédiate des produits vendus, toute vente est définitive
            après livraison du code ou du service. Aucun remboursement ne sera accordé une fois le produit
            livré et utilisé.
          </P>
          <P>
            En cas de problème avec un produit non livré ou défectueux, contactez notre support WhatsApp
            dans les 24 heures suivant la commande. Chreol Empire s'engage à résoudre tout litige de bonne
            foi dans la limite de ses possibilités techniques.
          </P>
        </Section>

        <Section title="8. Responsabilités">
          <P>Chreol Empire ne peut être tenu responsable de :</P>
          <Li>L'indisponibilité temporaire des services tiers (PlayStation Network, Apple, Roblox, etc.)</Li>
          <Li>Les variations de taux de change entre crypto-monnaies et FCFA</Li>
          <Li>Tout usage frauduleux ou non autorisé des produits achetés</Li>
          <Li>Les interruptions de service liées aux opérateurs Orange Money ou MTN MoMo</Li>
          <Li>Les retards imputables à des causes de force majeure</Li>
        </Section>

        <Section title="9. Données personnelles">
          <P>
            Les données collectées par l'application (prénom, ville, email, mois d'anniversaire, photo de
            profil) sont stockées localement sur votre appareil et ne sont jamais transmises à des serveurs
            externes.
          </P>
          <P>
            Les messages envoyés via WhatsApp sont soumis à la politique de confidentialité de WhatsApp /
            Meta. Chreol Empire ne stocke pas vos conversations WhatsApp.
          </P>
          <P>
            En nous contactant par email, vous acceptez que nous conservions votre adresse email pour vous
            envoyer des confirmations de commande et des offres exclusives. Vous pouvez vous désinscrire
            à tout moment en nous le signalant.
          </P>
        </Section>

        <Section title="10. Programme de fidélité">
          <P>
            La carte de fidélité Chreol Empire attribue des tampons à chaque commande validée. Les
            conditions d'attribution et les récompenses peuvent évoluer à la discrétion de Chreol Empire.
            Un tampon bonus peut être attribué le mois d'anniversaire du client, sous réserve que la date
            de naissance ait été renseignée dans l'application.
          </P>
        </Section>

        <Section title="11. Propriété intellectuelle">
          <P>
            L'ensemble des éléments composant l'application Chreol Empire (logo, design, textes, images,
            code source) sont la propriété exclusive de Chreol Empire et sont protégés par les lois en
            vigueur sur la propriété intellectuelle. Toute reproduction, distribution ou utilisation sans
            autorisation écrite préalable est strictement interdite.
          </P>
          <P>
            Les marques tierces mentionnées (PlayStation, Apple, Roblox, Steam, etc.) sont la propriété
            de leurs détenteurs respectifs. Chreol Empire n'est affilié à aucune de ces marques.
          </P>
        </Section>

        <Section title="12. Modifications des conditions">
          <P>
            Chreol Empire se réserve le droit de modifier les présentes conditions à tout moment. Les
            modifications entrent en vigueur dès leur publication dans l'application. L'utilisation
            continue de l'application après modification vaut acceptation des nouvelles conditions.
          </P>
        </Section>

        <Section title="13. Droit applicable">
          <P>
            Les présentes conditions sont régies par le droit camerounais. Tout litige sera soumis à la
            juridiction compétente de Douala, Cameroun.
          </P>
        </Section>

        <Section title="14. Contact">
          <P>Pour toute question relative aux présentes conditions :</P>
          <Li>{`WhatsApp : ${CONTACT.whatsappDisplay}`}</Li>
          <Li>{`Email : ${CONTACT.email}`}</Li>
          <Li>{`Adresse : ${CONTACT.address}`}</Li>
        </Section>

        <TouchableOpacity
          style={styles.fullVersionBtn}
          onPress={() => Linking.openURL(CONTACT.termsUrl)}
          activeOpacity={0.8}
        >
          <Text style={styles.fullVersionText}>Voir la version complète en ligne 🌐</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>© 2026 Chreol Empire · Tous droits réservés · Douala, Cameroun</Text>
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

  scroll: { flex: 1 },
  content: { padding: 20, gap: 4, paddingBottom: 40 },

  hero: { fontSize: 22, fontWeight: "900", color: colors.text.primary, textAlign: "center", marginBottom: 4 },
  version: { fontSize: 12, color: colors.text.muted, textAlign: "center", marginBottom: 16 },

  section: {
    backgroundColor: colors.bg.card,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border.default,
    gap: 8, marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: "800", color: colors.brand.gold,
    letterSpacing: 0.2, marginBottom: 2,
  },
  p: { fontSize: 13, color: colors.text.secondary, lineHeight: 20 },
  liRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  liBullet: { fontSize: 13, color: colors.brand.gold, marginTop: 1 },
  liText: { flex: 1, fontSize: 13, color: colors.text.secondary, lineHeight: 20 },

  fullVersionBtn: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  fullVersionText: { fontSize: 14, fontWeight: "700", color: colors.brand.gold },

  footer: { fontSize: 11, color: colors.text.muted, textAlign: "center", paddingTop: 8 },
});
