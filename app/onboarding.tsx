import { useState, useRef } from "react";
import { View, Text, FlatList, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";

const { width } = Dimensions.get("window");

const IMG_PSN    = require("../assets/PlayStation_Store_Card.png");
const IMG_CPN    = require("../assets/PCs MAstercard Transcash bureau de Change coupon de Deido.jpg");
const IMG_STORE  = require("../assets/boutique.jpg");

const slides = [
  {
    id: "1",
    image: IMG_PSN,
    bgImage: IMG_STORE,
    title: "Cartes Cadeaux & Crédits",
    description: "PSN, iTunes, Roblox, Xbox, Netflix et plus. Livraison express en 15–30 min par Email ou WhatsApp.",
    accent: colors.brand.gold,
  },
  {
    id: "2",
    image: IMG_CPN,
    bgImage: IMG_STORE,
    title: "100% Sécurisé",
    description: "Paiement via Orange Money ou MTN MoMo. Vos transactions sont vérifiées et protégées.",
    accent: "#25D366",
  },
  {
    id: "3",
    image: IMG_CPN,
    bgImage: IMG_STORE,
    title: "Crypto & PayPal",
    description: "Achetez et vendez du USDT, Bitcoin, TRX. Échangez votre solde PayPal en FCFA instantanément.",
    accent: "#26A17B",
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const listRef = useRef<FlatList>(null);

  const goNext = () => {
    if (activeIndex < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      router.replace("/auth");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {/* Background illustration */}
            <View style={styles.imageCard}>
              <Image source={item.bgImage} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={400} />
              <View style={[styles.imageOverlay, { backgroundColor: item.accent }]} />
              <Image source={item.image} style={styles.serviceImage} contentFit="contain" />
            </View>

            <MotiView
              from={{ opacity: 0, translateY: 24 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500, delay: 200 }}
              style={styles.textBlock}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </MotiView>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <MotiView
              key={i}
              animate={{ width: i === activeIndex ? 24 : 8, backgroundColor: i === activeIndex ? colors.brand.gold : colors.border.strong }}
              transition={{ type: "timing", duration: 250 }}
              style={styles.dot}
            />
          ))}
        </View>

        <TouchableOpacity onPress={goNext} style={styles.btn}>
          <Text style={styles.btnText}>{activeIndex === slides.length - 1 ? "Commencer →" : "Suivant →"}</Text>
        </TouchableOpacity>

        {activeIndex < slides.length - 1 && (
          <TouchableOpacity onPress={() => router.replace("/auth")} style={styles.skip}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 32 },
  imageCard: {
    width: 240, height: 240, borderRadius: 40,
    overflow: "hidden", alignItems: "center", justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
  },
  imageOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.45 },
  serviceImage: { width: 160, height: 120, zIndex: 1 },
  textBlock: { alignItems: "center", gap: 12 },
  title: { fontSize: 26, fontWeight: "900", color: colors.text.primary, textAlign: "center", letterSpacing: -0.5 },
  description: { fontSize: 15, color: colors.text.secondary, textAlign: "center", lineHeight: 23 },
  bottom: { paddingHorizontal: 28, paddingBottom: 52, alignItems: "center", gap: 20 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  btn: {
    backgroundColor: colors.brand.gold, borderRadius: radius.full,
    paddingVertical: 16, paddingHorizontal: 40, width: "100%", alignItems: "center",
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  skip: {},
  skipText: { color: colors.text.muted, fontSize: 14 },
});
