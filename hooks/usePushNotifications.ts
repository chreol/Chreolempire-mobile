import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Remote push tokens removed from Expo Go since SDK 53 — local notifications still work
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

export async function scheduleOrderNotification(type: "submitted" | "processing" | "done", detail?: string) {
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
      title: "🎉 Commande traitée !",
      body: detail ? `Votre commande ${detail} a été traitée avec succès.` : "Votre commande a été livrée !",
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

      // Remote push token — only in standalone/dev builds, not Expo Go
      if (!isExpoGo) {
        await Notifications.getExpoPushTokenAsync();
      }
    })();

    listenerRef.current = Notifications.addNotificationReceivedListener(() => {});

    return () => { listenerRef.current?.remove(); };
  }, []);
}
