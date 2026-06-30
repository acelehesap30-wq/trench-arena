"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Flame, Bell } from "lucide-react";
import dynamic from "next/dynamic";
import DepositModal from "@/components/DepositModal";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

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
  const pathname = usePathname();
  const { session, balance, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="h-20 glass-premium border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Menu className="w-6 h-6 text-gray-400 cursor-pointer xl:hidden hover:text-white transition-colors" />
            <Link href="/" className="text-3xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
              TRENCH<span className="text-[#16a34a]">BET</span>
            </Link>
          </div>

          <nav className="hidden xl:flex items-center gap-8 text-sm font-extrabold tracking-wider text-gray-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-white transition-colors flex items-center gap-1 ${
                  isActive(link.href, link.exact)
                    ? "text-white border-b-2 border-[#16a34a] pb-7 pt-7"
                    : ""
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="bg-[#16a34a] text-black text-[10px] px-1.5 py-0.5 rounded-sm animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer mr-2 hidden md:block" />

          <button
            onClick={() => setIsDepositOpen(true)}
            className="btn-premium px-6 py-2.5 text-sm mr-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] animate-pulse"
          >
            KRİPTO YATIR
          </button>

          {session ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <Link href="/profile" className="flex flex-col text-right hover:opacity-80 transition-opacity">
                <span className="text-xs text-gray-500">{session.user.email?.split('@')[0]}</span>
                <span className="text-sm font-bold text-[#16a34a]">${balance.toFixed(2)}</span>
              </Link>
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white underline ml-2">Çıkış</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <button
                onClick={() => { setAuthType('LOGIN'); setIsAuthOpen(true); }}
                className="text-white hover:text-[#16a34a] font-bold text-sm px-4 py-2 transition-colors"
              >
                GİRİŞ YAP
              </button>
              <button
                onClick={() => { setAuthType('REGISTER'); setIsAuthOpen(true); }}
                className="bg-transparent border-2 border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a] hover:text-white px-6 py-2 rounded-lg font-bold text-sm transition-all"
              >
                KAYIT OL
              </button>
            </div>
          )}
        </div>
      </header>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={session?.user} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} type={authType} />
    </>
  );
}
