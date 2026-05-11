import { useState, useEffect } from "react";

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "true";

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

const DEMO_USER: MockUser = {
  uid: "demo-user-123",
  email: "demo@chreolempire.com",
  displayName: "Chreol Demo",
  photoURL: null,
};

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      // En mode démo, on simule un utilisateur connecté après 1s
      const t = setTimeout(() => {
        setUser(DEMO_USER);
        setLoading(false);
      }, 1000);
      return () => clearTimeout(t);
    }

    // Mode production: Firebase Auth
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const { auth } = await import("@/lib/firebase");
        const { onAuthStateChanged } = await import("firebase/auth");
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? "Utilisateur",
              photoURL: firebaseUser.photoURL,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    })();

    return () => unsubscribe?.();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
