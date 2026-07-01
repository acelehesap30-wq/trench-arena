"use client";

import { Activity, Search, Play, Star, ChevronRight, Trophy, Flame, Zap, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { useRealtimeWins } from "@/hooks/useRealtimeWins";

const CATEGORIES = [
  { key: "TÜMÜ", label: "TÜMÜ", icon: Star },
  { key: "SLOT", label: "SLOT", icon: Play },
  { key: "WEB3", label: "WEB3", icon: Activity },
  { key: "CRASH", label: "CRASH", icon: Zap },
  { key: "ROULETTE", label: "RULET", icon: TrendingUp },
  { key: "BLACKJACK", label: "BLACKJACK", icon: Trophy },
  { key: "GAME SHOWS", label: "SHOW", icon: Flame },
];

const HERO_SLIDES = [
  {
    title: "GLOBAL CASINO",
    subtitle: "İMPARATORLUĞU",
    description: "Pragmatic Play, Evolution ve özel Web3 oyunlarıyla eşsiz bir deneyim. Kripto ile yatırım yap, anında oynamaya başla.",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070",
    badge: "İlk Yatırıma %100 Bonus",
    badgeColor: "#16a34a",
    ctaLink: "#games",
  },
  {
    title: "CANLI SPOR",
    subtitle: "BAHİSLERİ",
    description: "ESPN canlı verileriyle NBA, Premier League, Şampiyonlar Ligi ve daha fazlası. Anlık oranlar, hızlı bahis.",
    image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=2070",
    badge: "Canlı Maçlar",
    badgeColor: "#ef4444",
    ctaLink: "/sports",
  },
  {
    title: "WEB3",
    subtitle: "TRADING",
    description: "SOL/USD perpetual trading. Pyth Network oracle fiyatları, Binance grafikleri ve 100x kaldıraç.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f4ec139?q=80&w=2070",
    badge: "Pyth Network Canlı",
    badgeColor: "#8b5cf6",
    ctaLink: "/web3-trading",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("TÜMÜ");
  const gamesSectionRef = useRef<HTMLDivElement>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  
  const [games, setGames] = useState<any[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [providerCounts, setProviderCounts] = useState<{provider: string, count: number}[]>([]);
  const { wins: recentWins } = useRealtimeWins(12);
  
  // Hero Auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data: gamesData, error: gamesError } = await supabase
          .from('casino_games')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
          
        if (!gamesError && gamesData && gamesData.length > 0) {
          setGames(gamesData);
          const counts: Record<string, number> = {};
          gamesData.forEach(game => { counts[game.provider] = (counts[game.provider] || 0) + 1; });
          setProviderCounts(Object.entries(counts).map(([provider, count]) => ({ provider, count })));
        }
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        setGamesLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  const scrollToGames = () => {
    gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredGames = activeCategory === "TÜMÜ" 
    ? games 
    : games.filter(g => g.category === activeCategory);

  const currentHero = HERO_SLIDES[heroIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden flex flex-col">
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 flex w-full max-w-[1920px] mx-auto">
        
        {/* Left Sidebar (Providers / Categories) */}
        <aside className="w-[240px] hidden 2xl:flex flex-col glass-premium border-r border-white/5 p-5 shrink-0 z-40">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Lobi</h3>
              <ul className="space-y-1 text-sm font-bold text-gray-400">
                <li onClick={() => setActiveCategory("TÜMÜ")} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all ${activeCategory === 'TÜMÜ' ? 'bg-[#16a34a]/10 text-[#16a34a] border-l-4 border-[#16a34a]' : ''}`}>
                  <Star className={`w-4 h-4 ${activeCategory === 'TÜMÜ' ? 'text-[#16a34a]' : ''}`} /> Popüler
                </li>
                <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all">
                  <Link href="/tournaments" className="flex items-center gap-3 w-full">
                    <Trophy className="w-4 h-4 text-amber-500" /> Turnuvalar
                  </Link>
                </li>
                <li onClick={() => setActiveCategory("SLOT")} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all ${activeCategory === 'SLOT' ? 'bg-[#16a34a]/10 text-[#16a34a] border-l-4 border-[#16a34a]' : ''}`}>
                  <Play className="w-4 h-4 text-red-500" /> Slot Oyunları
                </li>
                <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all">
                  <Link href="/web3-trading" className="flex items-center gap-3 w-full">
                    <Activity className="w-4 h-4 text-blue-500" /> Web3 Trading
                  </Link>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-all">
                  <Link href="/live-casino" className="flex items-center gap-3 w-full">
                    <Users className="w-4 h-4 text-purple-500" /> Canlı Casino
                  </Link>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Sağlayıcılar</h3>
              <ul className="space-y-1 text-sm text-gray-400 font-medium">
                {providerCounts.map((p, idx) => (
                  <li key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer hover:text-white transition-colors group">
                    <span className="group-hover:translate-x-1 transition-transform text-xs">{p.provider}</span>
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 group-hover:bg-[#16a34a]/20 group-hover:text-[#16a34a]">{p.count}</span>
                  </li>
                ))}
                {providerCounts.length === 0 && (
                  <li className="text-gray-600 text-xs py-2">Yükleniyor...</li>
                )}
              </ul>
            </div>
          </div>
        </aside>

        {/* Center Content (Hero + Games Grid) */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-hidden relative">
          
          {/* Multi-Slide Hero Banner */}
          <div className="w-full h-[320px] lg:h-[420px] rounded-[24px] mb-8 relative overflow-hidden flex items-center px-8 md:px-16 group shadow-2xl border border-white/5">
            {/* Background Image with Transition */}
            {HERO_SLIDES.map((slide, idx) => (
              <div 
                key={idx}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
                  idx === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                style={{ backgroundImage: `url('${slide.image}')` }}
              ></div>
            ))}
            {/* Dark Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <div className="relative z-10 max-w-2xl">
              <span 
                className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-[10px] font-black mb-4 uppercase tracking-widest shadow-xl"
                key={`badge-${heroIndex}`}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentHero.badgeColor }}></div>
                {currentHero.badge}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                {currentHero.title} <br/> <span className="text-gradient-green">{currentHero.subtitle}</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base mb-6 max-w-xl font-medium leading-relaxed">
                {currentHero.description}
              </p>
              <div className="flex items-center gap-3">
                <button onClick={scrollToGames} className="btn-premium px-8 py-3 text-sm shadow-[0_0_30px_rgba(22,163,74,0.3)]">
                  ŞİMDİ OYNA
                </button>
                <Link href={currentHero.ctaLink} className="px-6 py-3 text-white font-bold text-sm hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
                  KEŞFET <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Hero Slide Indicators */}
            <div className="absolute bottom-4 right-8 flex gap-2 z-20">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === heroIndex ? 'bg-[#16a34a] w-8' : 'bg-white/20 w-4 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Live Winners Ticker */}
          <div className="mb-8 bg-[#0a0a0a] border border-white/5 rounded-2xl p-3 flex items-center overflow-hidden relative shadow-lg">
            <div className="flex items-center gap-2 text-[#16a34a] font-black uppercase text-[10px] tracking-widest border-r border-white/10 pr-4 mr-4 shrink-0 z-10 bg-[#0a0a0a]">
              <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
              CANLI
            </div>
            
            <div className="flex gap-8 animate-[marquee_25s_linear_infinite] whitespace-nowrap">
              {[...recentWins, ...recentWins].map((win, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-mono">{win.username || 'anon'}</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-white font-bold">{win.game_title}</span>
                  <span className="text-[#16a34a] font-black px-2 py-0.5 bg-[#16a34a]/10 rounded border border-[#16a34a]/20 font-mono">
                    +${Number(win.win_amount).toLocaleString()}
                  </span>
                </div>
              ))}
              {recentWins.length === 0 && (
                <span className="text-gray-600 text-xs">Henüz kazanç verisi yok — ilk kazanan sen ol!</span>
              )}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none"></div>
          </div>

          {/* Promo Cards */}
          <PromoBanner />

          {/* Games Grid Section */}
          <div className="mb-8" ref={gamesSectionRef} id="games">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      activeCategory === cat.key
                        ? 'bg-[#16a34a] text-black border-[#16a34a] shadow-[0_0_15px_rgba(22,163,74,0.3)]'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {gamesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] skeleton rounded-2xl"></div>
                ))}
              </div>
            ) : filteredGames.length === 0 ? (
               <div className="py-16 text-center bg-[#0a0a0a] rounded-2xl border border-white/5">
                 <p className="text-gray-500 font-bold">{games.length === 0 ? 'Supabase bağlantısı bekleniyor...' : 'Bu kategoride henüz oyun bulunmuyor.'}</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredGames.map((game, index) => (
                  <Link 
                    href={`/${game.slug === 'deep-needle' ? 'deep-needle' : `game/${game.slug}`}`} 
                    key={game.id} 
                    className="casino-card group aspect-[3/4] block cursor-pointer animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {game.is_hot && (
                      <div className="absolute top-3 right-3 z-20 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.5)] flex items-center gap-1">
                        <Flame className="w-3 h-3" /> HOT
                      </div>
                    )}
                  
                    {/* Premium Image Background */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                      style={{ backgroundImage: `url('${game.image_url}')` }}
                    ></div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                      <div className="w-14 h-14 rounded-full bg-[#16a34a] flex items-center justify-center shadow-[0_0_30px_rgba(22,163,74,0.6)] scale-50 group-hover:scale-100 transition-transform duration-500 ease-out">
                        <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Player Count */}
                    {game.players_count > 0 && (
                      <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                        <Users className="w-3 h-3 text-[#16a34a]" /> {game.players_count.toLocaleString()}
                      </div>
                    )}

                    {/* Bottom Info Gradient */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent translate-y-2 group-hover:translate-y-0 opacity-90 group-hover:opacity-100 transition-all duration-300 z-20">
                      <h4 className="text-white font-black text-sm truncate drop-shadow-md">{game.title}</h4>
                      <p className="text-[#16a34a] font-bold text-[10px] truncate mt-0.5">{game.provider}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>

      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}
