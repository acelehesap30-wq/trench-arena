"use client";

import { Activity, ShieldAlert, Zap, Search, Bell, Menu, Play, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import DepositModal from "@/components/DepositModal";

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function Home() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // Mock Casino Games Data
  const games = [
    { id: 1, title: "Deep Needle", provider: "TRENCH Originals", image: "🎯", hot: true, link: "/deep-needle" },
    { id: 2, title: "Dead Cat Bounce", provider: "TRENCH Originals", image: "📉", hot: false, link: "/deep-needle" },
    { id: 3, title: "DCA Strateji Masası", provider: "TRENCH Originals", image: "🤖", hot: true, link: "/deep-needle" },
    { id: 4, title: "Tarihi Makro-Arena", provider: "TRENCH Originals", image: "🏛️", hot: false, link: "/deep-needle" },
    { id: 5, title: "Sweet Bonanza", provider: "Pragmatic Play", image: "🍬", hot: true, link: "#" },
    { id: 6, title: "Gates of Olympus", provider: "Pragmatic Play", image: "⚡", hot: true, link: "#" },
    { id: 7, title: "Aviator", provider: "Spribe", image: "✈️", hot: true, link: "#" },
    { id: 8, title: "Crazy Time", provider: "Evolution", image: "🎡", hot: false, link: "#" },
    { id: 9, title: "Lightning Roulette", provider: "Evolution", image: "🌩️", hot: false, link: "#" },
    { id: 10, title: "Sugar Rush", provider: "Pragmatic Play", image: "🐻", hot: false, link: "#" },
    { id: 11, title: "Spaceman", provider: "Pragmatic Play", image: "🚀", hot: false, link: "#" },
    { id: 12, title: "Mega Roulette", provider: "Pragmatic Play", image: "🎰", hot: false, link: "#" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans overflow-x-hidden flex flex-col">
      
      {/* Top Header - Setrabet Style */}
      <header className="h-16 bg-[#14151a] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Menu className="w-6 h-6 text-gray-400 cursor-pointer lg:hidden" />
            <span className="text-2xl font-black tracking-tighter text-white">
              TRENCH<span className="text-[#16a34a]">BET</span>
            </span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold tracking-wide">
            <Link href="#" className="text-white hover:text-[#16a34a] transition-colors">SPOR BAHİSLERİ</Link>
            <Link href="#" className="text-white hover:text-[#16a34a] transition-colors">CANLI BAHİS</Link>
            <Link href="#" className="text-[#16a34a] border-b-2 border-[#16a34a] pb-5 pt-5">CASINO</Link>
            <Link href="#" className="text-white hover:text-[#16a34a] transition-colors">CANLI CASINO</Link>
            <Link href="#" className="text-white hover:text-[#16a34a] transition-colors flex items-center gap-1">
              WEB3 ORİJİNALLERİ <span className="bg-red-500 text-white text-[9px] px-1 rounded animate-pulse">YENİ</span>
            </Link>
            <Link href="#" className="text-white hover:text-[#16a34a] transition-colors">PROMOSYONLAR</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex flex-col text-right">
              <span className="text-xs text-gray-500">Bakiye</span>
              <span className="text-sm font-bold text-[#16a34a]">0.00 USD</span>
            </div>
            <button 
              onClick={() => setIsDepositOpen(true)}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white px-6 py-2 rounded font-bold text-sm transition-all shadow-[0_0_10px_rgba(22,163,74,0.3)]"
            >
              PARA YATIR
            </button>
          </div>
          <div className="hidden sm:block">
            <WalletMultiButtonDynamic />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex w-full max-w-[1800px] mx-auto">
        
        {/* Left Sidebar (Providers / Categories) */}
        <aside className="w-64 hidden xl:block bg-[#14151a] border-r border-white/5 p-4 overflow-y-auto shrink-0">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Oyun Ara..." 
              className="w-full bg-[#0b0e11] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-[#16a34a] outline-none transition-colors"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kategoriler</h3>
              <ul className="space-y-2 text-sm font-medium text-gray-300">
                <li className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer text-white bg-white/5 border-l-2 border-[#16a34a]">
                  <Star className="w-4 h-4 text-[#16a34a]" /> Popüler Oyunlar
                </li>
                <li className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                  <Activity className="w-4 h-4 text-blue-400" /> Web3 Trading
                </li>
                <li className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                  <Play className="w-4 h-4 text-red-400" /> Video Slotlar
                </li>
                <li className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                  <Zap className="w-4 h-4 text-amber-400" /> Crash Oyunları
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sağlayıcılar</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer hover:text-white">
                  <span>TRENCH Originals</span> <span className="text-xs bg-white/10 px-2 rounded">4</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer hover:text-white">
                  <span>Pragmatic Play</span> <span className="text-xs bg-white/10 px-2 rounded">342</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer hover:text-white">
                  <span>Evolution</span> <span className="text-xs bg-white/10 px-2 rounded">128</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer hover:text-white">
                  <span>Spribe</span> <span className="text-xs bg-white/10 px-2 rounded">8</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Center Content (Banner + Games Grid) */}
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          
          {/* Hero Banner Slider (Mock) */}
          <div className="w-full h-48 md:h-64 lg:h-80 rounded-2xl bg-gradient-to-r from-[#16a34a]/20 to-[#0b0e11] border border-[#16a34a]/30 mb-8 relative overflow-hidden flex items-center px-8 md:px-16 group cursor-pointer">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block py-1 px-3 rounded bg-[#16a34a] text-white text-xs font-bold mb-4 uppercase tracking-widest">
                Web3 Özel
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                DEEP NEEDLE <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#16a34a]">PRO TERMINAL</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base mb-6 max-w-md">
                Gerçek zamanlı Pyth verileriyle %99 çöküş anlarında asimetrik risk alın. Saniyelik iğne hareketlerini avlayın.
              </p>
              <Link href="/deep-needle" className="inline-block bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition-colors">
                HEMEN OYNA
              </Link>
            </div>

            {/* Decorative Element */}
            <div className="absolute right-0 bottom-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 w-1/2 h-full bg-gradient-to-l from-[#16a34a] to-transparent mix-blend-screen"></div>
          </div>

          {/* Games Section */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Star className="w-6 h-6 text-[#16a34a]" /> Popüler Oyunlar
                </h2>
                <p className="text-gray-500 text-sm mt-1">En çok kazandıran global casino oyunları</p>
              </div>
              <button className="text-sm text-gray-400 hover:text-white font-medium">TÜMÜ &gt;</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
              {games.map((game) => (
                <Link href={game.link} key={game.id} className="casino-card group relative aspect-[4/3] sm:aspect-[3/4] flex flex-col items-center justify-center bg-[#1a1c23]">
                  {game.hot && (
                    <div className="absolute top-2 right-2 z-20 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      HOT
                    </div>
                  )}
                  
                  {/* Game Thumbnail Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-6xl group-hover:scale-110 transition-transform duration-500">
                    {game.image}
                  </div>
                  
                  {/* Overlay Info */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h4 className="text-white font-bold text-sm truncate">{game.title}</h4>
                    <p className="text-gray-400 text-xs truncate">{game.provider}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </main>
      </div>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
    </div>
  );
}
