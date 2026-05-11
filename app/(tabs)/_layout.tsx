import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/constants/theme";

const LOGO_NEW = require("../../assets/chreol empire  new.jpeg");

function AccueilIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[S.logoWrap, focused && S.logoWrapFocused]}>
      <Image source={LOGO_NEW} style={S.logoImg} contentFit="cover" />
    </View>
  );
}

function ServicesIcon({ focused }: { focused: boolean }) {
  const c = focused ? "#0A0A0A" : "rgba(0,0,0,0.4)";
  return (
    <View style={[S.grid, { borderColor: c }]}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[S.dot, { backgroundColor: c }]} />
      ))}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#0A0A0A",
        tabBarInactiveTintColor: "rgba(0,0,0,0.45)",
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ focused }) => <AccueilIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ focused }) => <ServicesIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Historique",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🕐</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Mon Compte",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>👤</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="paiement"
        options={{
          title: "Paiement",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>💳</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const S = StyleSheet.create({
  logoWrap: {
    width: 28, height: 28, borderRadius: 14,
    overflow: "hidden", opacity: 0.5,
  },
  logoWrapFocused: {
    opacity: 1,
    borderWidth: 1.5, borderColor: "#0A0A0A",
    borderRadius: 14,
  },
  logoImg: { width: 28, height: 28 },

  grid: {
    width: 26, height: 26, borderRadius: 7,
    borderWidth: 2,
    flexDirection: "row", flexWrap: "wrap",
    alignContent: "space-around", justifyContent: "space-around",
    paddingHorizontal: 3, paddingVertical: 3,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.brand.gold,
    borderTopWidth: 0,
    height: 62,
    paddingBottom: 8,
    paddingTop: 4,
    elevation: 16,
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  tabLabel: { fontSize: 10, fontWeight: "700" },
});
