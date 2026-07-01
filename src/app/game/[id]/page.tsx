"use client";

import { ArrowLeft, Maximize, User, Activity, AlertTriangle, Lightbulb, LightbulbOff, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function GameLauncher() {
  const params = useParams();
  const gameId = params.id as string;
  const { session, balance: realBalance } = useAuth();
  
  const [balance, setBalance] = useState("0.00");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRealMoney, setIsRealMoney] = useState(true);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isRealMoney) {
      setBalance(realBalance.toFixed(2));
    } else {
      setBalance("100000.00"); // Demo balance
    }
  }, [isRealMoney, realBalance]);

  // Pragmatic Play / Evolution Game Mappings
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
    
    // For non-Pragmatic games, fallback
    return "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&lang=tr&cur=USD";
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
    // Simulate loading to trigger cinematic effects properly
    setTimeout(() => setIsLoaded(true), 1500);
  }, []);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans text-white transition-colors duration-1000 ${isCinematicMode ? 'bg-black' : 'bg-[#050505]'}`}>
      
      {/* Top Bar - Casino UI */}
      <div className={`h-16 flex items-center justify-between px-6 shrink-0 z-50 transition-all duration-700 ${isCinematicMode ? 'opacity-0 hover:opacity-100 absolute w-full top-0 bg-black/80 backdrop-blur' : 'bg-[#0a0a0a] border-b border-white/5 relative'}`}>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#16a34a] group-hover:text-black transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wide hidden sm:block">LOBİYE DÖN</span>
          </Link>
          
          <div className="h-6 w-px bg-white/10"></div>
          
          <div className="flex items-center gap-3">
            <span className="text-white font-black uppercase tracking-widest text-sm">{gameId.replace(/-/g, ' ')}</span>
            {isCinematicMode && <Sparkles className="w-4 h-4 text-[#16a34a] animate-pulse" />}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex bg-white/5 rounded-lg p-1">
             <button 
                onClick={() => setIsRealMoney(false)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!isRealMoney ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-white'}`}
             >
                DEMO
             </button>
             <button 
                onClick={() => setIsRealMoney(true)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${isRealMoney ? 'bg-[#16a34a] text-black shadow-[0_0_10px_rgba(22,163,74,0.3)]' : 'text-gray-500 hover:text-white'}`}
             >
                GERÇEK PARA
             </button>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Bakiye</span>
            <span className="text-sm font-black text-[#16a34a] font-mono">${balance}</span>
          </div>
          
          <Link href="/profile" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <User className="w-5 h-5 text-gray-300" />
          </Link>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative w-full h-full flex flex-col md:flex-row">
        
        {/* Iframe Container */}
        <div className={`flex-1 relative w-full h-full flex items-center justify-center transition-all duration-1000 ${isCinematicMode ? 'bg-black' : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black'}`}>
          
          {/* Cinematic Ambilight Glow */}
          {isCinematicMode && isLoaded && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
               <div className="w-[80%] h-[80%] bg-[#16a34a]/10 rounded-[100px] blur-[150px] animate-pulse"></div>
            </div>
          )}

          {/* Loading State Overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-500">
              <div className="w-16 h-16 border-4 border-[#16a34a]/20 border-t-[#16a34a] rounded-full animate-spin mb-4"></div>
              <span className="text-sm font-black tracking-widest text-[#16a34a] uppercase drop-shadow-[0_0_10px_rgba(22,163,74,0.8)]">ESTABLISHING SECURE CONNECTION</span>
            </div>
          )}

          <iframe 
            src={getGameUrl()} 
            className={`w-full h-full relative z-10 transition-all duration-1000 ${isCinematicMode ? 'scale-[0.98] shadow-[0_0_100px_rgba(22,163,74,0.15)] rounded-2xl' : 'shadow-[0_0_50px_rgba(0,0,0,0.5)]'}`}
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>

          {/* Floating Action Buttons */}
          <div className="absolute right-4 bottom-4 z-30 flex flex-col gap-3 items-end">
            {!isRealMoney && (
              <div className="bg-amber-500/90 backdrop-blur text-black text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
                <AlertTriangle className="w-4 h-4" /> Eğlence Modu
              </div>
            )}
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsCinematicMode(!isCinematicMode)}
                className={`w-12 h-12 backdrop-blur border rounded-full flex items-center justify-center transition-all shadow-xl group ${isCinematicMode ? 'bg-[#16a34a] text-black border-[#16a34a] shadow-[0_0_20px_rgba(22,163,74,0.4)]' : 'bg-black/60 text-white hover:text-[#16a34a] border-white/10'}`}
                title="Cinematic Mode"
              >
                {isCinematicMode ? <LightbulbOff className="w-5 h-5" /> : <Lightbulb className="w-5 h-5 group-hover:scale-110 transition-transform" />}
              </button>
              
              <button 
                onClick={toggleFullscreen}
                className="w-12 h-12 bg-black/60 hover:bg-[#16a34a] backdrop-blur border border-white/10 rounded-full text-white hover:text-black flex items-center justify-center transition-all shadow-xl group"
                title="Fullscreen"
              >
                <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Live Stats (Desktop Only) - Hides in Cinematic Mode */}
        <div className={`w-80 bg-[#0a0a0a] border-l border-white/5 hidden xl:flex flex-col z-20 transition-all duration-700 ${isCinematicMode ? 'translate-x-full absolute right-0 h-full opacity-0 pointer-events-none' : 'translate-x-0 relative opacity-100'}`}>
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#050505]">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16a34a]" /> Canlı Akış
            </span>
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {[
              { user: "crypto_king", mult: "25.5x", win: "$125.50" },
              { user: "sol_whale", mult: "2.0x", win: "$10.00" },
              { user: "degen99", mult: "100.0x", win: "$500.00" },
              { user: "lucky_boi", mult: "1.5x", win: "$7.50" },
              { user: "trench_god", mult: "50.0x", win: "$250.00" },
              { user: "ape_life", mult: "12.0x", win: "$60.00" },
            ].map((bet, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-[#16a34a]/30 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-white/10">
                     <User className="w-4 h-4 text-gray-500" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-gray-300">{bet.user}</span>
                     <span className="text-[10px] text-[#16a34a] font-black font-mono">{bet.mult}</span>
                   </div>
                </div>
                <span className="text-sm font-black text-white font-mono">{bet.win}</span>
              </div>
            ))}
          </div>

          {/* Bottom Call to Action */}
          <div className="p-4 border-t border-white/5 bg-[#050505]">
             <button className="w-full bg-[#16a34a] text-black font-black py-3 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
               BAKİYE YÜKLE
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
