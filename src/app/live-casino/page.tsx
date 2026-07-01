"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Play, Users, Star, Flame, Trophy, ChevronRight, Filter, Loader2 } from "lucide-react";
import Header from "@/components/Header";

// Fallback games that always show even without Supabase connection
const LIVE_CASINO_GAMES = [
  // Roulette
  { id: 'lr-1', title: 'Lightning Roulette', provider: 'Evolution', category: 'ROULETTE', image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=600', players: 1420, slug: 'lightning-roulette', minBet: '$0.20', hot: true },
  { id: 'lr-2', title: 'XXXtreme Lightning', provider: 'Evolution', category: 'ROULETTE', image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=600', players: 2100, slug: 'xxxtreme-lightning', minBet: '$0.20', hot: true },
  { id: 'lr-3', title: 'Mega Roulette', provider: 'Pragmatic Play', category: 'ROULETTE', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=600', players: 1100, slug: 'mega-roulette', minBet: '$0.10', hot: true },
  { id: 'lr-4', title: 'Auto Roulette', provider: 'Evolution', category: 'ROULETTE', image: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=600', players: 890, slug: 'auto-roulette', minBet: '$0.50', hot: false },
  { id: 'lr-5', title: 'Immersive Roulette', provider: 'Evolution', category: 'ROULETTE', image: 'https://images.unsplash.com/photo-1517232115160-ff93364542dd?q=80&w=600', players: 760, slug: 'immersive-roulette', minBet: '$1.00', hot: false },
  // Blackjack
  { id: 'bj-1', title: 'Infinite Blackjack', provider: 'Evolution', category: 'BLACKJACK', image: 'https://images.unsplash.com/photo-1511516805178-06bbddab960e?q=80&w=600', players: 850, slug: 'infinite-blackjack', minBet: '$1.00', hot: false },
  { id: 'bj-2', title: 'Speed Blackjack', provider: 'Evolution', category: 'BLACKJACK', image: 'https://images.unsplash.com/photo-1563214555-5f50f269a8b6?q=80&w=600', players: 640, slug: 'speed-blackjack', minBet: '$5.00', hot: false },
  { id: 'bj-3', title: 'ONE Blackjack', provider: 'Pragmatic Play', category: 'BLACKJACK', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=600', players: 920, slug: 'one-blackjack', minBet: '$1.00', hot: true },
  { id: 'bj-4', title: 'Lightning Blackjack', provider: 'Evolution', category: 'BLACKJACK', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=600', players: 1180, slug: 'lightning-blackjack', minBet: '$1.00', hot: true },
  // Baccarat
  { id: 'bc-1', title: 'Speed Baccarat', provider: 'Pragmatic Play', category: 'BACCARAT', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600', players: 1350, slug: 'speed-baccarat', minBet: '$2.00', hot: false },
  { id: 'bc-2', title: 'Lightning Baccarat', provider: 'Evolution', category: 'BACCARAT', image: 'https://images.unsplash.com/photo-1517232115160-ff93364542dd?q=80&w=600', players: 980, slug: 'lightning-baccarat', minBet: '$1.00', hot: true },
  { id: 'bc-3', title: 'Dragon Tiger', provider: 'Evolution', category: 'BACCARAT', image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=600', players: 710, slug: 'dragon-tiger', minBet: '$0.50', hot: false },
  // Game Shows
  { id: 'gs-1', title: 'Crazy Time', provider: 'Evolution', category: 'GAME SHOWS', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=600', players: 3850, slug: 'crazy-time', minBet: '$0.10', hot: true },
  { id: 'gs-2', title: 'Sweet Bonanza Candyland', provider: 'Pragmatic Play', category: 'GAME SHOWS', image: 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=600', players: 5200, slug: 'sweet-bonanza-candyland', minBet: '$0.20', hot: true },
  { id: 'gs-3', title: 'Monopoly Live', provider: 'Evolution', category: 'GAME SHOWS', image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=600', players: 2800, slug: 'monopoly-live', minBet: '$0.10', hot: true },
  { id: 'gs-4', title: 'Dream Catcher', provider: 'Evolution', category: 'GAME SHOWS', image: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=600', players: 1600, slug: 'dream-catcher', minBet: '$0.10', hot: false },
  { id: 'gs-5', title: 'Mega Wheel', provider: 'Pragmatic Play', category: 'GAME SHOWS', image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=600', players: 1900, slug: 'mega-wheel', minBet: '$0.20', hot: false },
  { id: 'gs-6', title: 'Funky Time', provider: 'Evolution', category: 'GAME SHOWS', image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600', players: 2400, slug: 'funky-time', minBet: '$0.10', hot: true },
];

export default function LiveCasinoPage() {
  const [activeCategory, setActiveCategory] = useState("TÜMÜ");
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["TÜMÜ", "ROULETTE", "BLACKJACK", "BACCARAT", "GAME SHOWS"];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("casino_games")
          .select("*")
          .in('category', ['ROULETTE', 'BLACKJACK', 'BACCARAT', 'GAME SHOWS'])
          .order("players_count", { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((g: any) => ({
            id: g.id, title: g.title, provider: g.provider, category: g.category,
            image: g.image_url, players: g.players_count || Math.floor(Math.random() * 2000) + 100,
            slug: g.slug, minBet: `$${g.min_bet?.toFixed(2) || "1.00"}`, hot: g.is_hot
          }));
          setLiveGames(formatted);
        } else {
          // Fallback to hardcoded games if Supabase fails or has no data
          setLiveGames(LIVE_CASINO_GAMES);
        }
      } catch (err) {
        console.error("Supabase Error:", err);
        // Fallback to hardcoded games
        setLiveGames(LIVE_CASINO_GAMES);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filteredGames = liveGames
    .filter(g => activeCategory === "TÜMÜ" || g.category === activeCategory)
    .filter(g => searchQuery === "" || g.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8">
        
        {/* Cinematic Header for Live Casino */}
        <div className="w-full h-[300px] rounded-3xl mb-12 relative overflow-hidden flex items-center px-10 group border border-white/10">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded bg-[#16a34a]/20 text-[#16a34a] border border-[#16a34a]/30 text-[10px] font-black mb-4 uppercase tracking-widest animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></div> Evolution Live Lobby
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              GERÇEK <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">CASINO</span> DENEYİMİ
            </h1>
            <p className="text-gray-300 text-base md:text-lg mb-8 max-w-xl font-medium">
              Profesyonel krupiyeler ile 7/24 canlı rulet, blackjack ve efsanevi oyun şovları.
            </p>
          </div>
        </div>

        {/* Categories & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  activeCategory === cat 
                    ? 'bg-[#16a34a] text-black border-[#16a34a] shadow-[0_0_15px_rgba(22,163,74,0.3)]' 
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masa veya oyun ara..." 
                className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16a34a] transition-colors w-[250px]"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mb-8 px-4 py-3 bg-[#0a0a0a] rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
            <span className="text-gray-400">Canlı Masalar:</span>
            <span className="text-white font-bold">{filteredGames.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-[#16a34a]" />
            <span className="text-gray-400">Toplam Oyuncu:</span>
            <span className="text-white font-bold">{filteredGames.reduce((a, g) => a + g.players, 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Live Games Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full py-10 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Canlı casino masaları yükleniyor...
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-[#0a0a0a] rounded-2xl border border-white/5">
              <p className="text-gray-500 font-bold">Bu kategoride henüz oyun bulunmuyor.</p>
            </div>
          ) : filteredGames.map((game) => (
            <Link href={`/game/${game.slug}`} key={game.id} className="casino-card group block cursor-pointer relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]">
              {/* Hot Badge */}
              {game.hot && (
                <div className="absolute top-3 left-3 z-20 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-[0_0_10px_rgba(239,68,68,0.6)] flex items-center gap-1">
                  <Flame className="w-3 h-3" /> HOT
                </div>
              )}

              {/* Player Count Badge */}
              <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                <Users className="w-3 h-3 text-[#16a34a]" /> {game.players.toLocaleString()}
              </div>

              {/* Live Indicator */}
              <div className="absolute bottom-[72px] left-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[9px] font-black text-[#16a34a] border border-[#16a34a]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></div> CANLI
              </div>

              {/* Thumbnail Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                  style={{ backgroundImage: `url('${game.image}')` }}
                ></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                  <div className="w-14 h-14 rounded-full bg-[#16a34a] flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.6)] scale-50 group-hover:scale-100 transition-transform duration-500 ease-out">
                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4 relative z-20 bg-gradient-to-t from-[#050505] to-[#0a0a0a]">
                <h4 className="text-white font-black text-sm truncate">{game.title}</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[#16a34a] font-bold text-[10px] uppercase tracking-wider">{game.provider}</p>
                  <p className="text-gray-500 text-[10px] font-bold">Min: <span className="text-white">{game.minBet}</span></p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
