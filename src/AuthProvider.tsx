import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";
import { AuthContext, type Profile } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;

    let cancelled = false;

    (async () => {
      setProfileLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      setProfile(data);
      setProfileLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createProfile(username: string) {
    const userId = session?.user.id;
    if (!userId) return { error: "you must be signed in." };

    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: userId, username })
      .select("id, username")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { error: "that username is already taken." };
      }
      if (error.code === "23514") {
        return {
          error:
            "usernames must be 3-20 characters and use only letters, numbers, and underscores.",
        };
      }
      return { error: error.message };
    }

    setProfile(data);
    return { error: null };
  }

  async function deleteProfile() {
    const userId = session?.user.id;
    if (!userId) return { error: "you must be signed in." };

    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) return { error: error.message };

    setProfile(null);
    await signOut();
    return { error: null };
  }

  const hasUser = session?.user != null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        profile: hasUser ? profile : null,
        profileLoading: hasUser ? profileLoading : false,
        createProfile,
        deleteProfile,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
