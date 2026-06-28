"use client";

import { ArrowLeft, Maximize, RefreshCcw, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function GameLauncher() {
  const params = useParams();
  const gameId = params.id as string;
  const [balance, setBalance] = useState("1450.00");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock Game Logic. İleride Casino API entegre edilecek.
  const getGameUrl = () => {
    // Şimdilik demo oyun sayfalarını veya placeholder koyuyoruz.
    // Gerçek API alındığında iframe'e gerçek token'lı url beslenecek.
    if (gameId === "gates-of-olympus") {
      return "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&lang=tr&cur=USD";
    } else if (gameId === "sweet-bonanza") {
      return "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw&lang=tr&cur=USD";
    }
    return "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&lang=tr&cur=USD"; // Default
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
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden font-sans text-white">
      
      {/* Top Bar - Casino UI */}
      <div className="h-14 bg-[#14151a] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wide">LOBİYE DÖN</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Bakiye</span>
            <span className="text-sm font-bold text-[#16a34a]">${balance}</span>
          </div>
          <button className="bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors">
            <User className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative w-full h-full bg-black flex items-center justify-center">
        {/* Loading Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <RefreshCcw className="w-8 h-8 text-[#16a34a] animate-spin mb-4" />
          <span className="text-sm font-bold tracking-widest text-gray-500 uppercase">OYUN BAŞLATILIYOR...</span>
        </div>

        {/* Gerçek Casino API Iframe'i */}
        <iframe 
          src={getGameUrl()} 
          className="w-full h-full relative z-10"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        ></iframe>

        {/* Floating Controls */}
        <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-black/50 hover:bg-black/80 backdrop-blur border border-white/10 rounded-full text-white transition-all shadow-xl group"
          >
            <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
}
