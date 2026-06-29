"use client";

import { X, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'LOGIN' | 'REGISTER';
}

export default function AuthModal({ isOpen, onClose, type }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(type === 'LOGIN');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Özel Admin Yönlendirmesi (Mock)
        if (email === "berkecansuskun1998@gmail.com" && password === "7892858a") {
          window.location.href = "/admin";
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert("Giriş Başarılı!");
        onClose();
        window.location.reload();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Kayıt Başarılı! E-postanızı onaylayın veya direkt giriş yapın.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        >
          <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#14151a]">
            <h2 className="text-white font-bold tracking-wide">{isLogin ? "GİRİŞ YAP" : "KAYIT OL"}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">E-Posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-[#16a34a] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-bold uppercase">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-[#16a34a] outline-none transition-colors"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-3 rounded-lg font-bold text-sm transition-all shadow-[0_0_10px_rgba(22,163,74,0.3)] disabled:opacity-50"
              >
                {loading ? "BEKLEYİN..." : (isLogin ? "GİRİŞ YAP" : "KAYIT OL")}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-white/5 pt-4">
              <span className="text-xs text-gray-500">
                {isLogin ? "Hesabın yok mu? " : "Zaten üye misin? "}
              </span>
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-[#16a34a] font-bold hover:underline"
              >
                {isLogin ? "Kayıt Ol" : "Giriş Yap"}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col items-center">
              <span className="text-xs text-gray-500 font-bold uppercase mb-3">Veya Web3 Cüzdanı İle</span>
              
              {/* Solana Wallet Button */}
              <div className="w-full flex justify-center wallet-auth-wrapper">
                <WalletMultiButton className="!bg-[#512da8] hover:!bg-[#4527a0] !w-full !rounded-lg !py-3 !font-bold !text-sm !transition-all !shadow-[0_0_10px_rgba(81,45,168,0.3)] !flex !justify-center" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
