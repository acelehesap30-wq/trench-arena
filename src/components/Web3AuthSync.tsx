"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function Web3AuthSync() {
  const { publicKey, connected } = useWallet();
  const { session } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncWalletWithSupabase = async () => {
      // If wallet is connected but no supabase session, try to auth
      if (connected && publicKey && !session && !isSyncing) {
        setIsSyncing(true);
        const pubKeyStr = publicKey.toString();
        const dummyEmail = `${pubKeyStr}@trencharena.sol`;
        const dummyPassword = `wallet_${pubKeyStr}_pwd!`;

        try {
          // Attempt to login
          const { error } = await supabase.auth.signInWithPassword({
            email: dummyEmail,
            password: dummyPassword,
          });

          if (error) {
            // If login fails, likely user doesn't exist. Attempt to sign up.
            const { error: signUpError } = await supabase.auth.signUp({
              email: dummyEmail,
              password: dummyPassword,
            });

            if (signUpError) {
              console.error("Wallet auto-signup failed:", signUpError);
              toast.error("Cüzdan ile giriş yapılamadı.");
            } else {
              toast.success("Web3 Cüzdan ile hesap oluşturuldu!");
              window.location.reload(); // Reload to apply auth state across app
            }
          } else {
            toast.success("Web3 Cüzdan ile giriş yapıldı!");
            window.location.reload();
          }
        } catch (err) {
          console.error("Sync error:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    syncWalletWithSupabase();
  }, [connected, publicKey, session]);

  return null;
}
