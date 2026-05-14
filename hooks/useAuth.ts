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
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (DEMO_MODE) {
      const t = setTimeout(() => {
        setUser(DEMO_USER);
        setLoading(false);
      }, 1000);
      return () => clearTimeout(t);
    }

    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const { auth } = await import("@/lib/firebase");
        const { onAuthStateChanged } = await import("firebase/auth");
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(
            firebaseUser
              ? {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email ?? "",
                  displayName: firebaseUser.displayName ?? "Utilisateur",
                  photoURL: firebaseUser.photoURL,
                }
              : null
          );
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    })();

    return () => unsubscribe?.();
  }, []);

  const signInWithGoogle = async (): Promise<{ user: MockUser; isNew: boolean }> => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return { user: DEMO_USER, isNew: false };
    }

    setSigningIn(true);
    try {
      const { GoogleSignin } = await import(
        "@react-native-google-signin/google-signin"
      );

      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === "cancelled") throw new Error("cancelled");

      const { auth } = await import("@/lib/firebase");
      const {
        GoogleAuthProvider,
        signInWithCredential,
        getAdditionalUserInfo,
      } = await import("firebase/auth");

      const credential = GoogleAuthProvider.credential(response.data.idToken);
      const result = await signInWithCredential(auth, credential);
      const isNew = getAdditionalUserInfo(result)?.isNewUser ?? false;

      const mappedUser: MockUser = {
        uid: result.user.uid,
        email: result.user.email ?? "",
        displayName: result.user.displayName ?? "Utilisateur",
        photoURL: result.user.photoURL,
      };

      setUser(mappedUser);
      return { user: mappedUser, isNew };
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null);
      return;
    }
    try {
      const { GoogleSignin } = await import(
        "@react-native-google-signin/google-signin"
      );
      const { auth } = await import("@/lib/firebase");
      const { signOut: fbSignOut } = await import("firebase/auth");
      await GoogleSignin.signOut().catch(() => {});
      await fbSignOut(auth);
    } catch {}
  };

  return { user, loading, signingIn, isAuthenticated: !!user, signInWithGoogle, signOut };
}
