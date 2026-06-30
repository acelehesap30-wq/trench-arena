"use client";

import { useState, useEffect } from "react";
import { Search, Trophy, TrendingUp, Filter, Star, Clock, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { useBet } from "@/contexts/BetContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

// ESPN API Endpoints (Soccer)
const ESPN_SPORTS = [
  { id: 'super-lig', name: 'Trendyol Süper Lig', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard' },
  { id: 'champions-league', name: 'Şampiyonlar Ligi', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard' },
  { id: 'premier-league', name: 'Premier League', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard' },
  { id: 'la-liga', name: 'La Liga', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard' },
];

export default function SportsPage() {
  const [activeSport, setActiveSport] = useState(ESPN_SPORTS[0]); // Default Super Lig
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { selections, addSelection, removeSelection, clearSelections } = useBet();
  const { session, balance } = useAuth();
  
  // Bet slip state
  const [stake, setStake] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(activeSport.url);
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
          const formattedMatches = data.events.map((event: any) => {
            const homeTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
            const awayTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
            
            return {
              id: event.id,
              league: data.leagues?.[0]?.name || activeSport.name,
              status: event.status.type.state === 'in' ? 'LIVE' : event.status.type.state === 'pre' ? 'UPCOMING' : 'FINISHED',
              time: new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              homeTeam: homeTeam.team.name,
              awayTeam: awayTeam.team.name,
              score: event.status.type.state === 'pre' ? null : `${homeTeam.score} - ${awayTeam.score}`,
              odds: {
                home: (Math.random() * 2 + 1.1).toFixed(2), // Real odds need odds API, ESPN scoreboard doesn't provide betting odds directly for free
                draw: (Math.random() * 3 + 2.5).toFixed(2),
                away: (Math.random() * 2 + 1.1).toFixed(2)
              }
            };
          });
          setMatches(formattedMatches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("ESPN API Error:", err);
        setMatches([]); // Don't use mock data on failure, just empty state
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [activeSport]);

  const placeBet = async () => {
    if (!session) {
      toast.error("Lütfen önce giriş yapın.");
      return;
    }
    if (selections.length === 0) return;
    
    const stakeAmount = parseFloat(stake);
    if (!stakeAmount || stakeAmount <= 0) {
      toast.error("Geçerli bir bahis miktarı girin.");
      return;
    }

    if (stakeAmount > balance) {
      toast.error("Yetersiz bakiye.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      
      const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, 1);
      const potentialWin = stakeAmount * totalOdds;
      
      const inserts = selections.map(selection => ({
        user_id: session.user.id,
        match_id: selection.matchId,
        match_title: selection.matchTitle,
        selection: selection.selection,
        odds: selection.odds,
        stake: stakeAmount / selections.length, // Split stake evenly for simplicity in this demo, or normally it's a parlay
        potential_win: potentialWin / selections.length,
        status: 'PENDING'
      }));

      const { error } = await supabase.from('sport_bets').insert(inserts);
      
      if (error) throw error;
      
      toast.success("Bahisiniz başarıyla alındı!");
      clearSelections();
      setStake("");
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSelected = (matchId: string, selectionName: string) => {
    return selections.some(s => s.matchId === matchId && s.selection === selectionName);
  };

  const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, 1);
  const potentialWin = parseFloat(stake || "0") * totalOdds;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8 flex gap-6">
        
        {/* Left Sidebar - Sports */}
        <aside className="w-64 hidden xl:block shrink-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 sticky top-28">
            <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4 pl-2">Kategoriler</h3>
            <ul className="space-y-1">
              {ESPN_SPORTS.map((sport) => (
                <li key={sport.id}>
                  <button 
                    onClick={() => setActiveSport(sport)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-colors ${
                      activeSport.id === sport.id 
                        ? 'bg-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.3)]' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{sport.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center Content - Matches */}
        <main className="flex-1 min-w-0">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-[#16a34a]" /> {activeSport.name}
              </h1>
              <p className="text-gray-400 text-sm mt-1 font-medium">Uluslararası canlı spor veri sağlayıcısı üzerinden çekilmektedir (İddaa formatında).</p>
            </div>
            <div className="flex items-center gap-4 hidden sm:flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Maç veya takım ara..." 
                  className="bg-[#0a0a0a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#16a34a] transition-colors w-[200px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center font-mono text-gray-500">CANLI VERİLER ÇEKİLİYOR...</div>
            ) : matches.length === 0 ? (
              <div className="py-20 text-center bg-[#0a0a0a] rounded-2xl border border-white/5 text-gray-500 font-bold">
                Şu anda bu kategoride aktif veya yaklaşan maç bulunmuyor.
              </div>
            ) : matches.map((match) => (
              <div key={match.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors p-5 flex flex-col md:flex-row items-center gap-6">
                {/* Match Info */}
                <div className="flex-1 w-full md:w-auto border-b md:border-b-0 border-white/5 pb-4 md:pb-0">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500 mb-3">
                    <span className="bg-white/5 px-2 py-1 rounded">{match.league}</span>
                    <span className={match.status === 'LIVE' ? 'text-red-500 flex items-center gap-1' : 'text-gray-400'}>
                      {match.status === 'LIVE' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                      {match.status === 'LIVE' ? 'CANLI' : match.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-lg">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-white">{match.homeTeam}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white">{match.awayTeam}</span>
                      </div>
                    </div>
                    {match.score && (
                      <div className="text-2xl font-black text-[#16a34a] font-mono tracking-widest pl-6 border-l border-white/10">
                        {match.score.split('-')[0]}<br/>{match.score.split('-')[1]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Odds Buttons */}
                <div className="flex gap-2 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <button 
                    onClick={() => addSelection({ id: Date.now().toString() + Math.random().toString(), matchId: match.id, matchTitle: `${match.homeTeam} vs ${match.awayTeam}`, selection: match.homeTeam, odds: parseFloat(match.odds.home) })}
                    className={`flex-1 md:w-20 py-3 rounded-lg flex flex-col items-center justify-center border transition-all ${
                      isSelected(match.id, match.homeTeam) ? 'bg-[#16a34a] border-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'bg-[#14151a] border-white/5 hover:border-[#16a34a]/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] opacity-70 font-bold mb-1">MS 1</span>
                    <span className="font-mono font-bold text-sm">{match.odds.home}</span>
                  </button>
                  <button 
                    onClick={() => addSelection({ id: Date.now().toString() + Math.random().toString(), matchId: match.id, matchTitle: `${match.homeTeam} vs ${match.awayTeam}`, selection: "Draw", odds: parseFloat(match.odds.draw) })}
                    className={`flex-1 md:w-20 py-3 rounded-lg flex flex-col items-center justify-center border transition-all ${
                      isSelected(match.id, "Draw") ? 'bg-[#16a34a] border-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'bg-[#14151a] border-white/5 hover:border-[#16a34a]/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] opacity-70 font-bold mb-1">X</span>
                    <span className="font-mono font-bold text-sm">{match.odds.draw}</span>
                  </button>
                  <button 
                    onClick={() => addSelection({ id: Date.now().toString() + Math.random().toString(), matchId: match.id, matchTitle: `${match.homeTeam} vs ${match.awayTeam}`, selection: match.awayTeam, odds: parseFloat(match.odds.away) })}
                    className={`flex-1 md:w-20 py-3 rounded-lg flex flex-col items-center justify-center border transition-all ${
                      isSelected(match.id, match.awayTeam) ? 'bg-[#16a34a] border-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'bg-[#14151a] border-white/5 hover:border-[#16a34a]/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] opacity-70 font-bold mb-1">MS 2</span>
                    <span className="font-mono font-bold text-sm">{match.odds.away}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar - Dynamic BetSlip */}
        <aside className="w-80 hidden lg:block shrink-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden sticky top-28 shadow-xl flex flex-col" style={{maxHeight: 'calc(100vh - 120px)'}}>
            <div className="p-4 border-b border-white/5 bg-[#14151a] flex justify-between items-center">
              <h3 className="font-black text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> KUPONUM
              </h3>
              <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">{selections.length} Seçim</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {selections.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-10 font-medium border border-dashed border-white/10 rounded-xl bg-white/5">
                  Kuponunuz şu an boş. Oranlara tıklayarak ekleyin.
                </div>
              ) : (
                selections.map((sel, idx) => (
                  <div key={idx} className="bg-[#14151a] border border-white/5 rounded-xl p-3 relative group">
                    <button 
                      onClick={() => removeSelection(sel.id)}
                      className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[10px] font-bold text-gray-500 mb-1 pr-6 truncate">{sel.matchTitle}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">{sel.selection}</span>
                      <span className="text-sm font-black text-[#16a34a] font-mono">{sel.odds.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selections.length > 0 && (
              <div className="p-4 border-t border-white/5 bg-[#14151a]">
                <div className="flex justify-between items-center mb-4 text-sm font-bold">
                  <span className="text-gray-400">Toplam Oran:</span>
                  <span className="text-white font-mono text-lg">{totalOdds.toFixed(2)}</span>
                </div>
                
                <div className="relative mb-4">
                  <input 
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    placeholder="Miktar ($)"
                    className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#16a34a] font-mono text-sm"
                  />
                  {stake && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      KAZANÇ: <span className="text-[#16a34a] font-bold">${potentialWin.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={placeBet}
                  disabled={isSubmitting}
                  className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-black font-black py-3.5 rounded-xl transition-colors text-sm tracking-wider uppercase"
                >
                  {isSubmitting ? "BEKLEYİN..." : "BAHİS YAP"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
