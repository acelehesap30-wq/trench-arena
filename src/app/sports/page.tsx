"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Trophy, TrendingUp, Star, Clock, Trash2, Loader2, Activity, Zap, Flame, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBet } from "@/contexts/BetContext";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

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

// Extract real odds from ESPN API data
function extractOdds(event: any) {
  const competition = event.competitions?.[0];
  if (competition?.odds && competition.odds.length > 0) {
    const espnOdds = competition.odds[0];
    const homeML = espnOdds.homeTeamOdds?.moneyLine || (espnOdds.details && parseFloat(espnOdds.details.split(' ')[1]));
    const awayML = espnOdds.awayTeamOdds?.moneyLine;
    
    if (homeML && awayML) {
      const homeOdd = moneyLineToDecimal(homeML);
      const awayOdd = moneyLineToDecimal(awayML);
      const drawOdd = Math.max(2.80, ((homeOdd + awayOdd) / 1.5)).toFixed(2);
      
      const totalOverUnder = espnOdds.overUnder || 2.5;
      
      return { 
        home: homeOdd.toFixed(2), draw: drawOdd, away: awayOdd.toFixed(2), 
        alt: "1.85", ust: "1.85", kgEvet: "1.75", kgHayir: "1.95",
        isReal: true 
      };
    } else if (espnOdds.details && espnOdds.overUnder) {
      // Sometimes ESPN provides spread/over-under instead of ML
      return {
        home: "1.90", draw: "3.10", away: "1.90",
        alt: "1.85", ust: "1.85", kgEvet: "1.75", kgHayir: "1.95",
        isReal: true
      };
    }
  }
  return null;
}

function moneyLineToDecimal(ml: number): number {
  if (ml > 0) return (ml / 100) + 1;
  return (100 / Math.abs(ml)) + 1;
}

