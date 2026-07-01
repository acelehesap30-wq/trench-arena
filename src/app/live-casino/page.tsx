"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Play, Users, Flame, Loader2, Tv, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default function LiveCasinoPage() {
  const [activeCategory, setActiveCategory] = useState("TÜMÜ");
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({});

  const categories = ["TÜMÜ", "ROULETTE", "BLACKJACK", "BACCARAT", "GAME SHOWS"];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data, error } = await supabase
          .from("casino_games")
          .select("*")
          .in('category', ['ROULETTE', 'BLACKJACK', 'BACCARAT', 'GAME SHOWS'])
          .eq('is_active', true)
          .order("players_count", { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((g: any) => ({
            id: g.id, title: g.title, provider: g.provider, category: g.category,
            image: g.image_url, players: g.players_count || 0,
            slug: g.slug, minBet: `$${g.min_bet?.toFixed(2) || "1.00"}`, hot: g.is_hot
          }));
          setLiveGames(formatted);
          
          // Initialize player counts
          const counts: Record<string, number> = {};
          formatted.forEach(g => { counts[g.id] = g.players; });
          setPlayerCounts(counts);
        }
      } catch (err) {
        console.error("Supabase Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Simulate micro player count changes (realistic live casino feel)
  useEffect(() => {
    if (liveGames.length === 0) return;
    const interval = setInterval(() => {
      setPlayerCounts(prev => {
        const updated = { ...prev };
        liveGames.forEach(g => {
          const change = Math.floor(Math.random() * 7) - 3;
          updated[g.id] = Math.max(50, (updated[g.id] || g.players) + change);
        });
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [liveGames]);

  const filteredGames = liveGames
    .filter(g => activeCategory === "TÜMÜ" || g.category === activeCategory)
    .filter(g => searchQuery === "" || g.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8">
        
        {/* Cinematic Header */}
        <div className="w-full h-[260px] md:h-[320px] rounded-2xl mb-10 relative overflow-hidden flex items-center px-8 md:px-12 group border border-white/5 shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded bg-[#16a34a]/20 text-[#16a34a] border border-[#16a34a]/30 text-[9px] font-black mb-4 uppercase tracking-widest animate-pulse">
              <Tv className="w-3 h-3" /> CANLI YAYINDA
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight tracking-tight">
              GERÇEK <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">CASINO</span> DENEYİMİ
            </h1>
            <p className="text-gray-300 text-sm md:text-base mb-6 max-w-xl font-medium">
              Profesyonel krupiyeler ile 7/24 canlı rulet, blackjack ve efsanevi oyun şovları.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeCategory === cat 
                    ? 'bg-[#16a34a] text-black border-[#16a34a] shadow-[0_0_15px_rgba(22,163,74,0.3)]' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masa veya oyun ara..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16a34a] transition-colors w-[220px]"
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mb-6 px-4 py-2.5 bg-[#0a0a0a] rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
            <span className="text-gray-400">Canlı Masalar:</span>
            <span className="text-white font-bold">{filteredGames.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-[#16a34a]" />
            <span className="text-gray-400">Toplam Oyuncu:</span>
            <span className="text-white font-bold">{Object.values(playerCounts).reduce((a, b) => a + b, 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] skeleton rounded-2xl"></div>
            ))
          ) : filteredGames.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-[#0a0a0a] rounded-2xl border border-white/5">
              <p className="text-gray-500 font-bold">{liveGames.length === 0 ? 'Supabase bağlantısı bekleniyor...' : 'Bu kategoride henüz oyun bulunmuyor.'}</p>
            </div>
          ) : filteredGames.map((game, index) => (
            <Link 
              href={`/game/${game.slug}`} 
              key={game.id} 
              className="casino-card group block cursor-pointer relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] animate-fadeInUp"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {game.hot && (
                <div className="absolute top-3 left-3 z-20 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.5)] flex items-center gap-1">
                  <Flame className="w-3 h-3" /> HOT
                </div>
              )}

              <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-white/10">
                <Users className="w-3 h-3 text-[#16a34a]" /> {(playerCounts[game.id] || game.players).toLocaleString()}
              </div>

              <div className="absolute bottom-[68px] left-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] font-black text-[#16a34a] border border-[#16a34a]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></div> CANLI
              </div>

              <div className="relative aspect-[4/3] overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                  style={{ backgroundImage: `url('${game.image}')` }}
                ></div>
                
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                  <div className="w-12 h-12 rounded-full bg-[#16a34a] flex items-center justify-center shadow-[0_0_20px_rgba(22,163,74,0.6)] scale-50 group-hover:scale-100 transition-transform duration-500 ease-out">
                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="p-3 relative z-20 bg-gradient-to-t from-[#050505] to-[#0a0a0a]">
                <h4 className="text-white font-black text-xs truncate">{game.title}</h4>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[#16a34a] font-bold text-[9px] uppercase tracking-wider">{game.provider}</p>
                  <p className="text-gray-500 text-[9px] font-bold">Min: <span className="text-white">{game.minBet}</span></p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
