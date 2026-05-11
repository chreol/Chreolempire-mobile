import { useState, useRef } from "react";
import { View, Text, FlatList, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { colors, radius } from "@/constants/theme";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    emoji: "⚡",
    title: "Livraison Instantanée",
    description: "Recevez vos codes et crédits de jeu en moins de 5 minutes, directement sur votre email.",
    accent: colors.brand.gold,
  },
  {
    id: "2",
    emoji: "🔒",
    title: "100% Sécurisé",
    description: "Paiement via Orange Money, MTN MoMo ou Crypto. Vos transactions sont chiffrées et protégées.",
    accent: colors.brand.blue,
  },
  {
    id: "3",
    emoji: "🎮",
    title: "Tous Vos Jeux Favoris",
    description: "Robux, PSN, Steam, Xbox, Netflix et plus encore. Tout au meilleur prix au Cameroun.",
    accent: colors.accent.green,
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
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {/* Glow */}
            <MotiView
              from={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.15, scale: 1.8 }}
              transition={{ type: "timing", duration: 1000 }}
              style={[styles.glow, { backgroundColor: item.accent }]}
            />

            {/* Emoji icon */}
            <MotiView
              from={{ scale: 0, rotate: "-20deg" }}
              animate={{ scale: 1, rotate: "0deg" }}
              transition={{ type: "spring", damping: 12, delay: 100 }}
              style={[styles.iconContainer, { borderColor: item.accent + "44" }]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </MotiView>

            {/* Text */}
            <MotiView
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500, delay: 300 }}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </MotiView>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <MotiView
              key={i}
              animate={{
                width: i === activeIndex ? 24 : 8,
                backgroundColor: i === activeIndex ? colors.brand.blue : colors.text.muted,
              }}
              transition={{ type: "timing", duration: 250 }}
              style={styles.dot}
            />
          ))}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={styles.button}>
          <Text style={styles.buttonText}>
            {activeIndex === slides.length - 1 ? "Commencer →" : "Suivant →"}
          </Text>
        </TouchableOpacity>

        {/* Skip */}
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
  slide: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  glow: { position: "absolute", width: 280, height: 280, borderRadius: 140 },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  emoji: { fontSize: 56 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomControls: { paddingHorizontal: 24, paddingBottom: 48, alignItems: "center" },
  dots: { flexDirection: "row", gap: 6, marginBottom: 32 },
  dot: { height: 8, borderRadius: 4 },
  button: {
    backgroundColor: colors.brand.blue,
    borderRadius: radius.full,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  skip: { marginTop: 16 },
  skipText: { color: colors.text.secondary, fontSize: 14 },
});
