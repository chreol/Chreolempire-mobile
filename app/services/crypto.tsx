import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, Clipboard, KeyboardAvoidingView, Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { colors, radius } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";

const IMG_HERO = require("../../assets/Cryptomonnaies-visuel.webp");

type Direction = "sell" | "buy";
type MomoNetwork = "orange" | "mtn";

const CRYPTOS = [
  { id: "usdt", name: "USDT", icon: "💵", color: "#26A17B" },
  { id: "usdc", name: "USDC", icon: "🔵", color: "#2775CA" },
  { id: "btc",  name: "BTC",  icon: "₿",  color: "#F7931A" },
  { id: "trx",  name: "TRX",  icon: "🔴", color: "#EB0029" },
  { id: "sol",  name: "SOL",  icon: "◎",  color: "#9945FF" },
  { id: "ltc",  name: "LTC",  icon: "Ł",  color: "#BFBBBB" },
  { id: "eth",  name: "ETH",  icon: "Ξ",  color: "#627EEA" },
  { id: "ada",  name: "ADA",  icon: "₳",  color: "#0033AD" },
  { id: "bnb",  name: "BNB",  icon: "◈",  color: "#F3BA2F" },
] as const;

// ⚠️ TAUX VARIABLE — À METTRE À JOUR RÉGULIÈREMENT
const SELL_RATE = 580; // Je vends mes crypto → utilisateur reçoit 580 FCFA par $
const BUY_RATE  = 700; // J'achète des crypto → utilisateur paie 700 FCFA par $

type WalletMap = Record<string, Record<string, { addr: string; note: string }>>;

const WALLETS: WalletMap = {
  USDT: {
    "BEP20 (BSC)":    { addr: "0x7e0fE380958c8B6Eda7Df0d80b0829263256fE85",                             note: "Réseau : BNB Smart Chain (BEP20)" },
    "TRC20 (Tron)":   { addr: "TMiSeBpQQ7AeKzN34wvzC5uybXHFvcyfo6",                                    note: "Réseau : Tron (TRC20)" },
    "Arbitrum (ARB)": { addr: "0x7e0fE380958c8B6Eda7Df0d80b0829263256fE85",                             note: "Réseau : Arbitrum" },
    "SPL (Solana)":   { addr: "Egme6fgZ1rQHcNfpDaNNsGh3LBe2aoou4FtuS8MCd71d",                          note: "Réseau : Solana (SPL)" },
    "Aptos":          { addr: "0xb30a843b80c8B6Eda7Df0d80b0829263256fE85c8b370be02c977ae30eac1",       note: "Réseau : Aptos" },
    "Celo":           { addr: "0x640a90a213560756ea03a1cae5741b0b47495caa",                            note: "Réseau : Celo" },
    "Polkadot (DOT)": { addr: "14ipdSddWWmkN4pJdk56WFM6BT1Y1zmfiXvDVyxGqPnsKHXk",                     note: "Réseau : Polkadot (DOT)" },
  },
  BTC: {
    "Bitcoin (BTC)":  { addr: "bc1q7qzvsrlyn96x6mwfs48hzqrcxfpsqusacj356k",                            note: "Réseau : Bitcoin mainnet" },
  },
  TRX: {
    "TRC20 (Tron)":   { addr: "TMiSeBpQQ7AeKzN34wvzC5uybXHFvcyfo6",                                    note: "Réseau : Tron (TRX)" },
  },
  USDC: {
    "BEP20 (BSC)":    { addr: "0x7e0fE380958c8B6Eda7Df0d80b0829263256fE85",                             note: "Réseau : BNB Smart Chain (BEP20)" },
    "SPL (Solana)":   { addr: "Egme6fgZ1rQHcNfpDaNNsGh3LBe2aoou4FtuS8MCd71d",                          note: "Réseau : Solana (SPL)" },
  },
  ETH: {
    "ERC20 (Ethereum)": { addr: "0x7e0fE380958c8B6Eda7Df0d80b0829263256fE85",                           note: "Réseau : Ethereum (ERC20)" },
  },
  LTC: {
    "Litecoin (LTC)": { addr: "ltc1q2tlsexsslwwswkh6yk2nsuy4eu8ancwn9x9lgh",                           note: "Réseau : Litecoin" },
  },
  SOL: {
    "Solana (SOL)":   { addr: "Egme6fgZ1rQHcNfpDaNNsGh3LBe2aoou4FtuS8MCd71d",                          note: "Réseau : Solana" },
  },
  ADA: {
    "Cardano (ADA)":  { addr: "addr1q9mxu5zlhu3mlymfk84zxujj9arrn38gcx67nxnfm5dv43kdr5xh7gfcp3ehfjm9zjs4gwjjm9n5ln3cg0fn0v4gwm0s7uch3z", note: "Réseau : Cardano" },
  },
  BNB: {
    "BEP20 (BSC)":    { addr: "0x7e0fE380958c8B6Eda7Df0d80b0829263256fE85",                             note: "Réseau : BNB Smart Chain (BEP20)" },
  },
};

