import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "@chreolempire_profile_v1";

export interface Profile {
  name: string;
  email: string;
  city: string;
  birthMonth: number | null; // 1-12
  hasProfile: boolean;
  photoUri: string | null;
}

const DEFAULT: Profile = {
  name: "", email: "", city: "", birthMonth: null, hasProfile: false, photoUri: null,
};

interface ProfileContextType {
  profile: Profile;
  saveProfile: (data: Omit<Profile, "hasProfile">) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePhoto: (uri: string) => Promise<void>;
  resetProfile: () => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setProfile(JSON.parse(raw)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const persist = async (data: Profile) => {
    setProfile(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const saveProfile = async (data: Omit<Profile, "hasProfile">) => {
    await persist({ ...data, hasProfile: true });
    // Email de bienvenue si l'utilisateur a renseigné son email
    if (data.email?.trim()) {
      supabase.functions.invoke("send-welcome-email", {
        body: { email: data.email.trim(), name: data.name?.trim() },
      }).catch(() => { /* silencieux si hors ligne */ });
    }
  };

  const updateEmail = async (email: string) => {
    await persist({ ...profile, email });
  };

  const updatePhoto = async (uri: string) => {
    await persist({ ...profile, photoUri: uri });
  };

  const resetProfile = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT);
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, updateEmail, updatePhoto, resetProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
