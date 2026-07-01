"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Trophy, TrendingUp, Filter, Star, Clock, Trash2, Loader2, Activity, Zap, Flame } from "lucide-react";
import Header from "@/components/Header";
import { useBet } from "@/contexts/BetContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

// Iddaa-style league categories
const LEAGUES = [
  { id: 'nba', name: 'NBA', flag: '🏀', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard' },
  { id: 'wnba', name: 'WNBA', flag: '🏀', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard' },
  { id: 'mlb', name: 'MLB', flag: '⚾', url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard' },
  { id: 'nfl', name: 'NFL', flag: '🏈', url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard' },
  { id: 'nhl', name: 'NHL', flag: '🏒', url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard' },
  { id: 'mma', name: 'UFC/MMA', flag: '🥊', url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard' },
  { id: 'atp', name: 'Tennis ATP', flag: '🎾', url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard' },
  { id: 'super-lig', name: 'Süper Lig', flag: '🇹🇷', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard' },
  { id: '1-lig', name: '1. Lig', flag: '🇹🇷', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.2/scoreboard' },
  { id: 'champions-league', name: 'Şampiyonlar Ligi', flag: '🏆', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard' },
  { id: 'premier-league', name: 'Premier League', flag: '🏴', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard' },
  { id: 'la-liga', name: 'La Liga', flag: '🇪🇸', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard' },
  { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard' },
  { id: 'serie-a', name: 'Serie A', flag: '🇮🇹', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard' },
  { id: 'ligue-1', name: 'Ligue 1', flag: '🇫🇷', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard' },
];

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
  const homeStrength = ((h % 100) / 100) * 0.6 + 0.2;
  const awayStrength = 1 - homeStrength;
  
  const homeOdd = Math.max(1.05, (1 / (homeStrength * 0.45 + 0.1))).toFixed(2);
  const drawOdd = Math.max(2.50, (1 / (0.28 - Math.abs(homeStrength - 0.5) * 0.15))).toFixed(2);
  const awayOdd = Math.max(1.05, (1 / (awayStrength * 0.45 + 0.1))).toFixed(2);
  
  const totalGoals = ((h >> 3) % 100) / 100;
  const altOdd = (1.40 + totalGoals * 1.2).toFixed(2);
  const ustOdd = (3.50 - totalGoals * 1.8).toFixed(2);
  
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
  
  // Flashing effect state
  const [flashingOdds, setFlashingOdds] = useState<Record<string, 'up' | 'down'>>({});

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
                .filter((event: any) => event.status.type.state !== 'post')
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
                    attacks: Math.floor(Math.random() * 100),
                    possession: Math.floor(Math.random() * 40) + 30
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

  // Simulate Live Flashing Odds
  useEffect(() => {
     if (allMatches.length === 0) return;
     const interval = setInterval(() => {
        const flashes: Record<string, 'up' | 'down'> = {};
        allMatches.forEach(match => {
           if (Math.random() > 0.8) {
              const types = ['home', 'draw', 'away', 'alt', 'ust', 'kgEvet', 'kgHayir'];
              const type = types[Math.floor(Math.random() * types.length)];
              const direction = Math.random() > 0.5 ? 'up' : 'down';
              flashes[`${match.id}-${type}`] = direction;
           }
        });
        setFlashingOdds(flashes);
        setTimeout(() => setFlashingOdds({}), 800); // clear flashes
     }, 3000);
     return () => clearInterval(interval);
  }, [allMatches]);

  const filteredMatches = useMemo(() => {
    if (showTab === 'LIVE') return allMatches.filter(m => m.status === 'LIVE');
    if (showTab === 'UPCOMING') return allMatches.filter(m => m.status === 'UPCOMING');
    return allMatches;
  }, [allMatches, showTab]);

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
    // Play subtle click sound if possible (browser restrictions apply, we just simulate the UX)
    addSelection({ id: Date.now().toString() + Math.random().toString(), matchId, matchTitle, selection, odds });
  };

  // Combo Boost Logic
  const rawOdds = selections.reduce((acc, curr) => acc * curr.odds, 1);
  const isComboBoosted = selections.length >= 3;
  const comboMultiplier = isComboBoosted ? 1.10 : 1;
  const totalOdds = rawOdds * comboMultiplier;
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
      const inserts = selections.map(selection => ({
        user_id: session.user.id, match_id: selection.matchId, match_title: selection.matchTitle,
        selection: selection.selection, odds: selection.odds * comboMultiplier, stake: stakeAmount / selections.length,
        potential_win: potentialWin / selections.length, status: 'PENDING'
      }));
      const { error } = await supabase.from('sport_bets').insert(inserts);
      if (error) throw error;
      toast.success("Bahisiniz başarıyla alındı!"); clearSelections(); setStake("");
    } catch (err: any) { toast.error("Hata: " + err.message); }
    finally { setIsSubmitting(false); }
  };

  const OddButton = ({ matchId, matchTitle, label, selName, odd, typeKey }: { matchId: string; matchTitle: string; label: string; selName: string; odd: string, typeKey: string }) => {
    const flashState = flashingOdds[`${matchId}-${typeKey}`];
    let flashClass = '';
    if (flashState === 'up') flashClass = 'bg-green-500/20 text-green-400 border-green-500/50';
    else if (flashState === 'down') flashClass = 'bg-red-500/20 text-red-400 border-red-500/50';

    return (
    <button
      onClick={() => handleAddSelection(matchId, matchTitle, selName, parseFloat(odd))}
      className={`min-w-[56px] py-2.5 px-1 rounded-xl text-center font-mono text-sm font-black transition-all duration-300 border ${
        isSelected(matchId, selName)
          ? 'bg-gradient-to-b from-[#16a34a] to-[#15803d] border-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.5)] scale-105'
          : flashClass ? flashClass : 'bg-[#14151a] border-white/5 hover:border-white/20 text-gray-300 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`text-[9px] mb-1 tracking-widest font-sans ${isSelected(matchId, selName) ? 'text-black/70' : 'text-gray-500'}`}>{label}</div>
      {odd}
    </button>
  )};

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative">
      <Header />
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-6 flex gap-6 relative z-10">
        {/* Left Sidebar */}
        <aside className="w-64 hidden xl:block shrink-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-5 sticky top-28 shadow-2xl">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Trophy className="w-4 h-4 text-[#16a34a]" /> POPÜLER LİGLER
            </h3>
            <ul className="space-y-2">
              {LEAGUES.map((league) => (
                <li key={league.id}>
                  <button
                    onClick={() => toggleLeague(league.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${
                      activeLeagues.includes(league.id)
                        ? 'bg-gradient-to-r from-[#16a34a]/20 to-transparent text-[#16a34a] border-l-2 border-[#16a34a]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                    }`}
                  >
                    <span className="text-xl drop-shadow-md">{league.flag}</span>
                    <span className="truncate">{league.name}</span>
                    {activeLeagues.includes(league.id) && <Activity className="w-4 h-4 ml-auto text-[#16a34a] animate-pulse" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center - Matches Matrix */}
        <main className="flex-1 min-w-0">
          {/* Top Banner */}
          <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 mb-6 shadow-xl flex items-center justify-between relative overflow-hidden">
             <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-green-500/10 to-transparent"></div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3 mb-2">
                   GLOBAL MATCH CENTER
                </h1>
                <p className="text-sm text-gray-500">Live odds, instant execution, ultra-premium sports betting.</p>
             </div>
             
             <div className="flex items-center bg-black/50 p-1.5 rounded-xl border border-white/10 z-10">
                {(['ALL', 'LIVE', 'UPCOMING'] as const).map(tab => (
                  <button key={tab} onClick={() => setShowTab(tab)}
                    className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all uppercase tracking-widest ${
                      showTab === tab ? 'bg-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'ALL' ? 'TÜMÜ' : tab === 'LIVE' ? <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> CANLI</span> : 'YAKLAŞAN'}
                  </button>
                ))}
             </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-500">
              <div className="w-12 h-12 border-4 border-[#16a34a]/30 border-t-[#16a34a] rounded-full animate-spin mb-4"></div>
              <span className="font-mono text-sm tracking-widest uppercase">SYNCING LIVE ODDS...</span>
            </div>
          ) : Object.keys(groupedMatches).length === 0 ? (
            <div className="py-20 text-center bg-[#0a0a0a] rounded-3xl border border-white/5 text-gray-500 font-bold shadow-xl">
              Bu kategoride aktif maç bulunmuyor.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMatches).map(([league, matches]) => (
                <div key={league} className="bg-[#0a0a0a] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                  {/* League Header */}
                  <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-white/5 to-transparent border-b border-white/5">
                    <span className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                       {matches[0].leagueFlag} {league}
                    </span>
                    <div className="h-4 w-px bg-white/10"></div>
                    <span className="text-[10px] text-[#16a34a] font-mono font-bold bg-[#16a34a]/10 px-2 py-1 rounded">{matches.length} ETKİNLİK</span>
                  </div>
                  
                  {/* Matches Grid */}
                  <div className="divide-y divide-white/5">
                    {matches.map((match: any) => (
                      <div key={match.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col xl:flex-row items-center gap-6">
                        
                        {/* Match Info & Live Sim */}
                        <div className="flex items-center gap-4 w-full xl:w-80 shrink-0">
                          <div className="text-center min-w-[50px]">
                            {match.status === 'LIVE' ? (
                              <div className="flex flex-col items-center bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                                <span className="text-red-500 text-xs font-black animate-pulse">{match.minute || 'LIVE'}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{match.dateLabel}</span>
                                <span className="text-sm text-white font-mono font-black">{match.time}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-bold text-white truncate group-hover:text-[#16a34a] transition-colors">{match.homeTeam}</span>
                              {match.score && <span className="text-lg font-black text-[#16a34a] font-mono ml-2">{match.score.split('-')[0]}</span>}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white truncate group-hover:text-[#16a34a] transition-colors">{match.awayTeam}</span>
                              {match.score && <span className="text-lg font-black text-[#16a34a] font-mono ml-2">{match.score.split('-')[1]}</span>}
                            </div>
                            
                            {/* Live Simulation Stats */}
                            {match.status === 'LIVE' && (
                               <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 font-mono">
                                  <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-blue-500" /> Attacks: {match.attacks}</span>
                                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Poss: {match.possession}%</span>
                               </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Odds Matrix */}
                        <div className="w-full xl:flex-1 grid grid-cols-7 gap-2">
                          <div className="col-span-3 flex gap-1 bg-white/5 p-1 rounded-xl">
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="1" selName={match.homeTeam} odd={match.odds.home} typeKey="home" />
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="X" selName="Beraberlik" odd={match.odds.draw} typeKey="draw" />
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="2" selName={match.awayTeam} odd={match.odds.away} typeKey="away" />
                          </div>
                          <div className="col-span-2 flex gap-1 bg-white/5 p-1 rounded-xl">
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="ALT 2.5" selName="Alt 2.5" odd={match.odds.alt} typeKey="alt" />
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="ÜST 2.5" selName="Üst 2.5" odd={match.odds.ust} typeKey="ust" />
                          </div>
                          <div className="col-span-2 flex gap-1 bg-white/5 p-1 rounded-xl">
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="VAR" selName="KG Var" odd={match.odds.kgEvet} typeKey="kgEvet" />
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="YOK" selName="KG Yok" odd={match.odds.kgHayir} typeKey="kgHayir" />
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar - Premium Bet Slip */}
        <aside className="w-[340px] hidden lg:block shrink-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden sticky top-28 shadow-2xl flex flex-col" style={{maxHeight: 'calc(100vh - 120px)'}}>
            
            <div className="p-5 border-b border-white/5 bg-[#050505] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#16a34a]/10 rounded-full blur-[40px] pointer-events-none"></div>
              <h3 className="font-black text-white text-lg flex items-center justify-between">
                 PORTFOLIO / SLIP
                 <span className="text-[10px] font-bold text-[#16a34a] bg-[#16a34a]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#16a34a]/20">
                   {selections.length} Picks
                 </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {selections.length === 0 ? (
                <div className="text-center text-gray-500 py-12 flex flex-col items-center justify-center opacity-50">
                  <Activity className="w-12 h-12 mb-3" />
                  <span className="text-xs font-bold tracking-widest uppercase">SLIP IS EMPTY</span>
                  <span className="text-[10px] font-mono mt-1">Select odds to start building</span>
                </div>
              ) : selections.map((sel, idx) => (
                <div key={idx} className="bg-[#14151a] border border-white/5 hover:border-[#16a34a]/30 rounded-2xl p-4 relative group transition-colors shadow-lg">
                  <button onClick={() => removeSelection(sel.id)}
                    className="absolute top-3 right-3 p-1 text-gray-600 hover:text-red-500 rounded-lg bg-black transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] font-bold text-gray-500 mb-2 pr-6 truncate uppercase tracking-wider">{sel.matchTitle}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-white">{sel.selection}</span>
                    <span className="text-base font-black text-[#16a34a] font-mono bg-[#16a34a]/10 px-2 py-0.5 rounded">{sel.odds.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {selections.length > 0 && (
              <div className="p-5 border-t border-white/5 bg-[#050505] relative">
                
                {/* Combo Boost Alert */}
                {isComboBoosted ? (
                   <div className="mb-4 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex items-center justify-between animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-2 text-orange-400">
                         <Flame className="w-4 h-4 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Parlay Boost Active</span>
                      </div>
                      <span className="text-xs font-black text-orange-400">+10% ODDS</span>
                   </div>
                ) : (
                   <div className="mb-4 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Add {3 - selections.length} more for Boost</span>
                   </div>
                )}

                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Odds</span>
                  <div className="flex items-center gap-2">
                    {isComboBoosted && <span className="text-xs text-gray-500 line-through font-mono">{rawOdds.toFixed(2)}</span>}
                    <span className="text-white font-black font-mono text-xl">{totalOdds.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">Stake ($)</span>
                    <span className="text-xs font-mono text-gray-500">Bal: ${balance.toFixed(2)}</span>
                  </div>
                  <input type="number" value={stake} onChange={(e) => setStake(e.target.value)}
                    className="w-full bg-[#14151a] border border-white/10 rounded-xl p-4 text-white font-black text-lg focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]/50 transition-all font-mono" placeholder="0.00" />
                  
                  <div className="flex justify-between gap-2">
                    {[10, 50, 100, 500].map(amt => (
                      <button key={amt} onClick={() => setStake(amt.toString())} className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-[10px] font-bold text-gray-400 transition-colors border border-white/5">${amt}</button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 bg-[#16a34a]/5 border border-[#16a34a]/20 p-4 rounded-xl">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Potential Return</span>
                   <span className="text-xl font-black text-[#16a34a] font-mono">${potentialWin.toFixed(2)}</span>
                </div>

                <button onClick={placeBet} disabled={isSubmitting || !stake}
                  className="w-full bg-gradient-to-r from-[#16a34a] to-[#15803d] disabled:opacity-50 text-black font-black py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(22,163,74,0.3)] disabled:hover:scale-100 flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> EXECUTING...</> : "PLACE BET"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
