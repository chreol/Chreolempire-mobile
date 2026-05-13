import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const STORAGE_KEY = "@chreolempire_profile_v1";

export interface Profile {
  name: string;
  email: string;
  city: string;
  birthMonth: number | null; // 1-12
  hasProfile: boolean;
}

const DEFAULT: Profile = {
  name: "", email: "", city: "", birthMonth: null, hasProfile: false,
};

interface ProfileContextType {
  profile: Profile;
  saveProfile: (data: Omit<Profile, "hasProfile">) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
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
  };

  const updateEmail = async (email: string) => {
    await persist({ ...profile, email });
  };

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, updateEmail, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
