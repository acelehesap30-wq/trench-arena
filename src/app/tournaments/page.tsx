"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Medal, Swords, Target, ChevronRight, Loader2, Users, Flame } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function TournamentsPage() {
  const { session } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!selectedTournament?.end_date) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(selectedTournament.end_date).getTime();
      const distance = end - now;
      if (distance < 0) { setTimeLeft("SÜRE BİTTİ"); clearInterval(timer); return; }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}g ${hours}s ${minutes}d`);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedTournament]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const { data: allTournaments, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (!error && allTournaments && allTournaments.length > 0) {
          setTournaments(allTournaments);
          setSelectedTournament(allTournaments[0]);
          
          const { data: entriesData } = await supabase
            .from('tournament_entries')
            .select('*')
            .eq('tournament_id', allTournaments[0].id)
            .order('points', { ascending: false })
            .limit(15);
          if (entriesData) setLeaderboard(entriesData);
        }
      } catch (err) {
        console.error("Tournament fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const selectTournament = async (t: any) => {
    setSelectedTournament(t);
    const { data } = await supabase
      .from('tournament_entries')
      .select('*')
      .eq('tournament_id', t.id)
      .order('points', { ascending: false })
      .limit(15);
    if (data) setLeaderboard(data);
  };

  const joinTournament = async () => {
    if (!session) { toast.error("Önce giriş yapın."); return; }
    if (!selectedTournament) return;
    setJoining(true);
    try {
      const { error } = await supabase.from('tournament_entries').insert({
        tournament_id: selectedTournament.id,
        user_id: session.user.id,
        username: session.user.email?.split('@')[0] || 'Anonim',
        points: 0,
      });
      if (error) {
        if (error.code === '23505') toast.error("Bu turnuvaya zaten katıldınız!");
        else throw error;
      } else {
        toast.success("Turnuvaya başarıyla katıldınız!");
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setJoining(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8">
        
        {/* Hero */}
        <div className="w-full h-[350px] md:h-[400px] rounded-3xl mb-8 relative overflow-hidden flex items-center px-8 md:px-12 group shadow-2xl border border-[#d4af37]/20">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-60"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=2070')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-transparent to-transparent"></div>
          
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-xs font-black mb-4 uppercase tracking-widest shadow-xl">
              <Trophy className="w-4 h-4" /> TURNUVA MERKEZİ
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-[1.1] tracking-tight drop-shadow-lg">
              {selectedTournament ? selectedTournament.title : "TURNUVA"}
            </h1>
            <p className="text-gray-300 text-base mb-6 max-w-xl font-medium">
              {selectedTournament ? selectedTournament.description : "En yüksek çarpanı yakala, sıralamada yüksel."}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-[#0a0a0a]/80 backdrop-blur border border-white/10 rounded-2xl p-4">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">ÖDÜL HAVUZU</span>
                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-yellow-300">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" /> : selectedTournament ? `$${selectedTournament.prize_pool.toLocaleString()}` : "-"}
                </span>
              </div>
              <div className="bg-[#0a0a0a]/80 backdrop-blur border border-white/10 rounded-2xl p-4 min-w-[130px]">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block flex items-center gap-1">
                  <Clock className="w-3 h-3" /> KALAN SÜRE
                </span>
                <span className="text-xl md:text-2xl font-black text-white font-mono">{timeLeft || "--:--"}</span>
              </div>
              <button onClick={joinTournament} disabled={joining} className="btn-premium bg-gradient-to-r from-[#d4af37] to-yellow-600 px-8 py-4 text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] border-none disabled:opacity-50 text-sm">
                {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : "KATILIM SAĞLA"}
              </button>
            </div>
          </div>
          
          <div className="absolute right-10 -bottom-10 opacity-20 pointer-events-none scale-150 transform rotate-12">
            <Trophy className="w-96 h-96 text-[#d4af37]" />
          </div>
        </div>

        {/* Tournament Tabs (if multiple) */}
        {tournaments.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tournaments.map(t => (
              <button
                key={t.id}
                onClick={() => selectTournament(t)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                  selectedTournament?.id === t.id 
                    ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Trophy className="w-3 h-3 inline mr-1" /> {t.title}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <Medal className="w-6 h-6 text-[#d4af37]" /> LİDERLİK TABLOSU
              </h2>
              <span className="text-xs text-gray-500 font-bold">{leaderboard.length} Katılımcı</span>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#14151a] border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
                    <th className="py-4 px-6 font-bold w-20">Sıra</th>
                    <th className="py-4 px-6 font-bold">Oyuncu</th>
                    <th className="py-4 px-6 font-bold text-right">Puan</th>
                    <th className="py-4 px-6 font-bold text-right text-[#d4af37]">Ödül</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="py-10 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                  ) : leaderboard.length === 0 ? (
                    <tr><td colSpan={4} className="py-10 text-center text-gray-500 font-bold">Henüz katılımcı yok. İlk sen ol!</td></tr>
                  ) : leaderboard.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group animate-fadeInUp" style={{ animationDelay: `${index * 60}ms` }}>
                      <td className="py-4 px-6">
                        {index === 0 ? <Medal className="w-6 h-6 text-[#d4af37]" /> :
                         index === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                         index === 2 ? <Medal className="w-6 h-6 text-amber-700" /> :
                         <span className="text-gray-500 font-mono font-bold w-6 text-center inline-block">{index + 1}</span>}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-300 group-hover:text-white transition-colors">
                        {entry.username || 'Gizli Oyuncu'}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-white">{Number(entry.points).toFixed(2)}x</td>
                      <td className="py-4 px-6 text-right font-bold text-[#d4af37]">{entry.prize || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
      <Footer />
    </div>
  );
}
