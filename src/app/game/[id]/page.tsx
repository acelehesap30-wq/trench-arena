"use client";

import { ArrowLeft, Maximize, User, Activity, AlertTriangle, Lightbulb, LightbulbOff, Sparkles, Play, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRealtimeWins } from "@/hooks/useRealtimeWins";

export default function GameLauncher() {
  const params = useParams();
  const gameId = params.id as string;
  const { session, balance: realBalance } = useAuth();
  
  const [balance, setBalance] = useState("0.00");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRealMoney, setIsRealMoney] = useState(true);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [similarGames, setSimilarGames] = useState<any[]>([]);
  const { wins: liveWins } = useRealtimeWins(8);

  useEffect(() => {
    if (isRealMoney) {
      setBalance(realBalance.toFixed(2));
    } else {
      setBalance("100000.00");
    }
  }, [isRealMoney, realBalance]);

  // Fetch similar games from Supabase
  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const { data: currentGame } = await supabase
          .from('casino_games')
          .select('category')
          .eq('slug', gameId)
          .single();
        
        if (currentGame) {
          const { data: similar } = await supabase
            .from('casino_games')
            .select('*')
            .eq('category', currentGame.category)
            .neq('slug', gameId)
            .eq('is_active', true)
            .limit(6);
          
          if (similar) setSimilarGames(similar);
        }
      } catch {}
    };
    fetchSimilar();
  }, [gameId]);

  const getGameUrl = () => {
    const pragmaticMap: Record<string, string> = {
      "sweet-bonanza": "vs20fruitsw",
      "gates-of-olympus": "vs20olympgate",
      "sugar-rush": "vs20sugarrush",
      "the-dog-house": "vs20doghouse",
      "wolf-gold": "vs25wolfgold",
      "big-bass-bonanza": "vs10bbbonanza",
      "starlight-princess": "vs20starlight",
      "fruit-party": "vs20fruitparty",
      "gems-bonanza": "vs20goldfever",
      "madame-destiny": "vswaysmadame",
      "wild-west-gold": "vs40wildwest",
      "buffalo-king": "vswaysbufking",
      "mega-roulette": "712",
      "sweet-bonanza-candyland": "801",
      "one-blackjack": "104",
      "speed-baccarat": "401",
      "mega-wheel": "801"
    };

    if (pragmaticMap[gameId]) {
      return `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${pragmaticMap[gameId]}&lang=tr&cur=USD`;
    }
    return `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&lang=tr&cur=USD`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 1500);
  }, []);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans text-white transition-colors duration-1000 ${isCinematicMode ? 'bg-black' : 'bg-[#050505]'}`}>
      
      {/* Top Bar */}
      <div className={`h-14 flex items-center justify-between px-4 md:px-6 shrink-0 z-50 transition-all duration-700 ${isCinematicMode ? 'opacity-0 hover:opacity-100 absolute w-full top-0 bg-black/80 backdrop-blur' : 'bg-[#0a0a0a] border-b border-white/5 relative'}`}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#16a34a] group-hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs tracking-wide hidden sm:block">LOBİ</span>
          </Link>
          
          <div className="h-5 w-px bg-white/10"></div>
          
          <span className="text-white font-black uppercase tracking-widest text-xs">{gameId.replace(/-/g, ' ')}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-white/5 rounded-lg p-0.5">
             <button 
                onClick={() => setIsRealMoney(false)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded transition-all ${!isRealMoney ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-white'}`}
             >
                DEMO
             </button>
             <button 
                onClick={() => setIsRealMoney(true)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded transition-all ${isRealMoney ? 'bg-[#16a34a] text-black shadow-[0_0_10px_rgba(22,163,74,0.3)]' : 'text-gray-500 hover:text-white'}`}
             >
                GERÇEK PARA
             </button>
          </div>

          <div className="flex flex-col text-right bg-white/5 px-3 py-1 rounded-lg border border-white/5">
            <span className="text-[8px] text-gray-500 font-bold uppercase">Bakiye</span>
            <span className="text-xs font-black text-[#16a34a] font-mono">${balance}</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative w-full h-full flex flex-col md:flex-row">
        
        {/* Iframe Container */}
        <div className={`flex-1 relative w-full h-full flex items-center justify-center transition-all duration-1000 ${isCinematicMode ? 'bg-black' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black'}`}>
          
          {isCinematicMode && isLoaded && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
               <div className="w-[80%] h-[80%] bg-[#16a34a]/10 rounded-[100px] blur-[150px] animate-pulse"></div>
            </div>
          )}

          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-500">
              <div className="w-14 h-14 border-4 border-[#16a34a]/20 border-t-[#16a34a] rounded-full animate-spin mb-3"></div>
              <span className="text-xs font-black tracking-widest text-[#16a34a] uppercase">GÜVENLİ BAĞLANTI KURULUYOR</span>
            </div>
          )}

          <iframe 
            src={getGameUrl()} 
            className={`w-full h-full relative z-10 transition-all duration-1000 ${isCinematicMode ? 'scale-[0.98] shadow-[0_0_100px_rgba(22,163,74,0.15)] rounded-xl' : 'shadow-[0_0_50px_rgba(0,0,0,0.5)]'}`}
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>

          {/* Floating Actions */}
          <div className="absolute right-3 bottom-3 z-30 flex flex-col gap-2 items-end">
            {!isRealMoney && (
              <div className="bg-amber-500/90 backdrop-blur text-black text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Demo Modu
              </div>
            )}
            <div className="flex gap-1.5">
              <button 
                onClick={() => setIsCinematicMode(!isCinematicMode)}
                className={`w-10 h-10 backdrop-blur border rounded-full flex items-center justify-center transition-all shadow-xl ${isCinematicMode ? 'bg-[#16a34a] text-black border-[#16a34a]' : 'bg-black/60 text-white hover:text-[#16a34a] border-white/10'}`}
              >
                {isCinematicMode ? <LightbulbOff className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
              </button>
              <button 
                onClick={toggleFullscreen}
                className="w-10 h-10 bg-black/60 hover:bg-[#16a34a] backdrop-blur border border-white/10 rounded-full text-white hover:text-black flex items-center justify-center transition-all shadow-xl"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - LIVE from Supabase */}
        <div className={`w-72 bg-[#0a0a0a] border-l border-white/5 hidden xl:flex flex-col z-20 transition-all duration-700 ${isCinematicMode ? 'translate-x-full absolute right-0 h-full opacity-0 pointer-events-none' : 'translate-x-0 relative opacity-100'}`}>
          <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#050505]">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#16a34a]" /> Canlı Kazançlar
            </span>
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {liveWins.length === 0 ? (
              <div className="text-center text-gray-600 text-xs py-8 font-mono">
                Henüz kazanç verisi yok
              </div>
            ) : liveWins.map((win, i) => (
              <div key={win.id || i} className="bg-white/5 border border-white/5 p-2.5 rounded-xl flex items-center justify-between group hover:border-[#16a34a]/20 transition-colors animate-fadeInUp" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center border border-white/10">
                     <User className="w-3.5 h-3.5 text-gray-500" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-gray-300">{win.username || 'anon'}</span>
                     <span className="text-[9px] text-gray-500 truncate max-w-[80px]">{win.game_title}</span>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#16a34a] font-mono block">+${Number(win.win_amount).toFixed(2)}</span>
                  <span className="text-[8px] text-gray-600 font-mono">{Number(win.multiplier).toFixed(1)}x</span>
                </div>
              </div>
            ))}
          </div>

          {/* Similar Games */}
          {similarGames.length > 0 && (
            <div className="border-t border-white/5">
              <div className="p-3 pb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Benzer Oyunlar</span>
              </div>
              <div className="px-3 pb-3 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {similarGames.slice(0, 4).map(game => (
                  <Link key={game.id} href={`/game/${game.slug}`} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${game.image_url}')` }}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white truncate group-hover:text-[#16a34a] transition-colors">{game.title}</p>
                      <p className="text-[8px] text-gray-500">{game.provider}</p>
                    </div>
                    <Play className="w-3 h-3 text-gray-600 group-hover:text-[#16a34a] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-t border-white/5 bg-[#050505]">
             <button className="w-full bg-[#16a34a] text-black font-black py-2.5 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:scale-[1.02] transition-transform text-xs">
               BAKİYE YÜKLE
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
