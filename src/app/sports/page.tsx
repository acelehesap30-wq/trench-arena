"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Trophy, TrendingUp, Filter, Star, Clock, Trash2, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useBet } from "@/contexts/BetContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

// Iddaa-style league categories
const LEAGUES = [
  { id: 'super-lig', name: 'Süper Lig', flag: '🇹🇷', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard' },
  { id: '1-lig', name: '1. Lig', flag: '🇹🇷', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.2/scoreboard' },
  { id: 'champions-league', name: 'Şampiyonlar Ligi', flag: '🏆', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard' },
  { id: 'premier-league', name: 'Premier League', flag: '🏴', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard' },
  { id: 'la-liga', name: 'La Liga', flag: '🇪🇸', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard' },
  { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard' },
  { id: 'serie-a', name: 'Serie A', flag: '🇮🇹', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard' },
  { id: 'ligue-1', name: 'Ligue 1', flag: '🇫🇷', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard' },
];

// Generate deterministic odds from team name hash
function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateOdds(homeTeam: string, awayTeam: string) {
  const h = hashStr(homeTeam + awayTeam);
  const homeStrength = ((h % 100) / 100) * 0.6 + 0.2; // 0.2 to 0.8
  const awayStrength = 1 - homeStrength;
  
  const homeOdd = Math.max(1.05, (1 / (homeStrength * 0.45 + 0.1))).toFixed(2);
  const drawOdd = Math.max(2.50, (1 / (0.28 - Math.abs(homeStrength - 0.5) * 0.15))).toFixed(2);
  const awayOdd = Math.max(1.05, (1 / (awayStrength * 0.45 + 0.1))).toFixed(2);
  
  // Alt/Üst 2.5
  const totalGoals = ((h >> 3) % 100) / 100;
  const altOdd = (1.40 + totalGoals * 1.2).toFixed(2);
  const ustOdd = (3.50 - totalGoals * 1.8).toFixed(2);
  
  // Karşılıklı Gol
  const kgVar = ((h >> 7) % 100) / 100;
  const kgEvet = (1.50 + kgVar * 0.8).toFixed(2);
  const kgHayir = (2.00 + (1 - kgVar) * 1.0).toFixed(2);
  
  return { home: homeOdd, draw: drawOdd, away: awayOdd, alt: altOdd, ust: ustOdd, kgEvet, kgHayir };
}

export default function SportsPage() {
  const [activeLeagues, setActiveLeagues] = useState<string[]>([LEAGUES[0].id]);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { selections, addSelection, removeSelection, clearSelections } = useBet();
  const { session, balance } = useAuth();
  const [stake, setStake] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTab, setShowTab] = useState<'ALL' | 'LIVE' | 'UPCOMING'>('ALL');

  const toggleLeague = (id: string) => {
    setActiveLeagues(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const selectedLeagues = LEAGUES.filter(l => activeLeagues.includes(l.id));
      
      try {
        const results = await Promise.all(
          selectedLeagues.map(async (league) => {
            try {
              const res = await fetch(league.url);
              const data = await res.json();
              if (!data.events) return [];
              
              return data.events
                .filter((event: any) => event.status.type.state !== 'post') // FILTER OUT FINISHED MATCHES
                .map((event: any) => {
                  const homeTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
                  const awayTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
                  const odds = generateOdds(homeTeam.team.name, awayTeam.team.name);
                  
                  const matchDate = new Date(event.date);
                  const isToday = new Date().toDateString() === matchDate.toDateString();
                  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === matchDate.toDateString();
                  
                  return {
                    id: event.id,
                    league: league.name,
                    leagueFlag: league.flag,
                    status: event.status.type.state === 'in' ? 'LIVE' : 'UPCOMING',
                    dateLabel: isToday ? 'Bugün' : isTomorrow ? 'Yarın' : matchDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
                    time: matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    minute: event.status.type.state === 'in' ? event.status.displayClock : null,
                    homeTeam: homeTeam.team.name,
                    awayTeam: awayTeam.team.name,
                    score: event.status.type.state === 'in' ? `${homeTeam.score}-${awayTeam.score}` : null,
                    odds,
                  };
                });
            } catch { return []; }
          })
        );
        setAllMatches(results.flat());
      } catch (err) {
        console.error(err);
        setAllMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [activeLeagues]);

  const filteredMatches = useMemo(() => {
    if (showTab === 'LIVE') return allMatches.filter(m => m.status === 'LIVE');
    if (showTab === 'UPCOMING') return allMatches.filter(m => m.status === 'UPCOMING');
    return allMatches;
  }, [allMatches, showTab]);

  // Group matches by league
  const groupedMatches = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredMatches.forEach(m => {
      if (!groups[m.league]) groups[m.league] = [];
      groups[m.league].push(m);
    });
    return groups;
  }, [filteredMatches]);

  const isSelected = (matchId: string, selectionName: string) => {
    return selections.some(s => s.matchId === matchId && s.selection === selectionName);
  };

  const handleAddSelection = (matchId: string, matchTitle: string, selection: string, odds: number) => {
    addSelection({ id: Date.now().toString() + Math.random().toString(), matchId, matchTitle, selection, odds });
  };

  const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, 1);
  const potentialWin = parseFloat(stake || "0") * totalOdds;

  const placeBet = async () => {
    if (!session) { toast.error("Lütfen önce giriş yapın."); return; }
    if (selections.length === 0) return;
    const stakeAmount = parseFloat(stake);
    if (!stakeAmount || stakeAmount <= 0) { toast.error("Geçerli bir bahis miktarı girin."); return; }
    if (stakeAmount > balance) { toast.error("Yetersiz bakiye."); return; }
    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const totalOddsVal = selections.reduce((acc, curr) => acc * curr.odds, 1);
      const potentialWinVal = stakeAmount * totalOddsVal;
      const inserts = selections.map(selection => ({
        user_id: session.user.id, match_id: selection.matchId, match_title: selection.matchTitle,
        selection: selection.selection, odds: selection.odds, stake: stakeAmount / selections.length,
        potential_win: potentialWinVal / selections.length, status: 'PENDING'
      }));
      const { error } = await supabase.from('sport_bets').insert(inserts);
      if (error) throw error;
      toast.success("Bahisiniz başarıyla alındı!"); clearSelections(); setStake("");
    } catch (err: any) { toast.error("Hata: " + err.message); }
    finally { setIsSubmitting(false); }
  };

  const OddButton = ({ matchId, matchTitle, label, selName, odd }: { matchId: string; matchTitle: string; label: string; selName: string; odd: string }) => (
    <button
      onClick={() => handleAddSelection(matchId, matchTitle, selName, parseFloat(odd))}
      className={`min-w-[52px] py-2 px-1 rounded text-center font-mono text-xs font-bold transition-all border ${
        isSelected(matchId, selName)
          ? 'bg-[#16a34a] border-[#16a34a] text-black shadow-[0_0_10px_rgba(22,163,74,0.4)]'
          : 'bg-[#14151a] border-white/5 hover:border-[#16a34a]/50 text-gray-300 hover:text-white'
      }`}
    >
      <div className="text-[8px] opacity-50 mb-0.5">{label}</div>
      {odd}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />
      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-6 flex gap-5">
        {/* Left Sidebar */}
        <aside className="w-56 hidden xl:block shrink-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 sticky top-28">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 pl-2">LİGLER</h3>
            <ul className="space-y-1">
              {LEAGUES.map((league) => (
                <li key={league.id}>
                  <button
                    onClick={() => toggleLeague(league.id)}
                    className={`w-full flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeLeagues.includes(league.id)
                        ? 'bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/30'
                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'
                    }`}
                  >
                    <span className="text-base">{league.flag}</span>
                    <span className="truncate">{league.name}</span>
                    {activeLeagues.includes(league.id) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#16a34a]"></div>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center - Matches Table */}
        <main className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-3">
            <Trophy className="w-6 h-6 text-[#16a34a]" />
            <h1 className="text-xl font-black text-white mr-6">İDDAA PROGRAMI</h1>
            {(['ALL', 'LIVE', 'UPCOMING'] as const).map(tab => (
              <button key={tab} onClick={() => setShowTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  showTab === tab ? 'bg-[#16a34a] text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'TÜMÜ' : tab === 'LIVE' ? '🔴 CANLI' : '⏰ YAKIN'}
              </button>
            ))}
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_52px_52px_52px_52px_52px_52px_52px] gap-1 px-4 py-2 text-[9px] font-black text-gray-600 uppercase tracking-wider border-b border-white/5 mb-1">
            <span>Maç</span>
            <span className="text-center">MS 1</span>
            <span className="text-center">X</span>
            <span className="text-center">MS 2</span>
            <span className="text-center">Alt</span>
            <span className="text-center">Üst</span>
            <span className="text-center">KG V</span>
            <span className="text-center">KG Y</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-mono text-sm">Maçlar yükleniyor...</span>
            </div>
          ) : Object.keys(groupedMatches).length === 0 ? (
            <div className="py-20 text-center bg-[#0a0a0a] rounded-2xl border border-white/5 text-gray-500 font-bold">
              Seçili liglerde yaklaşan veya canlı maç bulunmuyor.
              <p className="text-xs text-gray-600 mt-2">Sezon arası olabilir. Sol panelden farklı ligler seçmeyi deneyin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMatches).map(([league, matches]) => (
                <div key={league}>
                  {/* League Header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0d] rounded-t-lg border border-white/5 border-b-0">
                    <span className="text-xs font-black text-[#16a34a] uppercase tracking-wider">{league}</span>
                    <span className="text-[10px] text-gray-600 font-mono">{matches.length} maç</span>
                  </div>
                  
                  {/* Matches */}
                  <div className="border border-white/5 rounded-b-lg overflow-hidden divide-y divide-white/5">
                    {matches.map((match: any) => (
                      <div key={match.id} className="grid grid-cols-1 md:grid-cols-[1fr_52px_52px_52px_52px_52px_52px_52px] gap-1 px-3 py-2.5 bg-[#0a0a0a] hover:bg-[#0e0e0e] transition-colors items-center">
                        {/* Match Info */}
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[44px]">
                            {match.status === 'LIVE' ? (
                              <div className="flex flex-col items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mb-0.5"></div>
                                <span className="text-red-500 text-[10px] font-black">{match.minute || 'CANLI'}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] text-gray-600 font-bold">{match.dateLabel}</span>
                                <span className="text-xs text-gray-400 font-mono font-bold">{match.time}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white truncate">{match.homeTeam}</span>
                              {match.score && <span className="text-sm font-black text-[#16a34a] font-mono">{match.score.split('-')[0]}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white truncate">{match.awayTeam}</span>
                              {match.score && <span className="text-sm font-black text-[#16a34a] font-mono">{match.score.split('-')[1]}</span>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Odds - Desktop */}
                        <div className="hidden md:contents">
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="1" selName={match.homeTeam} odd={match.odds.home} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="X" selName="Beraberlik" odd={match.odds.draw} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="2" selName={match.awayTeam} odd={match.odds.away} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="Alt" selName="Alt 2.5" odd={match.odds.alt} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="Üst" selName="Üst 2.5" odd={match.odds.ust} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="Var" selName="KG Var" odd={match.odds.kgEvet} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="Yok" selName="KG Yok" odd={match.odds.kgHayir} />
                        </div>

                        {/* Odds - Mobile */}
                        <div className="flex gap-1 mt-2 md:hidden flex-wrap">
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="1" selName={match.homeTeam} odd={match.odds.home} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="X" selName="Beraberlik" odd={match.odds.draw} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="2" selName={match.awayTeam} odd={match.odds.away} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="A" selName="Alt 2.5" odd={match.odds.alt} />
                          <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="Ü" selName="Üst 2.5" odd={match.odds.ust} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar - Coupon */}
        <aside className="w-72 hidden lg:block shrink-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden sticky top-28 shadow-xl flex flex-col" style={{maxHeight: 'calc(100vh - 120px)'}}>
            <div className="p-3 border-b border-white/5 bg-[#14151a] flex justify-between items-center">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> KUPONUM
              </h3>
              <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded">{selections.length} Seçim</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {selections.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-8 font-medium border border-dashed border-white/10 rounded-xl bg-white/5">
                  Kuponunuz boş.<br/>Oranlara tıklayarak ekleyin.
                </div>
              ) : selections.map((sel, idx) => (
                <div key={idx} className="bg-[#14151a] border border-white/5 rounded-lg p-2.5 relative group">
                  <button onClick={() => removeSelection(sel.id)}
                    className="absolute top-1.5 right-1.5 p-0.5 text-gray-600 hover:text-red-500 rounded transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <p className="text-[9px] font-bold text-gray-600 mb-0.5 pr-5 truncate">{sel.matchTitle}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-white">{sel.selection}</span>
                    <span className="text-xs font-black text-[#16a34a] font-mono">{sel.odds.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            {selections.length > 0 && (
              <div className="p-3 border-t border-white/5 bg-[#14151a]">
                <div className="flex justify-between items-center mb-3 text-xs font-bold">
                  <span className="text-gray-400">T.Oran:</span>
                  <span className="text-white font-mono text-base">{totalOdds.toFixed(2)}</span>
                </div>
                <div className="relative mb-3">
                  <input type="number" value={stake} onChange={(e) => setStake(e.target.value)}
                    placeholder="Miktar ($)" className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#16a34a] font-mono text-xs" />
                  {stake && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">
                      KAZANÇ: <span className="text-[#16a34a] font-bold">${potentialWin.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <button onClick={placeBet} disabled={isSubmitting}
                  className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-black font-black py-3 rounded-xl transition-colors text-xs tracking-wider uppercase">
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
