"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Gift, Timer, Users, Flame, ChevronRight, Star, Coins, Medal } from "lucide-react";

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState("AKTİF");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("tournaments")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setTournaments(data);
        } else {
          setTournaments([
            { id: "1", title: "Slot İmparatorluğu", description: "Sadece Pragmatic Play oyunlarında geçerlidir.", prize_pool: "50000" },
            { id: "2", title: "Web3 Degens", description: "Trench Originals (Deep Needle) oyununda en yüksek çarpan.", prize_pool: "10000" }
          ]);
        }
      } catch (err) {
        console.error("Supabase Error:", err);
        setTournaments([
          { id: "1", title: "Slot İmparatorluğu", description: "Sadece Pragmatic Play oyunlarında geçerlidir.", prize_pool: "50000" },
          { id: "2", title: "Web3 Degens", description: "Trench Originals (Deep Needle) oyununda en yüksek çarpan.", prize_pool: "10000" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const leaderboard = [
    { rank: 1, user: "crypto_king", points: "2,450,000", prize: "$15,000", change: "up" },
    { rank: 2, user: "sol_whale_99", points: "1,850,200", prize: "$8,000", change: "same" },
    { rank: 3, user: "trench_master", points: "1,205,500", prize: "$5,000", change: "up" },
    { rank: 4, user: "lucky_strike", points: "980,000", prize: "$2,000", change: "down" },
    { rank: 5, user: "degen_trader", points: "850,400", prize: "$1,000", change: "up" },
    { rank: 6, user: "moon_boi", points: "720,100", prize: "$500", change: "down" },
    { rank: 7, user: "ape_life", points: "650,000", prize: "$500", change: "same" },
    { rank: 8, user: "diamond_hands", points: "590,200", prize: "$500", change: "up" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-20 glass-premium border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-3xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
            TRENCH<span className="text-[#16a34a]">BET</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-8 text-sm font-extrabold tracking-wider text-gray-400">
            <Link href="/sports" className="hover:text-white transition-colors">SPOR</Link>
            <Link href="/live-casino" className="hover:text-white transition-colors">CANLI CASINO</Link>
            <Link href="/tournaments" className="text-white border-b-2 border-[#16a34a] pb-7 pt-7">TURNUVALAR</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-premium px-6 py-2.5 text-sm mr-2 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
            KRİPTO YATIR
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8">
        
        {/* Main Tournament Banner */}
        <div className="w-full h-[350px] rounded-3xl mb-12 relative overflow-hidden flex items-center p-8 md:p-12 group border border-white/10 shadow-[0_0_50px_rgba(22,163,74,0.1)]">
          {/* Background Image & Effects */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=2070')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 py-1 px-3 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-black mb-4 uppercase tracking-widest">
                <Trophy className="w-3 h-3" /> Aylık Büyük Turnuva
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                HAZIRLAN. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">SAVAŞ.</span> KAZAN.
              </h1>
              <p className="text-gray-300 text-base md:text-lg mb-8 max-w-xl font-medium">
                Bu ayın en çok kazandıran slotlarında oyna, liderlik tablosunda yüksel ve dev ödül havuzundan payını al.
              </p>
              
              <div className="flex items-center gap-4">
                <button className="btn-premium px-8 py-3 text-sm shadow-[0_0_20px_rgba(22,163,74,0.4)] flex items-center gap-2">
                  <Flame className="w-4 h-4" /> HEMEN KATIL
                </button>
              </div>
            </div>

            {/* Prize Pool Info Box */}
            <div className="glass-premium border border-white/10 p-6 rounded-2xl w-full md:w-auto min-w-[300px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none"></div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-2">TOPLAM ÖDÜL HAVUZU</p>
              <h2 className="text-5xl font-black text-white mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-gradient-green">$500,000</h2>
              
              <div className="w-full flex justify-between items-center border-t border-white/10 pt-4">
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-[10px] font-bold uppercase mb-1">Kalan Süre</span>
                  <div className="flex items-center gap-1 text-white font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Timer className="w-4 h-4 text-amber-500" /> 12g 04s 45d
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-500 text-[10px] font-bold uppercase mb-1">Katılımcı</span>
                  <div className="flex items-center gap-1 text-white font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Users className="w-4 h-4 text-blue-500" /> 14,205
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
          <button 
            onClick={() => setActiveTab("AKTİF")}
            className={`text-sm font-black px-6 py-3 rounded-xl transition-all tracking-wider ${activeTab === 'AKTİF' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            AKTİF TURNUVALAR
          </button>
          <button 
            onClick={() => setActiveTab("GEÇMİŞ")}
            className={`text-sm font-black px-6 py-3 rounded-xl transition-all tracking-wider ${activeTab === 'GEÇMİŞ' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            GEÇMİŞ
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Tournaments List */}
          <div className="xl:col-span-2 space-y-6">
            
            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500" /> Öne Çıkan Turnuvalar
            </h3>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Turnuvalar yükleniyor...</div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Şu anda aktif turnuva bulunmuyor.</div>
            ) : tournaments.map((t, idx) => {
              const isPurple = idx % 2 === 1;
              const colorBase = isPurple ? "purple" : "amber";
              const Icon = isPurple ? Coins : Gift;
              
              return (
                <div key={t.id} className={`glass-premium border border-white/10 rounded-2xl p-6 relative overflow-hidden group transition-colors hover:border-${colorBase}-500/50`}>
                  <div className={`absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-${colorBase}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-xl bg-gradient-to-br from-${colorBase}-500/20 to-${colorBase}-700/20 border border-${colorBase}-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.1)]`}>
                        <Icon className={`w-10 h-10 text-${colorBase}-500`} />
                      </div>
                      <div>
                        <span className={`text-${colorBase}-400 text-[10px] font-black uppercase tracking-widest bg-${colorBase}-500/10 px-2 py-1 rounded border border-${colorBase}-500/20 mb-2 inline-block`}>Yarış</span>
                        <h4 className="text-2xl font-black text-white mb-1">{t.title}</h4>
                        <p className="text-gray-400 text-sm font-medium">{t.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto border-t border-white/5 pt-4 md:border-0 md:pt-0">
                      <div className="text-center md:text-right">
                        <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Ödül Havuzu</p>
                        <p className={`text-2xl font-black text-white text-gradient-${colorBase}`}>${Number(t.prize_pool).toLocaleString()}</p>
                      </div>
                      <button className={`w-full md:w-auto bg-white/5 hover:bg-${colorBase}-500 hover:text-black border border-white/10 hover:border-${colorBase}-500 px-8 py-3 rounded-xl font-bold transition-all`}>
                        KATIL
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Right Column: Leaderboard */}
          <div className="xl:col-span-1">
            <div className="glass-premium border border-white/10 rounded-2xl overflow-hidden sticky top-28">
              <div className="bg-gradient-to-r from-[#16a34a]/20 to-transparent p-6 border-b border-white/5">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Medal className="w-6 h-6 text-[#16a34a]" /> Canlı Leaderboard
                </h3>
                <p className="text-gray-400 text-xs font-bold mt-1">Aylık Büyük Turnuva - Son Güncelleme: Az Önce</p>
              </div>

              <div className="p-2">
                {/* Table Header */}
                <div className="flex items-center justify-between p-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center">#</span>
                    <span>Kullanıcı</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span>Puan</span>
                    <span className="w-16 text-right">Ödül</span>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="space-y-1 mt-2">
                  {leaderboard.map((player) => (
                    <div 
                      key={player.rank} 
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        player.rank === 1 ? 'bg-amber-500/10 border border-amber-500/20' : 
                        player.rank === 2 ? 'bg-gray-300/10 border border-gray-300/20' : 
                        player.rank === 3 ? 'bg-orange-700/10 border border-orange-700/20' : 
                        'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-6 text-center font-black ${
                          player.rank === 1 ? 'text-amber-500' : 
                          player.rank === 2 ? 'text-gray-300' : 
                          player.rank === 3 ? 'text-orange-500' : 
                          'text-gray-500'
                        }`}>{player.rank}</span>
                        <span className="text-white font-bold text-sm truncate max-w-[100px]">{player.user}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-gray-300 font-mono text-xs">{player.points}</span>
                        <span className={`w-16 text-right font-black text-sm ${player.rank <= 3 ? 'text-[#16a34a]' : 'text-gray-400'}`}>
                          {player.prize}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 p-3 text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1">
                  TÜM LİSTEYİ GÖR <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
