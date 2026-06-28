"use client";

import dynamic from 'next/dynamic';
import { Activity, Zap, ShieldAlert, Crosshair } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function Home() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar Animation
      gsap.fromTo("nav", 
        { y: -30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
      
      // Hero Text Animation
      gsap.fromTo(".hero-text", 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" }
      );

      // Game Cards Stagger Animation
      gsap.fromTo(".game-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.6, ease: "back.out(1.7)" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen flex flex-col relative overflow-hidden">
      
      <nav className="w-full glass-panel border-b-0 border-x-0 rounded-none px-8 py-4 flex justify-between items-center z-10 opacity-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-white">TRENCH</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm text-gray-400 font-medium tracking-wide">
            <span className="hover:text-white cursor-pointer transition-colors">THE HOUSE</span>
            <span className="hover:text-white cursor-pointer transition-colors">COPY-BET</span>
            <span className="hover:text-white cursor-pointer transition-colors">INSURANCE</span>
          </div>
          <WalletMultiButtonDynamic />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-7xl mx-auto mt-10">
        <div className="hero-text text-center mb-16 space-y-4 opacity-0">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white/90">
            SENTETİK PİYASA ARENASI
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Sıradan kumarbazlar için değil. Volatiliteyi fırsata çeviren Diamond Hands yatırımcıları için tasarlanmış provably fair Web3 ekosistemi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          
          <div className="game-card opacity-0 glass-panel p-6 rounded-2xl group cursor-pointer hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2">
            <Crosshair className="w-8 h-8 text-blue-500 mb-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Deep Needle</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              %99 çöküş anlarında asimetrik risk alın. Saniyelik iğne hareketlerini avlayın.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-blue-400 font-mono">LIVE / SOL-USD</span>
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
            </div>
          </div>

          <div className="game-card opacity-0 glass-panel p-6 rounded-2xl group cursor-pointer hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2">
            <Activity className="w-8 h-8 text-red-500 mb-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Dead Cat Bounce</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Düşüş trendindeki sahte tepki yükselişlerinden çöküş öncesi kâr alarak kaçın.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-red-400 font-mono">HIGH VOLATILITY</span>
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
            </div>
          </div>

          <div className="game-card opacity-0 glass-panel p-6 rounded-2xl group cursor-pointer hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2">
            <Zap className="w-8 h-8 text-amber-500 mb-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">DCA Strateji Masası</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tek seferde riske girmeyin. Otonom akıllı kontrat ile kademeli destek bahsi yapın.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-amber-400 font-mono">AUTONOMOUS</span>
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
            </div>
          </div>

          <div className="game-card opacity-0 glass-panel p-6 rounded-2xl group cursor-pointer hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2">
            <ShieldAlert className="w-8 h-8 text-purple-500 mb-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Tarihi Makro-Arena</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Geçmiş FED kararlarındaki devasa mumları simüle edin. İrade havuzuna katılın.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-purple-400 font-mono">SIMULATION</span>
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]"></div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
