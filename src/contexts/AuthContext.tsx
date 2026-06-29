"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  session: any | null;
  balance: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  balance: 0,
  loading: true,
  refreshBalance: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('balance').eq('id', userId).single();
      if (data) setBalance(data.balance || 0);
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await fetchBalance(session.user.id);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchBalance(session.user.id);
      } else {
        setBalance(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshBalance = async () => {
    if (session?.user) {
      await fetchBalance(session.user.id);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setBalance(0);
  };

  return (
    <AuthContext.Provider value={{ session, balance, loading, refreshBalance, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
