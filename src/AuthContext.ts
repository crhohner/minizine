import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  username: string;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  createProfile: (username: string) => Promise<{ error: string | null }>;
  deleteProfile: () => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
