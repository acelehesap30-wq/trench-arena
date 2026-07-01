"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X, Bell, ChevronRight, User, LogOut, Wallet } from "lucide-react";
import dynamic from "next/dynamic";
import DepositModal from "@/components/DepositModal";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const navLinks = [
  { href: "/", label: "CASINO", exact: true },
  { href: "/sports", label: "SPOR" },
  { href: "/live-casino", label: "CANLI CASINO" },
  { href: "/tournaments", label: "TURNUVALAR" },
  { href: "/polymarket", label: "POLYMARKET" },
  { href: "/web3-trading", label: "WEB3", badge: "YENİ" },
];

export default function Header() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const pathname = usePathname();
  const { session, balance, logout } = useAuth();
  const { disconnect } = useWallet();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    if (disconnect) {
      await disconnect();
    }
    setIsMobileMenuOpen(false);
  };

  // Simulated online count from Supabase presence (realistic range)
  useEffect(() => {
    const base = 1247 + Math.floor(Math.random() * 300);
    setOnlineCount(base);
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 11) - 5);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus search input
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <>
      <header className="h-16 glass-premium border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMobileMenuOpen(true)} className="xl:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
            TRENCH<span className="text-[#16a34a]">BET</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1 text-sm font-extrabold tracking-wider text-gray-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 ${
                  isActive(link.href, link.exact)
                    ? "text-white bg-white/5"
                    : ""
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="bg-[#16a34a] text-black text-[9px] px-1.5 py-0.5 rounded-sm font-black animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Online Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
            <span className="font-mono font-bold text-[#16a34a]">{onlineCount.toLocaleString()}</span>
            <span>çevrimiçi</span>
          </div>

          {/* Search */}
          <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
          </button>

          {/* Deposit */}
          <button
            onClick={() => setIsDepositOpen(true)}
            className="btn-premium px-4 md:px-6 py-2.5 text-xs md:text-sm animate-glow-pulse"
          >
            <span className="hidden md:inline">KRİPTO YATIR</span>
            <span className="md:hidden"><Wallet className="w-4 h-4" /></span>
          </button>

          {session ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/profile" className="flex flex-col text-right hover:opacity-80 transition-opacity bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-gray-500 hidden md:block">{session.user.email?.split('@')[0]}</span>
                <span className="text-sm font-bold text-[#16a34a] font-mono">${balance.toFixed(2)}</span>
              </Link>
              <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAuthType('LOGIN'); setIsAuthOpen(true); }}
                className="text-white hover:text-[#16a34a] font-bold text-xs md:text-sm px-3 md:px-4 py-2 transition-colors hidden sm:block"
              >
                GİRİŞ
              </button>
              <button
                onClick={() => { setAuthType('REGISTER'); setIsAuthOpen(true); }}
                className="bg-white/5 border border-white/10 hover:border-[#16a34a] text-white hover:text-[#16a34a] px-3 md:px-5 py-2 rounded-lg font-bold text-xs md:text-sm transition-all"
              >
                KAYIT OL
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] mobile-drawer-overlay"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-[#0a0a0a] border-r border-white/5 z-[101] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <span className="text-xl font-black text-white">TRENCH<span className="text-[#16a34a]">BET</span></span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {session && (
                <div className="p-5 border-b border-white/5 bg-[#050505]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16a34a] to-blue-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{session.user.email?.split('@')[0]}</p>
                      <p className="text-lg font-black text-[#16a34a] font-mono">${balance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-xl text-sm font-bold transition-all ${
                      isActive(link.href, link.exact)
                        ? "bg-[#16a34a]/10 text-[#16a34a] border-l-4 border-[#16a34a]"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="bg-[#16a34a] text-black text-[9px] px-1.5 py-0.5 rounded-sm font-black">
                        {link.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-white/5 space-y-3">
                <button
                  onClick={() => { setIsDepositOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full btn-premium py-3 text-sm"
                >
                  KRİPTO YATIR
                </button>
                {!session && (
                  <button
                    onClick={() => { setAuthType('LOGIN'); setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    GİRİŞ YAP / KAYIT OL
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex flex-col items-center pt-[20vh]"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Oyun, spor, market ara..."
                  className="w-full bg-[#14151a] border border-white/10 rounded-2xl py-5 pl-16 pr-14 text-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#16a34a] transition-colors font-medium"
                />
                <button onClick={() => setIsSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p className="text-center text-gray-600 text-sm mt-4">ESC ile kapatın · Aramaya başlayın</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={session?.user} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} type={authType} />
    </>
  );
}
