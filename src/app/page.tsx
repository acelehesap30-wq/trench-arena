"use client";

import { Activity, ShieldAlert, Zap, Search, Bell, Menu, Play, Star, ChevronRight, Trophy, Flame } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import DepositModal from "@/components/DepositModal";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function Home() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'LOGIN'|'REGISTER'>('LOGIN');
  const [session, setSession] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>("TÜMÜ");
  
  const gamesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToGames = () => {
    gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleComingSoon = (feature: string) => {
    toast(`Canlı API Bağlantısı Kuruluyor: ${feature}`, {
      icon: '🚧',
      style: {
        borderRadius: '10px',
        background: '#14151a',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)'
      },
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Premium Casino Games Data
  const games = [
    { id: 1, title: "Deep Needle", provider: "TRENCH Originals", category: "WEB3", img: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=600", hot: true, link: "/deep-needle" },
    { id: 2, title: "Dead Cat Bounce", provider: "TRENCH Originals", category: "WEB3", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600", hot: false, link: "/deep-needle" },
    { id: 5, title: "Sweet Bonanza", provider: "Pragmatic Play", category: "SLOT", img: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=600", hot: true, link: "/game/sweet-bonanza" },
    { id: 6, title: "Gates of Olympus", provider: "Pragmatic Play", category: "SLOT", img: "https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=600", hot: true, link: "/game/gates-of-olympus" },
    { id: 7, title: "Aviator", provider: "Spribe", category: "CRASH", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600", hot: true, link: "/game/aviator" },
    { id: 8, title: "Crazy Time", provider: "Evolution", category: "LIVE", img: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=600", hot: false, link: "/game/crazy-time" },
    { id: 9, title: "Lightning Roulette", provider: "Evolution", category: "LIVE", img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=600", hot: false, link: "/game/lightning-roulette" },
    { id: 10, title: "Sugar Rush", provider: "Pragmatic Play", category: "SLOT", img: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600", hot: false, link: "/game/sugar-rush" },
  ];

  const filteredGames = activeCategory === "TÜMÜ" 
    ? games 
    : games.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden flex flex-col">
      
      {/* Top Header - Premium Style */}
      <header className="h-20 glass-premium border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Menu className="w-6 h-6 text-gray-400 cursor-pointer xl:hidden hover:text-white transition-colors" />
            <Link href="/" className="text-3xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
              TRENCH<span className="text-[#16a34a]">BET</span>
            </Link>
          </div>
          
          <nav className="hidden xl:flex items-center gap-8 text-sm font-extrabold tracking-wider text-gray-400">
            <button onClick={() => handleComingSoon("Spor Bahisleri API")} className="hover:text-white transition-colors">SPOR</button>
            <button onClick={() => handleComingSoon("Canlı Maç Verisi")} className="hover:text-white transition-colors flex items-center gap-1">CANLI BAHİS <Flame className="w-4 h-4 text-red-500" /></button>
            <button onClick={scrollToGames} className="text-white border-b-2 border-[#16a34a] pb-7 pt-7">CASINO</button>
            <button onClick={() => handleComingSoon("Evolution Live API")} className="hover:text-white transition-colors">CANLI CASINO</button>
            <button onClick={() => setActiveCategory("WEB3")} className="hover:text-white transition-colors flex items-center gap-2">
              WEB3 <span className="bg-[#16a34a] text-black text-[10px] px-1.5 py-0.5 rounded-sm animate-pulse">YENİ</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer mr-2 hidden md:block" />
          
          {session ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray-500">{session.user.email?.split('@')[0]}</span>
                <span className="text-sm font-bold text-[#16a34a]">$1,450.00</span>
              </div>
              <button 
                onClick={() => setIsDepositOpen(true)}
                className="btn-premium px-6 py-2.5 text-sm"
              >
                YATIRIM
              </button>
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white underline ml-2">Çıkış</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
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

      {/* Main Content Area */}
      <div className="flex-1 flex w-full max-w-[1920px] mx-auto">
        
        {/* Left Sidebar (Providers / Categories) */}
        <aside className="w-[280px] hidden 2xl:flex flex-col glass-premium border-r border-white/5 p-6 shrink-0 z-40">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">Lobi</h3>
              <ul className="space-y-1.5 text-sm font-bold text-gray-400">
                <li onClick={() => setActiveCategory("TÜMÜ")} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors ${activeCategory === 'TÜMÜ' ? 'bg-white/10 text-white border-l-4 border-[#16a34a] shadow-[inset_4px_0_0_0_#16a34a]' : ''}`}>
                  <Star className={`w-5 h-5 ${activeCategory === 'TÜMÜ' ? 'text-[#16a34a]' : ''}`} /> Popüler
                </li>
                <li onClick={() => handleComingSoon("Turnuva Sistemi")} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors">
                  <Trophy className="w-5 h-5 text-amber-500" /> Turnuvalar
                </li>
                <li onClick={() => setActiveCategory("SLOT")} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors ${activeCategory === 'SLOT' ? 'bg-white/10 text-white border-l-4 border-[#16a34a]' : ''}`}>
                  <Play className="w-5 h-5 text-red-500" /> Slot Oyunları
                </li>
                <li onClick={() => setActiveCategory("WEB3")} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors ${activeCategory === 'WEB3' ? 'bg-white/10 text-white border-l-4 border-[#16a34a]' : ''}`}>
                  <Activity className="w-5 h-5 text-blue-500" /> Web3 Trading
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">Sağlayıcılar</h3>
              <ul className="space-y-2 text-sm text-gray-400 font-medium">
                <li className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer hover:text-white transition-colors group">
                  <span className="group-hover:translate-x-1 transition-transform">Pragmatic Play</span>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-500 group-hover:bg-[#16a34a]/20 group-hover:text-[#16a34a]">342</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer hover:text-white transition-colors group">
                  <span className="group-hover:translate-x-1 transition-transform">Evolution Gaming</span>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-500 group-hover:bg-[#16a34a]/20 group-hover:text-[#16a34a]">128</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer hover:text-white transition-colors group">
                  <span className="group-hover:translate-x-1 transition-transform">Hacksaw Gaming</span>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-500 group-hover:bg-[#16a34a]/20 group-hover:text-[#16a34a]">95</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Center Content (Hero + Games Grid) */}
        <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-hidden relative">
          
          {/* Huge Cinematic Hero Banner */}
          <div className="w-full h-[400px] lg:h-[500px] rounded-[32px] mb-12 relative overflow-hidden flex items-center px-10 md:px-20 group shadow-2xl">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070')" }}
            ></div>
            {/* Dark Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-black mb-6 uppercase tracking-widest shadow-xl">
                <Flame className="w-4 h-4 text-[#16a34a]" /> İlk Yatırıma %100 Bonus
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                GLOBAL CASINO <br/> <span className="text-gradient-green">İMPARATORLUĞU</span>
              </h1>
              <p className="text-gray-300 text-base md:text-xl mb-8 max-w-xl font-medium leading-relaxed">
                Pragmatic Play, Evolution ve özel Web3 oyunlarıyla eşsiz bir deneyim. Kripto ile yatırım yap, anında oynamaya başla.
              </p>
              <div className="flex items-center gap-4">
                <button onClick={scrollToGames} className="btn-premium px-10 py-4 text-base shadow-[0_0_30px_rgba(22,163,74,0.3)]">
                  ŞİMDİ OYNA
                </button>
                <button onClick={scrollToGames} className="px-8 py-4 text-white font-bold text-base hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                  TÜM OYUNLAR <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Games Grid Section */}
          <div className="mb-12" ref={gamesSectionRef}>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3 uppercase">
                  <Star className="w-8 h-8 text-[#16a34a]" /> {activeCategory === 'TÜMÜ' ? 'EN ÇOK KAZANDIRANLAR' : `${activeCategory} OYUNLARI`}
                </h2>
                <p className="text-gray-400 text-sm mt-2 font-medium">Bu hafta en yüksek çarpan veren global slotlar</p>
              </div>
              <button onClick={() => setActiveCategory("TÜMÜ")} className="hidden sm:flex text-sm text-gray-400 hover:text-white font-bold items-center gap-1 transition-colors">
                TÜMÜNÜ GÖR <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {filteredGames.length === 0 ? (
               <div className="py-20 text-center bg-[#0a0a0a] rounded-2xl border border-white/5">
                 <p className="text-gray-500 font-bold">Bu kategoride henüz oyun bulunmuyor.</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {filteredGames.map((game) => (
                  <Link href={game.link} key={game.id} className="casino-card group aspect-[3/4] block cursor-pointer">
                    {game.hot && (
                      <div className="absolute top-3 right-3 z-20 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                        HOT
                      </div>
                    )}
                  
                  {/* Premium Image Background */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                    style={{ backgroundImage: `url('${game.img}')` }}
                  ></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                    <div className="w-16 h-16 rounded-full bg-[#16a34a] flex items-center justify-center shadow-[0_0_30px_rgba(22,163,74,0.6)] scale-50 group-hover:scale-100 transition-transform duration-500 ease-out">
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Bottom Info Gradient */}
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent translate-y-4 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-300 z-20">
                    <h4 className="text-white font-black text-lg truncate drop-shadow-md">{game.title}</h4>
                    <p className="text-[#16a34a] font-bold text-xs truncate mt-1">{game.provider}</p>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>

        </main>
      </div>

      <Toaster position="bottom-right" />
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} type={authType} />
    </div>
  );
}
