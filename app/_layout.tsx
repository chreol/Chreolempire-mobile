import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { CartProvider } from "@/contexts/CartContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import { LoyaltyProvider } from "@/contexts/LoyaltyContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import FloatingWaBot from "@/components/FloatingWaBot";

function NotificationsInit() { usePushNotifications(); return null; }

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProvider>
      <LoyaltyProvider>
      <HistoryProvider>
      <CartProvider>
        <NotificationsInit />
        <StatusBar style="light" backgroundColor="#0A0B0F" />
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cart" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
          <Stack.Screen name="services/cartes-cadeaux" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="services/uba" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="services/coupons" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="services/crypto" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="services/paypal" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="services/factures" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="terms" options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="sitemap" options={{ animation: "slide_from_right" }} />
        </Stack>
        <FloatingWaBot />
      </CartProvider>
      </HistoryProvider>
      </LoyaltyProvider>
      </ProfileProvider>
    </GestureHandlerRootView>
  );
}
