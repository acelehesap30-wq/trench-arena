"use client";

import Link from "next/link";
import { Shield, Globe, Lock, Zap, MessageSquare, Mail, ExternalLink } from "lucide-react";

const quickLinks = [
  { label: "Casino", href: "/" },
  { label: "Spor Bahisleri", href: "/sports" },
  { label: "Canlı Casino", href: "/live-casino" },
  { label: "Turnuvalar", href: "/tournaments" },
  { label: "Polymarket", href: "/polymarket" },
  { label: "Web3 Trading", href: "/web3-trading" },
];

const supportLinks = [
  { label: "SSS", href: "#" },
  { label: "Sorumlu Bahis", href: "#" },
  { label: "Gizlilik Politikası", href: "#" },
  { label: "Kullanım Koşulları", href: "#" },
  { label: "Provably Fair", href: "#" },
  { label: "İletişim", href: "#" },
];

const providers = ["Pragmatic Play", "Evolution", "Spribe", "TRENCH Originals"];
const paymentMethods = ["BTC", "ETH", "SOL", "TRX", "TON", "USDT", "USDC"];

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 mt-auto relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[#16a34a]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-3xl font-black tracking-tighter text-white mb-4 block">
              TRENCH<span className="text-[#16a34a]">BET</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Kripto dünyasının en gelişmiş bahis ve trading platformu. Provably fair teknolojisi, anlık para yatırma/çekme ve 7/24 canlı destek.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#16a34a] hover:text-black hover:border-[#16a34a] text-gray-400 transition-all group">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#5865F2] hover:text-white hover:border-[#5865F2] text-gray-400 transition-all">
                <MessageSquare className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#0088cc] hover:text-white hover:border-[#0088cc] text-gray-400 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white text-gray-400 transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Hızlı Erişim</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group font-medium">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#16a34a] transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Destek & Bilgi</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group font-medium">
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-[#16a34a] transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Ödeme Yöntemleri</h4>
            <div className="flex flex-wrap gap-2 mb-8">
              {paymentMethods.map((method) => (
                <div key={method} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-default">
                  {method}
                </div>
              ))}
            </div>
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Sağlayıcılar</h4>
            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <span key={p} className="text-[10px] font-bold text-gray-500 bg-white/5 border border-white/5 px-2 py-1 rounded">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 py-8 border-t border-b border-white/5 mb-8">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
            <Shield className="w-5 h-5 text-[#16a34a]" />
            <span>SSL 256-BIT ŞİFRELEME</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
            <Lock className="w-5 h-5 text-blue-500" />
            <span>PROVABLY FAIR</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>ANLIK PARA ÇEKME</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
            <Globe className="w-5 h-5 text-purple-500" />
            <span>GLOBAL LİSANS</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} TRENCHBET. Tüm hakları saklıdır. Lisans No: CUR-2024-0892</p>
          <p className="text-center max-w-lg leading-relaxed">
            18+ Kumar bağımlılık yapabilir. Lütfen sorumlu oynayın. Kaybetmeyi göze alabileceğiniz miktarlarla oynayın.
          </p>
        </div>
      </div>
    </footer>
  );
}
