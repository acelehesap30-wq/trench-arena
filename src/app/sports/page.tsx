"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, Flame, Trophy, Activity, ChevronRight, Star, Clock, Calendar, ChevronDown, Check, Dribbble, Target } from "lucide-react";

export default function SportsPage() {
  const [activeSport, setActiveSport] = useState("Futbol");
  const [activeTab, setActiveTab] = useState("CANLI");

  const sportsCategories = [
    { name: "Futbol", count: 145, icon: <Activity className="w-4 h-4" /> },
    { name: "Basketbol", count: 42, icon: <Dribbble className="w-4 h-4" /> },
    { name: "Tenis", count: 28, icon: <Target className="w-4 h-4" /> },
    { name: "E-Spor", count: 65, icon: <Flame className="w-4 h-4" /> },
    { name: "Buz Hokeyi", count: 12, icon: <Activity className="w-4 h-4" /> },
    { name: "Voleybol", count: 18, icon: <Activity className="w-4 h-4" /> },
  ];

  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // ESPN API Endpoints for live/upcoming matches
        const endpoints = [
          { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard', league: 'Premier League' },
          { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard', league: 'La Liga' },
          { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', league: 'NBA' },
          { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard', league: 'Şampiyonlar Ligi' }
        ];

        const allMatches = [];

        for (const ep of endpoints) {
          try {
            const res = await fetch(ep.url);
            const data = await res.json();
            
            if (data.events && data.events.length > 0) {
              const formatted = data.events.map((e: any) => {
                const comp = e.competitions[0];
                const home = comp.competitors.find((c: any) => c.homeAway === 'home');
                const away = comp.competitors.find((c: any) => c.homeAway === 'away');
                const status = comp.status.type.state; // 'pre', 'in', 'post'
                const clock = comp.status.displayClock;
                
                // Parse odds if available (DraftKings via ESPN)
                let oddsHome = 1.85, oddsDraw = 3.40, oddsAway = 4.20;
                if (comp.odds && comp.odds.length > 0 && comp.odds[0].moneyline) {
                  const ml = comp.odds[0].moneyline;
                  
                  const convertOdds = (american: number) => {
                    if (!american) return 2.0;
                    if (american < 0) return Number(((100 / Math.abs(american)) + 1).toFixed(2));
                    return Number(((american / 100) + 1).toFixed(2));
                  };

                  if (ml.home?.close?.odds) oddsHome = convertOdds(parseInt(ml.home.close.odds));
                  if (ml.away?.close?.odds) oddsAway = convertOdds(parseInt(ml.away.close.odds));
                  if (ml.draw?.close?.odds) oddsDraw = convertOdds(parseInt(ml.draw.close.odds));
                }

                return {
                  id: e.id,
                  league: ep.league,
                  homeTeam: home?.team?.displayName || 'Home',
                  awayTeam: away?.team?.displayName || 'Away',
                  score: status === 'pre' ? '0-0' : `${home?.score || 0}-${away?.score || 0}`,
                  time: status === 'pre' ? e.date.substring(11, 16) : (status === 'post' ? 'Bitti' : `${clock}'`),
                  odds: { home: oddsHome, draw: oddsDraw, away: oddsAway },
                  hot: status === 'in' || e.name.includes('Madrid') || e.name.includes('Lakers')
                };
              });
              allMatches.push(...formatted);
            }
          } catch (e) {
            console.error(`Failed to fetch ${ep.league}:`, e);
          }
        }

        if (allMatches.length > 0) {
          setLiveMatches(allMatches);
        } else {
          setLiveMatches([
            { id: 1, league: "Şampiyonlar Ligi", homeTeam: "Real Madrid", awayTeam: "Manchester City", score: "2-1", time: "72'", odds: { home: 1.85, draw: 3.40, away: 4.20 }, hot: true },
          ]);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setLiveMatches([
          { id: 1, league: "Şampiyonlar Ligi", homeTeam: "Real Madrid", awayTeam: "Manchester City", score: "2-1", time: "72'", odds: { home: 1.85, draw: 3.40, away: 4.20 }, hot: true },
        ]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Top Header - Kept Simple for Subpages */}
      <header className="h-20 glass-premium border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-3xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
            TRENCH<span className="text-[#16a34a]">BET</span>
          </Link>
          <nav className="hidden xl:flex items-center gap-8 text-sm font-extrabold tracking-wider text-gray-400">
            <Link href="/sports" className="text-white border-b-2 border-[#16a34a] pb-7 pt-7">SPOR</Link>
            <Link href="/live-casino" className="hover:text-white transition-colors">CANLI CASINO</Link>
            <Link href="/tournaments" className="hover:text-white transition-colors">TURNUVALAR</Link>
            <Link href="/polymarket" className="hover:text-white transition-colors">POLYMARKET</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-premium px-6 py-2.5 text-sm mr-2 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
            KRİPTO YATIR
          </button>
        </div>
      </header>

      <div className="flex-1 flex w-full max-w-[1920px] mx-auto">
        {/* Left Sidebar for Sports Categories */}
        <aside className="w-[280px] hidden lg:flex flex-col glass-premium border-r border-white/5 p-6 shrink-0 z-40 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Takım, lig veya maç ara..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#16a34a] transition-colors"
              />
            </div>

            <div>
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">Popüler Ligler</h3>
              <ul className="space-y-1.5 text-sm font-bold text-gray-400">
                <li className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors">
                  <Star className="w-4 h-4 text-yellow-500" /> Şampiyonlar Ligi
                </li>
                <li className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors">
                  <Star className="w-4 h-4 text-yellow-500" /> Premier League
                </li>
                <li className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 hover:text-white cursor-pointer transition-colors">
                  <Star className="w-4 h-4 text-yellow-500" /> NBA
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">Tüm Sporlar</h3>
              <ul className="space-y-1 text-sm text-gray-400 font-medium">
                {sportsCategories.map((sport) => (
                  <li 
                    key={sport.name}
                    onClick={() => setActiveSport(sport.name)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${activeSport === sport.name ? 'bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20' : 'hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      {sport.icon}
                      <span className={activeSport === sport.name ? 'font-bold' : ''}>{sport.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded ${activeSport === sport.name ? 'bg-[#16a34a]/20 text-[#16a34a]' : 'bg-white/5 text-gray-500'}`}>{sport.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          {/* Top Banner / Match Tracker */}
          <div className="w-full h-[240px] rounded-2xl mb-8 relative overflow-hidden flex items-center p-8 border border-white/10 group">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-1000"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2070')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            
            <div className="relative z-10 w-full flex justify-between items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-black mb-4 uppercase tracking-wider animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Canlı Maç Merkezi
                </span>
                
                {liveMatches.length > 0 ? (
                  <>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
                      {liveMatches[0].homeTeam} <span className="text-gray-500 text-2xl mx-2">vs</span> {liveMatches[0].awayTeam}
                    </h1>
                    <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" /> {liveMatches[0].league} - {liveMatches[0].time}
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Spor Bahisleri</h1>
                    <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" /> Şu an canlı maç bulunmuyor
                    </p>
                  </>
                )}
              </div>
              
              {liveMatches.length > 0 && (
                <div className="hidden md:flex items-center gap-6 glass-premium p-4 rounded-2xl border border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{liveMatches[0].score.split(' - ')[0]}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mt-1 max-w-[80px] truncate">{liveMatches[0].homeTeam}</div>
                  </div>
                  <div className="text-gray-600 font-black text-xl">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{liveMatches[0].score.split(' - ')[1]}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold mt-1 max-w-[80px] truncate">{liveMatches[0].awayTeam}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
            <button 
              onClick={() => setActiveTab("CANLI")}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'CANLI' ? 'bg-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Clock className="w-4 h-4" /> CANLI
            </button>
            <button 
              onClick={() => setActiveTab("YAKINDA")}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'YAKINDA' ? 'bg-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Calendar className="w-4 h-4" /> YAKINDA
            </button>
          </div>

          {/* Match List */}
          <div className="space-y-3">
            {loadingMatches ? (
              <div className="text-center py-10 text-gray-500">Canlı maçlar yükleniyor...</div>
            ) : liveMatches.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Şu anda canlı maç bulunmuyor.</div>
            ) : liveMatches.map((match) => (
              <div key={match.id} className="glass-premium border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-[#16a34a]/30 transition-colors group">
                <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                  <div className="w-12 text-center shrink-0">
                    <span className="text-[#16a34a] font-bold text-sm animate-pulse">{match.time}</span>
                  </div>
                  <div className="border-l border-white/10 pl-4 flex-1">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                      {match.league} {match.hot && <Flame className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between w-full md:w-48">
                      <span className="font-bold text-white text-sm">{match.homeTeam}</span>
                      <span className="font-black text-white text-sm bg-white/10 px-2 py-0.5 rounded">{match.score.split(' - ')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-48 mt-1.5">
                      <span className="font-bold text-white text-sm">{match.awayTeam}</span>
                      <span className="font-black text-white text-sm bg-white/10 px-2 py-0.5 rounded">{match.score.split(' - ')[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Odds Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button className="flex-1 md:w-20 lg:w-24 bg-white/5 hover:bg-[#16a34a] hover:text-black border border-white/10 hover:border-[#16a34a] rounded-lg py-3 flex flex-col items-center justify-center transition-all group/btn">
                    <span className="text-[10px] text-gray-500 group-hover/btn:text-black/60 font-bold mb-0.5">1</span>
                    <span className="font-black text-sm">{match.odds.home}</span>
                  </button>
                  <button className="flex-1 md:w-20 lg:w-24 bg-white/5 hover:bg-[#16a34a] hover:text-black border border-white/10 hover:border-[#16a34a] rounded-lg py-3 flex flex-col items-center justify-center transition-all group/btn">
                    <span className="text-[10px] text-gray-500 group-hover/btn:text-black/60 font-bold mb-0.5">X</span>
                    <span className="font-black text-sm">{match.odds.draw}</span>
                  </button>
                  <button className="flex-1 md:w-20 lg:w-24 bg-white/5 hover:bg-[#16a34a] hover:text-black border border-white/10 hover:border-[#16a34a] rounded-lg py-3 flex flex-col items-center justify-center transition-all group/btn">
                    <span className="text-[10px] text-gray-500 group-hover/btn:text-black/60 font-bold mb-0.5">2</span>
                    <span className="font-black text-sm">{match.odds.away}</span>
                  </button>
                  <button className="w-10 h-[56px] flex items-center justify-center bg-transparent hover:bg-white/5 rounded-lg text-gray-500 transition-colors ml-1">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>

        {/* Right Sidebar - Betslip (Kupon) */}
        <aside className="w-[300px] hidden xl:flex flex-col glass-premium border-l border-white/5 p-4 shrink-0 z-40 h-[calc(100vh-80px)]">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="bg-[#16a34a] text-black p-3 text-center font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> KUPONUM
            </div>
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-bold text-sm">Kuponunuzda maç bulunmuyor.</p>
              <p className="text-gray-600 text-xs mt-2">Oranlara tıklayarak seçim yapabilirsiniz.</p>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm font-bold">Toplam Oran</span>
                <span className="text-white font-black">0.00</span>
              </div>
              <button className="w-full bg-gray-800 text-gray-500 font-black py-3 rounded-lg cursor-not-allowed">
                BAHİS YAP
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
