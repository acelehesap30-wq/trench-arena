"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Play, Users, Star, Flame, Trophy, ChevronRight, Filter } from "lucide-react";
import Header from "@/components/Header";

export default function LiveCasinoPage() {
  const [activeCategory, setActiveCategory] = useState("TÜMÜ");
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["TÜMÜ", "ROULETTE", "BLACKJACK", "BACCARAT", "GAME SHOWS"];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("casino_games")
          .select("*")
          .in('category', ['ROULETTE', 'BLACKJACK', 'BACCARAT', 'GAME SHOWS', 'CRASH', 'ORIGINALS'])
          .order("players_count", { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((g: any) => ({
            id: g.id,
            title: g.title,
            provider: g.provider,
            category: g.category,
            image: g.image_url,
            players: g.players_count || Math.floor(Math.random() * 2000) + 100, // Show random if 0 for demo purposes
            slug: g.slug,
            minBet: `$${g.min_bet?.toFixed(2) || "1.00"}`,
            hot: g.is_hot
          }));
          setLiveGames(formatted);
        } else {
          setLiveGames([]);
        }
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filteredGames = activeCategory === "TÜMÜ" 
    ? liveGames 
    : liveGames.filter(g => g.category === activeCategory);

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
                placeholder="Masa veya oyun ara..." 
                className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16a34a] transition-colors w-[250px]"
              />
            </div>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full p-2.5 text-gray-400 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Games Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full py-10 text-center text-gray-500">Canlı casino oyunları yükleniyor...</div>
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
                <Users className="w-3 h-3 text-[#16a34a]" /> {game.players}
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
