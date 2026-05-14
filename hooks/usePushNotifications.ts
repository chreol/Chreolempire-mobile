import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isNative = Platform.OS === "android" || Platform.OS === "ios";

const PUSH_TOKEN_KEY = "@chreolempire_push_token";
const isExpoGo = Constants.appOwnership === "expo";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Récupère le push token (depuis le cache ou Expo)
export async function getPushToken(): Promise<string | null> {
  try {
    // En Expo Go on ne peut pas obtenir de vrai token push — on utilise un ID appareil
    const cached = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (cached) return cached;

    if (isExpoGo) {
      // Fallback : ID unique basé sur l'installation
      const fallback = `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, fallback);
      return fallback;
    }

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    const token = tokenData.data;
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

export async function scheduleOrderNotification(
  type: "submitted" | "processing" | "done",
  detail?: string
) {
  if (!isNative) return;
  const messages = {
    submitted: {
      title: "✅ Commande reçue !",
      body: `Merci pour votre commande${detail ? ` — ${detail}` : ""}. Elle est en cours de traitement.`,
    },
    processing: {
      title: "⚙️ En traitement",
      body: "Votre commande est en cours de vérification par notre équipe.",
    },
    done: {
      title: "🎉 Commande livrée !",
      body: detail
        ? `Votre code est disponible : ${detail}`
        : "Votre commande a été livrée avec succès !",
    },
  };

  const msg = messages[type];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: true,
      data: { type },
    },
    trigger: null,
  });
}

export function usePushNotifications() {
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isNative) return;
    (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("orders", {
          name: "Commandes Chreol Empire",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#C9A84C",
          sound: "default",
        });
      }

      // Initialise et met en cache le token
      await getPushToken();
    })();

    listenerRef.current = Notifications.addNotificationReceivedListener(() => {});
    return () => { listenerRef.current?.remove(); };
  }, []);
}