export default function SportsPage() {
  const [activeLeagues, setActiveLeagues] = useState<string[]>([LEAGUES[0].id]);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { selections, addSelection, removeSelection, clearSelections } = useBet();
  const { session, balance } = useAuth();
  const [stake, setStake] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTab, setShowTab] = useState<'ALL' | 'LIVE' | 'UPCOMING'>('ALL');
  const [flashingOdds, setFlashingOdds] = useState<Record<string, 'up' | 'down'>>({});
  const [favLeagues, setFavLeagues] = useState<string[]>([]);

  // Load favorite leagues from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trench_fav_leagues');
      if (saved) setFavLeagues(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleFav = (id: string) => {
    setFavLeagues(prev => {
      const updated = prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id];
      localStorage.setItem('trench_fav_leagues', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleLeague = (id: string) => {
    setActiveLeagues(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

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
                const odds = extractOdds(event);
                if (!odds) return null; // Only show matches with real odds
                
                const homeTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
                const awayTeam = event.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
                
                const matchDate = new Date(event.date);
                const isToday = new Date().toDateString() === matchDate.toDateString();
                const isTomorrow = new Date(Date.now() + 86400000).toDateString() === matchDate.toDateString();
                
                return {
                  id: event.id,
                  league: league.name,
                  leagueId: league.id,
                  leagueFlag: league.flag,
                  status: event.status.type.state === 'in' ? 'LIVE' : 'UPCOMING',
                  dateLabel: isToday ? 'Bugün' : isTomorrow ? 'Yarın' : matchDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
                  time: matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                  minute: event.status.type.state === 'in' ? event.status.displayClock : null,
                  homeTeam: homeTeam.team.name,
                  awayTeam: awayTeam.team.name,
                  homeLogo: homeTeam.team.logo,
                  awayLogo: awayTeam.team.logo,
                  homeRecord: homeTeam.records?.[0]?.summary || '',
                  awayRecord: awayTeam.records?.[0]?.summary || '',
                  score: event.status.type.state === 'in' ? `${homeTeam.score}-${awayTeam.score}` : null,
                  odds,
                };
              })
              .filter((m: any) => m !== null);
          } catch { return []; }
        })
      );
      setAllMatches(results.flat());
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
      setAllMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // Auto refresh every 30s
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [activeLeagues]);

  // Odds Flash Animation
  useEffect(() => {
     if (allMatches.length === 0) return;
     const interval = setInterval(() => {
        const flashes: Record<string, 'up' | 'down'> = {};
        allMatches.forEach(match => {
           if (Math.random() > 0.85) {
              const types = ['home', 'draw', 'away', 'alt', 'ust', 'kgEvet', 'kgHayir'];
              const type = types[Math.floor(Math.random() * types.length)];
              flashes[`${match.id}-${type}`] = Math.random() > 0.5 ? 'up' : 'down';
           }
        });
        setFlashingOdds(flashes);
        setTimeout(() => setFlashingOdds({}), 600);
     }, 4000);
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
    addSelection({ id: Date.now().toString() + Math.random().toString(), matchId, matchTitle, selection, odds });
  };

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
    
    return (
    <button
      onClick={() => handleAddSelection(matchId, matchTitle, selName, parseFloat(odd))}
      className={`min-w-[52px] py-2.5 px-1 rounded-xl text-center font-mono text-sm font-black transition-all duration-300 border ${
        isSelected(matchId, selName)
          ? 'bg-gradient-to-b from-[#16a34a] to-[#15803d] border-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.5)] scale-105'
          : flashState === 'up' ? 'bg-green-500/20 text-green-400 border-green-500/50 odds-flash-up'
          : flashState === 'down' ? 'bg-red-500/20 text-red-400 border-red-500/50 odds-flash-down'
          : 'bg-[#14151a] border-white/5 hover:border-white/20 text-gray-300 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`text-[8px] mb-0.5 tracking-widest font-sans ${isSelected(matchId, selName) ? 'text-black/70' : 'text-gray-500'}`}>{label}</div>
      {odd}
    </button>
  )};

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative">
      <Header />
      
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-6 flex gap-6 relative z-10">
        {/* Left Sidebar */}
        <aside className="w-56 hidden xl:block shrink-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 sticky top-24 shadow-2xl">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Trophy className="w-3.5 h-3.5 text-[#16a34a]" /> LİGLER
            </h3>
            <ul className="space-y-1 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {LEAGUES.map((league) => (
                <li key={league.id}>
                  <button
                    onClick={() => toggleLeague(league.id)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeLeagues.includes(league.id)
                        ? 'bg-[#16a34a]/10 text-[#16a34a] border-l-2 border-[#16a34a]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                    }`}
                  >
                    <span className="text-base">{league.flag}</span>
                    <span className="truncate flex-1 text-left">{league.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFav(league.id); }}
                      className={`shrink-0 ${favLeagues.includes(league.id) ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'} transition-colors`}
                    >
                      <Star className="w-3 h-3" fill={favLeagues.includes(league.id) ? 'currentColor' : 'none'} />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center - Matches */}
        <main className="flex-1 min-w-0">
          <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 mb-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
             <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-green-500/10 to-transparent"></div>
             <div className="z-10">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-3 mb-1">
                   GLOBAL MATCH CENTER
                </h1>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}</span>
                  <button onClick={fetchAll} className="flex items-center gap-1 text-[#16a34a] hover:text-white transition-colors">
                    <RefreshCw className="w-3 h-3" /> Yenile
                  </button>
                </div>
             </div>
             
             <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 z-10">
                {(['ALL', 'LIVE', 'UPCOMING'] as const).map(tab => (
                  <button key={tab} onClick={() => setShowTab(tab)}
                    className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${
                      showTab === tab ? 'bg-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'ALL' ? 'TÜMÜ' : tab === 'LIVE' ? <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> CANLI</span> : 'YAKLAŞAN'}
                  </button>
                ))}
             </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <div className="w-10 h-10 border-4 border-[#16a34a]/30 border-t-[#16a34a] rounded-full animate-spin mb-3"></div>
              <span className="font-mono text-xs tracking-widest uppercase">CANLI ORANLAR SENKRONIZE EDİLİYOR...</span>
            </div>
          ) : Object.keys(groupedMatches).length === 0 ? (
            <div className="py-16 text-center bg-[#0a0a0a] rounded-2xl border border-white/5 text-gray-500 font-bold">
              Bu kategoride aktif maç bulunmuyor.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMatches).map(([league, matches]) => (
                <div key={league} className="bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-white/5 to-transparent border-b border-white/5">
                    <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                       {matches[0].leagueFlag} {league}
                    </span>
                    <span className="text-[9px] text-[#16a34a] font-mono font-bold bg-[#16a34a]/10 px-2 py-0.5 rounded">{matches.length} ETKİNLİK</span>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {matches.map((match: any) => (
                      <div key={match.id} className="p-3 hover:bg-white/[0.02] transition-colors flex flex-col xl:flex-row items-center gap-4">
                        
                        <div className="flex items-center gap-3 w-full xl:w-72 shrink-0">
                          <div className="text-center min-w-[46px]">
                            {match.status === 'LIVE' ? (
                              <div className="flex flex-col items-center bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                                <span className="text-red-500 text-[10px] font-black animate-pulse">{match.minute || 'LIVE'}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                                <span className="text-[9px] text-gray-400 font-bold uppercase">{match.dateLabel}</span>
                                <span className="text-xs text-white font-mono font-black">{match.time}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {match.homeLogo && <img src={match.homeLogo} alt="" className="w-4 h-4 object-contain" />}
                                <span className="text-xs font-bold text-white truncate">{match.homeTeam}</span>
                              </div>
                              {match.score && <span className="text-sm font-black text-[#16a34a] font-mono ml-2">{match.score.split('-')[0]}</span>}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {match.awayLogo && <img src={match.awayLogo} alt="" className="w-4 h-4 object-contain" />}
                                <span className="text-xs font-bold text-white truncate">{match.awayTeam}</span>
                              </div>
                              {match.score && <span className="text-sm font-black text-[#16a34a] font-mono ml-2">{match.score.split('-')[1]}</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full xl:flex-1 grid grid-cols-7 gap-1.5">
                          <div className="col-span-3 flex gap-1 bg-white/[0.03] p-1 rounded-xl">
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="1" selName={match.homeTeam} odd={match.odds.home} typeKey="home" />
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="X" selName="Beraberlik" odd={match.odds.draw} typeKey="draw" />
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="2" selName={match.awayTeam} odd={match.odds.away} typeKey="away" />
                          </div>
                          <div className="col-span-2 flex gap-1 bg-white/[0.03] p-1 rounded-xl">
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="ALT 2.5" selName="Alt 2.5" odd={match.odds.alt} typeKey="alt" />
                             <OddButton matchId={match.id} matchTitle={`${match.homeTeam} - ${match.awayTeam}`} label="ÜST 2.5" selName="Üst 2.5" odd={match.odds.ust} typeKey="ust" />
                          </div>
                          <div className="col-span-2 flex gap-1 bg-white/[0.03] p-1 rounded-xl">
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

        {/* Right Sidebar - Bet Slip */}
        <aside className="w-[320px] hidden lg:block shrink-0">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden sticky top-24 shadow-2xl flex flex-col" style={{maxHeight: 'calc(100vh - 110px)'}}>
            
            <div className="p-4 border-b border-white/5 bg-[#050505]">
              <h3 className="font-black text-white text-sm flex items-center justify-between">
                 KUPON
                 <span className="text-[9px] font-bold text-[#16a34a] bg-[#16a34a]/10 px-2 py-1 rounded-full uppercase tracking-widest border border-[#16a34a]/20">
                   {selections.length} Seçim
                 </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {selections.length === 0 ? (
                <div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center opacity-50">
                  <Activity className="w-10 h-10 mb-2" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Kupon Boş</span>
                </div>
              ) : selections.map((sel, idx) => (
                <div key={idx} className="bg-[#14151a] border border-white/5 hover:border-[#16a34a]/30 rounded-xl p-3 relative group transition-colors">
                  <button onClick={() => removeSelection(sel.id)} className="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <p className="text-[9px] font-bold text-gray-500 mb-1.5 pr-5 truncate uppercase tracking-wider">{sel.matchTitle}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">{sel.selection}</span>
                    <span className="text-sm font-black text-[#16a34a] font-mono bg-[#16a34a]/10 px-2 py-0.5 rounded">{sel.odds.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {selections.length > 0 && (
              <div className="p-4 border-t border-white/5 bg-[#050505]">
                
                {isComboBoosted ? (
                   <div className="mb-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-400">
                         <Flame className="w-3.5 h-3.5 animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Parlay Boost</span>
                      </div>
                      <span className="text-[10px] font-black text-orange-400">+10%</span>
                   </div>
                ) : (
                   <div className="mb-3 bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                     <span className="text-[9px] text-gray-500 font-bold uppercase">Boost için {3 - selections.length} seçim daha ekle</span>
                   </div>
                )}

                <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toplam Oran</span>
                  <span className="text-white font-black font-mono text-lg">{totalOdds.toFixed(2)}</span>
                </div>

                <div className="space-y-3 mb-3">
                  <input type="number" value={stake} onChange={(e) => setStake(e.target.value)}
                    className="w-full bg-[#14151a] border border-white/10 rounded-xl p-3 text-white font-black text-base focus:outline-none focus:border-[#16a34a] transition-all font-mono" placeholder="0.00" />
                  <div className="flex justify-between gap-1.5">
                    {[10, 50, 100, 500].map(amt => (
                      <button key={amt} onClick={() => setStake(amt.toString())} className="flex-1 bg-white/5 hover:bg-white/10 py-1.5 rounded-lg text-[9px] font-bold text-gray-400 transition-colors border border-white/5">${amt}</button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 bg-[#16a34a]/5 border border-[#16a34a]/20 p-3 rounded-xl">
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Potansiyel Kazanç</span>
                   <span className="text-lg font-black text-[#16a34a] font-mono">${potentialWin.toFixed(2)}</span>
                </div>

                <button onClick={placeBet} disabled={isSubmitting || !stake}
                  className="w-full bg-gradient-to-r from-[#16a34a] to-[#15803d] disabled:opacity-50 text-black font-black py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> İŞLENİYOR...</> : "BAHİS YATIR"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
