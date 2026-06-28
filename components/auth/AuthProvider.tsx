"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// App-wide auth state from the Supabase browser client. Defensive: if the
// public Supabase env vars are missing (e.g. a local shell with only the URL
// set), it stays in a logged-out state instead of throwing, so the page still
// renders. The account/paywall UI then shows a "not configured" message rather
// than a white screen.

interface AuthValue {
  user: User | null;
  loading: boolean;
  /** True when Supabase is wired up (env present). */
  ready: boolean;
  client: SupabaseClient | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  ready: false,
  client: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return null;
    }
    return createSupabaseBrowserClient();
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }
    let active = true;
    client.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setLoading(false);
    });
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      ready: client !== null,
      client,
      signOut: async () => {
        if (client) await client.auth.signOut();
        setUser(null);
      },
    }),
    [user, loading, client]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