type FormErrors = {
  usdAmount?: string; selectedNetwork?: string; txHash?: string;
  benefName?: string; phone?: string;
  walletAddr?: string; walletNetwork?: string;
};

export default function CryptoScreen() {
  const router = useRouter();
  const { addItem, count } = useCart();

  const [direction, setDirection] = useState<Direction>("sell");
  const [selectedCrypto, setSelectedCrypto] = useState(0);

  // Sell form
  const [usdAmount,          setUsdAmount]          = useState("");
  const [selectedNetworkKey, setSelectedNetworkKey] = useState("");
  const [txHash,             setTxHash]             = useState("");
  const [benefName,          setBenefName]          = useState("");
  const [momoNetwork,        setMomoNetwork]        = useState<MomoNetwork>("orange");
  const [phone,              setPhone]              = useState("");

  // Buy form
  const [buyUsdAmount,  setBuyUsdAmount]  = useState("");
  const [walletAddr,    setWalletAddr]    = useState("");
  const [walletNetwork, setWalletNetwork] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [howOpen, setHowOpen] = useState(false);

  const crypto     = CRYPTOS[selectedCrypto];
  const wallets    = WALLETS[crypto.name] ?? {};
  const networkKeys = Object.keys(wallets);
  const walletInfo = wallets[selectedNetworkKey];

  const numUsd    = parseFloat(usdAmount.replace(",", ".")) || 0;
  const fcfaSell  = numUsd > 0 ? Math.round(numUsd * SELL_RATE) : 0;

  const numBuyUsd = parseFloat(buyUsdAmount.replace(",", ".")) || 0;
  const fcfaBuy   = numBuyUsd > 0 ? Math.round(numBuyUsd * BUY_RATE) : 0;

  const resetForms = () => {
    setUsdAmount(""); setSelectedNetworkKey(""); setTxHash("");
    setBenefName(""); setPhone("");
    setBuyUsdAmount(""); setWalletAddr(""); setWalletNetwork("");
    setErrors({});
  };

  const switchDirection = (d: Direction) => {
    setDirection(d);
    resetForms();
  };

  const selectCrypto = (i: number) => {
    setSelectedCrypto(i);
    setSelectedNetworkKey("");
    setErrors(p => ({ ...p, selectedNetwork: undefined }));
  };

  const handleSellAddToCart = () => {
    const errs: FormErrors = {};
    if (numUsd <= 0)         errs.usdAmount       = "Entrez le montant en $";
    if (!selectedNetworkKey) errs.selectedNetwork  = "Sélectionnez un réseau de transfert";
    if (!txHash.trim())      errs.txHash           = "Hash de transaction requis";
    if (!benefName.trim())   errs.benefName        = "Nom & prénom du bénéficiaire requis";
    if (phone.length < 9)    errs.phone            = "9 chiffres requis";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const momoLabel = momoNetwork === "orange" ? "Orange Money" : "MTN Mobile Money";
    addItem({
      id:       `crypto-sell-${Date.now()}`,
      cardId:   "crypto-sell",
      cardName: `Vente ${crypto.name} — ${numUsd}$ via ${selectedNetworkKey} — Hash: ${txHash} — Bénéficiaire : ${benefName} (${momoLabel} +237${phone})`,
      amount:   `${numUsd}$ → ${fcfaSell.toLocaleString("fr-FR")} FCFA`,
      price:    fcfaSell,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Ajouté au panier ✅",
      `Vente de ${numUsd}$ en ${crypto.name}\nVous recevrez : ${fcfaSell.toLocaleString("fr-FR")} FCFA`,
      [{ text: "Continuer" }]
    );
    resetForms();
  };

  const handleBuyAddToCart = () => {
    const errs: FormErrors = {};
    if (numBuyUsd <= 0)        errs.usdAmount      = "Entrez le montant en $";
    if (!walletAddr.trim())    errs.walletAddr     = "Adresse de wallet requise";
    if (!walletNetwork.trim()) errs.walletNetwork  = "Précisez le réseau";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    addItem({
      id:       `crypto-buy-${Date.now()}`,
      cardId:   "crypto-buy",
      cardName: `Achat ${crypto.name} — ${numBuyUsd}$ → Wallet : ${walletAddr.slice(0, 16)}... (${walletNetwork})`,
      amount:   `${numBuyUsd}$ → ${fcfaBuy.toLocaleString("fr-FR")} FCFA`,
      price:    fcfaBuy,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Ajouté au panier ✅",
      `Achat de ${numBuyUsd}$ en ${crypto.name}\nVous payez : ${fcfaBuy.toLocaleString("fr-FR")} FCFA`,
      [{ text: "Continuer" }]
    );
    resetForms();
  };

  const copyAddr = (addr: string) => {
    Clipboard.setString(addr);
    Alert.alert("Copié ✓", "Adresse copiée dans le presse-papiers.");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView style={styles.container} edges={["top"]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crypto & Échange</Text>
          {count > 0 ? (
            <TouchableOpacity style={styles.cartBadge} onPress={() => router.push("/cart")}>
              <Text style={styles.cartBadgeText}>🛒 {count}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 56 }} />
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Hero */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 420 }}
            style={styles.heroWrap}
          >
            <Image source={IMG_HERO} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Achète tes Bitcoin, USDT,{"\n"}USDC, TRX, SOL chez nous
              </Text>
              <Text style={styles.heroSub}>0% de commission · Livraison rapide · 7j/7</Text>
            </View>
          </MotiView>

          {/* Direction */}
          <View style={styles.dirRow}>
            <TouchableOpacity
              style={[styles.dirBtn, direction === "sell" && styles.dirBtnActive]}
              onPress={() => switchDirection("sell")}
              activeOpacity={0.85}
            >
              <Text style={[styles.dirText, direction === "sell" && styles.dirTextActive]}>
                💸 Vendre Crypto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dirBtn, direction === "buy" && styles.dirBtnActive]}
              onPress={() => switchDirection("buy")}
              activeOpacity={0.85}
            >
              <Text style={[styles.dirText, direction === "buy" && styles.dirTextActive]}>
                🛒 Achetez Crypto
              </Text>
            </TouchableOpacity>
          </View>

          {/* Crypto selector */}
          <Text style={styles.sectionLabel}>
            {direction === "sell" ? "Sélectionner la crypto que vous souhaitez vendre" : "Sélectionner la crypto"}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cryptoRow}>
            {CRYPTOS.map((c, i) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.cryptoChip, selectedCrypto === i && { backgroundColor: c.color + "22", borderColor: c.color }]}
                onPress={() => selectCrypto(i)}
                activeOpacity={0.85}
              >
                <Text style={styles.cryptoIcon}>{c.icon}</Text>
                <Text style={[styles.cryptoName, selectedCrypto === i && { color: c.color, fontWeight: "800" }]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── SELL FORM ── */}
          {direction === "sell" ? (
            <>
              {/* Montant USD */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>💱 Valeur de la crypto à vendre</Text>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Valeur en $ (USD) *</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }, errors.usdAmount && styles.inputError]}
                      value={usdAmount}
                      onChangeText={t => { setUsdAmount(t.replace(/[^0-9.,]/g, "")); setErrors(p => ({ ...p, usdAmount: undefined })); }}
                      placeholder="Ex: 50"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.inputUnit}>USD $</Text>
                  </View>
                  {errors.usdAmount && <Text style={styles.errorText}>⚠ {errors.usdAmount}</Text>}
                </View>

                {fcfaSell > 0 && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 16 }}
                    style={styles.resultBox}
                  >
                    <Text style={styles.resultLabel}>Vous recevrez</Text>
                    <Text style={[styles.resultValue, { color: crypto.color }]}>
                      {fcfaSell.toLocaleString("fr-FR")} FCFA
                    </Text>
                    <Text style={styles.resultSub}>
                      {numUsd}$ × {SELL_RATE} FCFA/$ = {fcfaSell.toLocaleString("fr-FR")} FCFA
                    </Text>
                  </MotiView>
                )}
              </View>

              {/* Réseau + Adresse wallet */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>📡 Réseau de transfert</Text>

                {/* Info bulle réseau */}
                <View style={styles.networkInfoBubble}>
                  <Text style={styles.networkInfoText}>
                    ⚠️ Choisissez le réseau utilisé pour l'envoi. Un mauvais réseau entraîne la perte définitive des fonds.
                  </Text>
                </View>

                {networkKeys.length > 0 ? (
                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>Sélectionner le réseau *</Text>
                    <View style={styles.networkChips}>
                      {networkKeys.map(key => (
                        <TouchableOpacity
                          key={key}
                          style={[styles.networkChip, selectedNetworkKey === key && { backgroundColor: crypto.color + "22", borderColor: crypto.color }]}
                          onPress={() => { setSelectedNetworkKey(key); setErrors(p => ({ ...p, selectedNetwork: undefined })); }}
                          activeOpacity={0.85}
                        >
                          <Text style={[styles.networkChipText, selectedNetworkKey === key && { color: crypto.color, fontWeight: "800" }]}>
                            {key}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {errors.selectedNetwork && <Text style={styles.errorText}>⚠ {errors.selectedNetwork}</Text>}

                    {walletInfo && (
                      <MotiView
                        from={{ opacity: 0, translateY: -4 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: "timing", duration: 220 }}
                        style={styles.walletBox}
                      >
                        <Text style={styles.walletNote}>{walletInfo.note}</Text>
                        <Text style={styles.walletAddr} selectable>{walletInfo.addr}</Text>
                        <TouchableOpacity style={styles.copyBtn} onPress={() => copyAddr(walletInfo.addr)} activeOpacity={0.8}>
                          <Text style={styles.copyBtnText}>📋 Copier l'adresse</Text>
                        </TouchableOpacity>
                      </MotiView>
                    )}
                  </View>
                ) : (
                  <Text style={styles.noNetworkText}>
                    Réseau non configuré pour {crypto.name}. Contactez-nous sur WhatsApp.
                  </Text>
                )}
              </View>

              {/* Hash de la transaction */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>🔗 Hash de la transaction</Text>
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Hash / TxID *</Text>
                  <TextInput
                    style={[styles.input, errors.txHash && styles.inputError]}
                    value={txHash}
                    onChangeText={t => { setTxHash(t.trim()); setErrors(p => ({ ...p, txHash: undefined })); }}
                    placeholder="Ex: 0xabc123... ou abc123..."
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.fieldHintSmall}>
                    Copiez le hash de votre transaction blockchain après avoir envoyé les cryptos.
                  </Text>
                  {errors.txHash && <Text style={styles.errorText}>⚠ {errors.txHash}</Text>}
                </View>
              </View>

              {/* Bénéficiaire Mobile Money */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>📱 Réception Mobile Money</Text>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Nom & Prénom *</Text>
                  <TextInput
                    style={[styles.input, errors.benefName && styles.inputError]}
                    value={benefName}
                    onChangeText={t => { setBenefName(t); setErrors(p => ({ ...p, benefName: undefined })); }}
                    placeholder="Ex: Jean Dupont"
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="words"
                  />
                  {errors.benefName && <Text style={styles.errorText}>⚠ {errors.benefName}</Text>}
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Réseau Mobile Money *</Text>
                  <View style={styles.momoRow}>
                    <TouchableOpacity
                      style={[styles.momoBtn, momoNetwork === "orange" && styles.momoBtnOrange]}
                      onPress={() => setMomoNetwork("orange")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.momoEmoji}>🟠</Text>
                      <Text style={[styles.momoLabel, momoNetwork === "orange" && { color: "#FF6600", fontWeight: "800" }]}>
                        Orange Money
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.momoBtn, momoNetwork === "mtn" && styles.momoBtnMtn]}
                      onPress={() => setMomoNetwork("mtn")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.momoEmoji}>🟡</Text>
                      <Text style={[styles.momoLabel, momoNetwork === "mtn" && { color: "#FACC15", fontWeight: "800" }]}>
                        MTN MoMo
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Numéro de téléphone * (9 chiffres)</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.dialCodeBox}>
                      <Text style={styles.dialCode}>+237</Text>
                    </View>
                    <TextInput
                      style={[styles.input, { flex: 1 }, errors.phone && styles.inputError]}
                      value={phone}
                      onChangeText={t => { setPhone(t.replace(/\D/g, "").slice(0, 9)); setErrors(p => ({ ...p, phone: undefined })); }}
                      placeholder="6XXXXXXXX"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="number-pad"
                      maxLength={9}
                    />
                  </View>
                  {errors.phone && <Text style={styles.errorText}>⚠ {errors.phone}</Text>}
                </View>
              </View>

              <TouchableOpacity style={styles.addCartBtn} onPress={handleSellAddToCart} activeOpacity={0.87}>
                <Text style={styles.addCartBtnText}>🛒  Ajouter au panier</Text>
              </TouchableOpacity>
            </>

          ) : (
            /* ── BUY FORM ── */
            <>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>💰 Montant à acheter</Text>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Montant en $ (USD) *</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }, errors.usdAmount && styles.inputError]}
                      value={buyUsdAmount}
                      onChangeText={t => { setBuyUsdAmount(t.replace(/[^0-9.,]/g, "")); setErrors(p => ({ ...p, usdAmount: undefined })); }}
                      placeholder="Ex: 100"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.inputUnit}>USD $</Text>
                  </View>
                  {errors.usdAmount && <Text style={styles.errorText}>⚠ {errors.usdAmount}</Text>}
                </View>

                {fcfaBuy > 0 && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 16 }}
                    style={styles.resultBox}
                  >
                    <Text style={styles.resultLabel}>Vous payez</Text>
                    <Text style={[styles.resultValue, { color: crypto.color }]}>
                      {fcfaBuy.toLocaleString("fr-FR")} FCFA
                    </Text>
                    <Text style={styles.resultSub}>
                      {numBuyUsd}$ × {BUY_RATE} FCFA/$ = {fcfaBuy.toLocaleString("fr-FR")} FCFA
                    </Text>
                  </MotiView>
                )}
              </View>

              <View style={styles.formCard}>
                <Text style={styles.formTitle}>📥 Où recevoir votre crypto ?</Text>
                <Text style={styles.walletHint}>
                  Renseignez votre adresse de wallet ci-dessous. Vérifiez le réseau choisi avant de valider.
                </Text>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Adresse / Wallet *</Text>
                  <TextInput
                    style={[styles.input, errors.walletAddr && styles.inputError]}
                    value={walletAddr}
                    onChangeText={t => { setWalletAddr(t); setErrors(p => ({ ...p, walletAddr: undefined })); }}
                    placeholder="Ex: 0x7e0fE38..."
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.walletAddr && <Text style={styles.errorText}>⚠ {errors.walletAddr}</Text>}
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Réseau (Network) *</Text>
                  <TextInput
                    style={[styles.input, errors.walletNetwork && styles.inputError]}
                    value={walletNetwork}
                    onChangeText={t => { setWalletNetwork(t); setErrors(p => ({ ...p, walletNetwork: undefined })); }}
                    placeholder="Ex: BEP20, TRC20, ERC20, SPL..."
                    placeholderTextColor={colors.text.muted}
                    autoCapitalize="characters"
                  />
                  {errors.walletNetwork && <Text style={styles.errorText}>⚠ {errors.walletNetwork}</Text>}
                </View>
              </View>

              <TouchableOpacity style={styles.addCartBtn} onPress={handleBuyAddToCart} activeOpacity={0.87}>
                <Text style={styles.addCartBtnText}>🛒  Ajouter au panier</Text>
              </TouchableOpacity>
            </>
          )}

          {count > 0 && (
            <TouchableOpacity style={styles.submitBtn} onPress={() => router.push("/cart")} activeOpacity={0.87}>
              <Text style={styles.submitBtnText}>Soumettre la commande à Chreol Empire →</Text>
            </TouchableOpacity>
          )}

          {/* Bulle d'information — 3 étapes (collapsible) */}
          <TouchableOpacity
            style={styles.howToggle}
            onPress={() => setHowOpen(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.howToggleText}>❓ Comment ça marche ?</Text>
            <Text style={styles.howToggleChevron}>{howOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {howOpen && (
            <MotiView
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 220 }}
              style={styles.infoCard}
            >
              {[
                { n: "1", title: "Choisir", text: "Sélectionnez votre crypto, entrez le montant en $ ou en FCFA." },
                { n: "2", title: "Payer / Envoyer", text: "Payez via Mobile Money (achat) ou envoyez vos cryptos à notre adresse (vente)." },
                { n: "3", title: "Recevoir", text: "Transfert instantané sur votre wallet ou votre numéro Mobile Money." },
              ].map(s => (
                <View key={s.n} style={styles.infoStep}>
                  <View style={styles.infoStepNum}>
                    <Text style={styles.infoStepNumText}>{s.n}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoStepTitle}>{s.title}</Text>
                    <Text style={styles.infoStepText}>{s.text}</Text>
                  </View>
                </View>
              ))}
            </MotiView>
          )}

          {/* Branding footer */}
          <View style={styles.brandFooter}>
            <Text style={styles.brandName}>CHREOL EMPIRE</Text>
            <Text style={styles.brandTagline}>L'autorité du marché Camerounais en services digitaux.</Text>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border.default,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 28, color: colors.text.primary },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.text.primary },
  cartBadge: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  cartBadgeText: { fontSize: 12, fontWeight: "800", color: "#0A0A0A" },

  content: { padding: 16, gap: 14, paddingBottom: 40 },

  // Hero
  heroWrap: { height: 200, borderRadius: radius["2xl"], overflow: "hidden", justifyContent: "flex-end" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  heroContent: { padding: 20, gap: 8 },
  heroTitle: { fontSize: 18, fontWeight: "900", color: "#fff", lineHeight: 25 },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "600" },

  // Direction
  dirRow: { flexDirection: "row", gap: 10 },
  dirBtn: {
    flex: 1, paddingVertical: 13, borderRadius: radius.xl,
    alignItems: "center", borderWidth: 1.5, borderColor: colors.border.default,
    backgroundColor: colors.bg.card,
  },
  dirBtnActive: { backgroundColor: colors.brand.gold, borderColor: colors.brand.gold },
  dirText: { fontSize: 13, fontWeight: "700", color: colors.text.muted, textAlign: "center" },
  dirTextActive: { color: "#0A0A0A" },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: colors.text.muted,
    textTransform: "uppercase", letterSpacing: 0.4,
  },

  // Crypto selector
  cryptoRow: { gap: 8, paddingBottom: 2 },
  cryptoChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: colors.bg.card, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border.default,
  },
  cryptoIcon: { fontSize: 16 },
  cryptoName: { fontSize: 13, fontWeight: "600", color: colors.text.primary },

  // Form card
  formCard: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    padding: 16, gap: 14,
  },
  formTitle: { fontSize: 14, fontWeight: "800", color: colors.text.primary },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 10, fontWeight: "700", color: colors.text.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: colors.text.primary, fontWeight: "600",
  },
  inputUnit: { fontSize: 13, color: colors.text.muted, fontWeight: "700" },
  inputError: { borderColor: "#EF4444" },
  errorText: { fontSize: 11, fontWeight: "600", color: "#EF4444", marginTop: 2 },

  // Result box
  resultBox: {
    backgroundColor: colors.brand.goldLight, borderRadius: radius.xl,
    padding: 16, alignItems: "center", gap: 4,
    borderWidth: 1.5, borderColor: colors.brand.gold + "66",
  },
  resultLabel: { fontSize: 12, fontWeight: "600", color: colors.brand.goldDark },
  resultValue: { fontSize: 28, fontWeight: "900" },
  resultSub:   { fontSize: 11, color: colors.brand.goldDark, opacity: 0.7 },

  // Networks
  networkChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  networkChip: {
    paddingHorizontal: 12, paddingVertical: 9,
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default,
  },
  networkChipText: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },
  noNetworkText: { fontSize: 13, color: colors.text.muted, fontStyle: "italic" },

  networkInfoBubble: {
    backgroundColor: "#2A1500", borderRadius: radius.lg,
    borderWidth: 1, borderColor: "#F7931A55", padding: 12,
  },
  networkInfoText: { fontSize: 12, color: "#FCD34D", lineHeight: 18 },

  fieldHintSmall: { fontSize: 10, color: colors.text.muted, lineHeight: 14 },

  // Wallet display
  walletBox: {
    backgroundColor: "#0A0A1E", borderRadius: radius.lg,
    borderWidth: 1, borderColor: "#6366F133",
    padding: 14, gap: 8, marginTop: 4,
  },
  walletNote: { fontSize: 11, color: "#A5B4FC", fontWeight: "600" },
  walletAddr: { fontSize: 12, color: "#C7D2FE", fontFamily: "monospace", lineHeight: 18 },
  copyBtn: {
    backgroundColor: "#6366F122", borderRadius: radius.lg,
    paddingVertical: 9, alignItems: "center",
    borderWidth: 1, borderColor: "#6366F144",
  },
  copyBtnText: { fontSize: 12, fontWeight: "700", color: "#A5B4FC" },

  // Wallet hint (buy form)
  walletHint: { fontSize: 12, color: colors.text.secondary, lineHeight: 18, marginBottom: 4 },

  // Mobile Money
  momoRow: { flexDirection: "row", gap: 10 },
  momoBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.default, paddingVertical: 14,
  },
  momoBtnOrange: { borderColor: "#FF660055", backgroundColor: "#FF660011" },
  momoBtnMtn:    { borderColor: "#FACC1555", backgroundColor: "#FACC1511" },
  momoEmoji: { fontSize: 18 },
  momoLabel: { fontSize: 12, fontWeight: "600", color: colors.text.secondary },

  dialCodeBox: {
    backgroundColor: colors.bg.elevated, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border.strong,
    paddingHorizontal: 12, paddingVertical: 13,
  },
  dialCode: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },

  // Buttons
  addCartBtn: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full, paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.brand.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  addCartBtnText: { fontSize: 15, fontWeight: "800", color: "#0A0A0A" },

  submitBtn: {
    backgroundColor: "#25D366", borderRadius: radius.full, paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#25D366", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  submitBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  // Comment ça marche toggle
  howToggle: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.bg.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border.default,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  howToggleText: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  howToggleChevron: { fontSize: 11, color: colors.text.muted },

  // Info bubble
  infoCard: {
    backgroundColor: colors.bg.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border.default,
    padding: 16, gap: 14,
  },
  infoTitle: { fontSize: 14, fontWeight: "800", color: colors.text.primary },
  infoStep: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoStepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.brand.gold,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  infoStepNumText: { fontSize: 13, fontWeight: "800", color: "#0A0A0A" },
  infoStepTitle: { fontSize: 13, fontWeight: "800", color: colors.text.primary, marginBottom: 2 },
  infoStepText: { fontSize: 12, color: colors.text.secondary, lineHeight: 18 },

  // Branding footer
  brandFooter: {
    alignItems: "center", gap: 4,
    paddingVertical: 20,
    borderTopWidth: 1, borderTopColor: colors.border.default,
  },
  brandName: { fontSize: 16, fontWeight: "900", color: colors.brand.gold, letterSpacing: 2 },
  brandTagline: { fontSize: 12, color: colors.text.muted, textAlign: "center" },
});
