"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Medal, Swords, Target, ChevronRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function TournamentsPage() {
  const [activeTournament, setActiveTournament] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  // Countdown timer calculation
  useEffect(() => {
    if (!activeTournament?.end_date) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(activeTournament.end_date).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("SÜRE BİTTİ");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${days}g ${hours}s ${minutes}d`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTournament]);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        // Fetch active tournament
        const { data: tourneyData, error: tourneyError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (tourneyError) throw tourneyError;
        if (!tourneyData) {
          setLoading(false);
          return;
        }
        
        setActiveTournament(tourneyData);

        // Fetch leaderboard for this tournament
        const { data: entriesData, error: entriesError } = await supabase
          .from('tournament_entries')
          .select('*')
          .eq('tournament_id', tourneyData.id)
          .order('points', { ascending: false })
          .limit(10);
          
        if (!entriesError && entriesData) {
          setLeaderboard(entriesData);
        }
      } catch (err) {
        console.error("Tournament fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournamentData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8">
        
        {/* Tournament Hero Banner */}
        <div className="w-full h-[400px] rounded-3xl mb-12 relative overflow-hidden flex items-center px-10 group shadow-2xl border border-[#d4af37]/20">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-60"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=2070')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-transparent to-transparent"></div>
          
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-xs font-black mb-6 uppercase tracking-widest shadow-xl">
              <Trophy className="w-4 h-4" /> AYLIK BÜYÜK TURNUVA
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-[1.1] tracking-tight drop-shadow-lg">
              {activeTournament ? activeTournament.title : "SLOT İMPARATORLUĞU"}
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-xl font-medium">
              {activeTournament ? activeTournament.description : "En yüksek çarpanı yakala, sıralamada yüksel ve büyük ödül havuzundan payını al."}
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="bg-[#0a0a0a]/80 backdrop-blur border border-white/10 rounded-2xl p-4 flex flex-col">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">ÖDÜL HAVUZU</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-300">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
                  ) : activeTournament ? (
                    `$${activeTournament.prize_pool.toLocaleString()}`
                  ) : (
                    "-$0"
                  )}
                </span>
              </div>
              <div className="bg-[#0a0a0a]/80 backdrop-blur border border-white/10 rounded-2xl p-4 flex flex-col min-w-[150px]">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> KALAN SÜRE
                </span>
                <span className="text-2xl font-black text-white font-mono">{timeLeft || "--:--"}</span>
              </div>
              <button className="btn-premium bg-gradient-to-r from-[#d4af37] to-yellow-600 px-8 py-5 text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] border-none">
                KATILIM SAĞLA
              </button>
            </div>
          </div>
          
          {/* Big Trophy Decoration */}
          <div className="absolute right-10 -bottom-10 opacity-20 pointer-events-none scale-150 transform rotate-12">
            <Trophy className="w-96 h-96 text-[#d4af37]" />
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column - Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Medal className="w-6 h-6 text-[#d4af37]" /> LİDERLİK TABLOSU
              </h2>
              <span className="text-sm text-gray-500 font-bold">{leaderboard.length} Katılımcı</span>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#14151a] border-b border-white/5 text-xs text-gray-500 uppercase tracking-widest">
                    <th className="py-4 px-6 font-bold w-20">Sıra</th>
                    <th className="py-4 px-6 font-bold">Oyuncu</th>
                    <th className="py-4 px-6 font-bold text-right">Puan (Çarpan)</th>
                    <th className="py-4 px-6 font-bold text-right text-[#d4af37]">Ödül</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td>
                    </tr>
                  ) : leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500 font-bold">Henüz katılımcı yok. İlk sen ol!</td>
                    </tr>
                  ) : leaderboard.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6">
                        {index === 0 ? <Medal className="w-6 h-6 text-[#d4af37]" /> :
                         index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                         index === 2 ? <Medal className="w-6 h-6 text-amber-700" /> :
                         <span className="text-gray-500 font-mono font-bold w-6 text-center inline-block">{index + 1}</span>}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-300 group-hover:text-white transition-colors">
                        {entry.username || 'Gizli Oyuncu'}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-white">
                        {Number(entry.points).toFixed(2)}x
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-[#d4af37]">
                        {entry.prize}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar - Rules & Active Tourneys */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                <Swords className="w-5 h-5 text-[#16a34a]" /> KURALLAR
              </h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-1.5 shrink-0"></div>
                  <p>Sadece seçili Pragmatic Play ve Originals oyunları geçerlidir.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-1.5 shrink-0"></div>
                  <p>Minimum bahis tutarı <strong>$0.20</strong> olmalıdır.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-1.5 shrink-0"></div>
                  <p>Puanlama: Elde edilen <strong>en yüksek çarpan</strong> puanınız olarak kaydedilir.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-1.5 shrink-0"></div>
                  <p>Turnuva bitiminde ödüller 24 saat içinde cüzdanlara otomatik aktarılır.</p>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#16a34a]/10 to-[#050505] border border-[#16a34a]/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                <Target className="w-32 h-32" />
              </div>
              <h3 className="text-sm font-black text-white mb-2">NASIL ÇALIŞIR?</h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Trench Arena akıllı sözleşmeleri, her bahsi zincir üzerinde doğrular. Skor tablosu manipüle edilemez ve ödül dağıtımı otomatik gerçekleşir.
              </p>
              <button className="text-xs font-bold text-[#16a34a] hover:text-white transition-colors flex items-center gap-1">
                DOKÜMANTASYONU OKU <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
