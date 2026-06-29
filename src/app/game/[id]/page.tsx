"use client";

import { ArrowLeft, Maximize, RefreshCcw, User, Activity, History, ChevronUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function GameLauncher() {
  const params = useParams();
  const gameId = params.id as string;
  const [balance, setBalance] = useState("1450.00");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRealMoney, setIsRealMoney] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Mock Game URLs
  const getGameUrl = () => {
    if (gameId === "gates-of-olympus") {
      return "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&lang=tr&cur=USD";
    } else if (gameId === "sweet-bonanza") {
      return "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw&lang=tr&cur=USD";
    }
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

  return (
    <div className="h-screen w-screen bg-[#050505] flex flex-col overflow-hidden font-sans text-white">
      
      {/* Top Bar - Casino UI */}
      <div className="h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-50">
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
            <span className="bg-[#16a34a]/20 text-[#16a34a] border border-[#16a34a]/30 px-2 py-0.5 rounded text-[10px] font-bold">LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Mode Switcher */}
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
            <span className="text-sm font-black text-[#16a34a]">${balance}</span>
          </div>
          
          <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <User className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative w-full h-full bg-black flex flex-col md:flex-row">
        
        {/* Iframe Container */}
        <div className="flex-1 relative w-full h-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black">
          {/* Loading State Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <div className="w-16 h-16 border-4 border-[#16a34a]/20 border-t-[#16a34a] rounded-full animate-spin mb-4"></div>
            <span className="text-sm font-black tracking-widest text-gray-500 uppercase animate-pulse">BAĞLANTI KURULUYOR</span>
          </div>

          <iframe 
            src={getGameUrl()} 
            className="w-full h-full relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>

          {/* Floating Action Buttons */}
          <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-3">
            {!isRealMoney && (
              <div className="bg-amber-500/90 backdrop-blur text-black text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
                <AlertTriangle className="w-4 h-4" /> Eğlence Modu
              </div>
            )}
            <button 
              onClick={toggleFullscreen}
              className="w-12 h-12 bg-black/60 hover:bg-[#16a34a] backdrop-blur border border-white/10 rounded-full text-white hover:text-black flex items-center justify-center transition-all shadow-xl group ml-auto"
            >
              <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Live Stats & History (Desktop Only) */}
        <div className="w-80 bg-[#0a0a0a] border-l border-white/5 hidden xl:flex flex-col z-20">
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
                     <span className="text-[10px] text-[#16a34a] font-black">{bet.mult}</span>
                   </div>
                </div>
                <span className="text-sm font-black text-white">{bet.win}</span>
              </div>
            ))}
          </div>

          {/* Bottom Call to Action */}
          <div className="p-4 border-t border-white/5 bg-gradient-to-t from-[#050505] to-transparent">
             <button className="w-full bg-[#16a34a] text-black font-black py-3 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:scale-[1.02] transition-transform">
               BAKİYE YÜKLE
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
