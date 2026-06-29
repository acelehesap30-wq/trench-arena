"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Search, Star, Filter, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic imports for charts to avoid SSR issues
const TradingViewChart = dynamic(() => import("@/components/TradingViewChart"), { ssr: false });
const OrderBook = dynamic(() => import("@/components/OrderBook"), { ssr: false });
const PositionsTable = dynamic(() => import("@/components/PositionsTable"), { ssr: false });

export default function Web3TradingPage() {
  const [currentPrice, setCurrentPrice] = useState<string>("0.00");
  const [activeMarket, setActiveMarket] = useState("SOL/USD");
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");

  // Connect to Pyth Network for Live SOL/USD Price
  useEffect(() => {
    let connection: any = null;
    let isMounted = true;

    const connectPyth = async () => {
      try {
        const { PriceServiceConnection } = await import("@pythnetwork/price-service-client");
        connection = new PriceServiceConnection("https://hermes.pyth.network");
        const solUsdId = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"; // SOL/USD Price ID

        await connection.subscribePriceFeedUpdates([solUsdId], (priceFeed: any) => {
          if (!isMounted) return;
          const price = priceFeed.getPriceUnchecked();
          if (price) {
            const actualPrice = Number(price.price) * Math.pow(10, price.expo);
            setCurrentPrice(actualPrice.toFixed(3));
          }
        });
      } catch (err) {
        console.error("Pyth Network Error:", err);
      }
    };

    connectPyth();

    return () => {
      isMounted = false;
      if (connection) {
        connection.closeWebSocket();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col h-screen overflow-hidden">
      
      {/* Top Header - Trading Specific */}
      <header className="h-16 glass-premium border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
            TRENCH<span className="text-[#16a34a]">BET</span>
          </Link>
          <div className="h-6 w-px bg-white/10 hidden md:block"></div>
          
          {/* Market Info */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
              <Star className="w-4 h-4 text-gray-500" />
              <span className="font-black text-lg">{activeMarket}</span>
            </button>
            <div className="flex flex-col">
              <span className={`text-sm font-black ${parseFloat(currentPrice) > 145 ? 'text-[#16a34a]' : 'text-red-500'}`}>
                ${currentPrice}
              </span>
              <span className="text-[10px] text-gray-500 font-bold">$24.5M Vol</span>
            </div>
            <div className="hidden md:flex flex-col ml-4">
              <span className="text-[10px] text-gray-500 font-bold uppercase">24h Değişim</span>
              <span className="text-xs font-black text-[#16a34a] flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +5.24%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all border border-white/10">
            CÜZDAN BAĞLA
          </button>
        </div>
      </header>

      {/* Main Trading Layout */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* Left/Center Column: Chart & Positions */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
          {/* Chart Section */}
          <div className="h-[60%] border-b border-white/5 relative bg-[#0a0a0a]">
             {/* Chart Controls */}
             <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur border border-white/5 p-1 rounded-lg">
                {['1m', '5m', '15m', '1H', '4H', '1D'].map(time => (
                  <button key={time} className="text-xs font-bold px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors">
                    {time}
                  </button>
                ))}
             </div>
             <TradingViewChart currentPrice={currentPrice} />
          </div>
          
          {/* Positions Section */}
          <div className="flex-1 bg-[#0a0a0a] overflow-hidden flex flex-col">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 bg-[#050505]">
               <button className="text-sm font-black text-white border-b-2 border-[#16a34a] pb-1">POZİSYONLAR (2)</button>
               <button className="text-sm font-bold text-gray-500 hover:text-white transition-colors pb-1">AÇIK EMİRLER (0)</button>
               <button className="text-sm font-bold text-gray-500 hover:text-white transition-colors pb-1">GEÇMİŞ</button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <PositionsTable currentPrice={currentPrice} />
            </div>
          </div>
        </div>

        {/* Right Column: OrderBook & Order Entry */}
        <div className="w-full xl:w-[320px] flex flex-col shrink-0 bg-[#0a0a0a]">
          
          {/* Order Entry Form */}
          <div className="p-4 border-b border-white/5 bg-[#050505]">
            <div className="flex bg-white/5 rounded-lg p-1 mb-4">
              <button 
                onClick={() => setOrderType("BUY")}
                className={`flex-1 py-2 text-sm font-black rounded-md transition-all ${orderType === 'BUY' ? 'bg-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'text-gray-400 hover:text-white'}`}
              >
                AL (LONG)
              </button>
              <button 
                onClick={() => setOrderType("SELL")}
                className={`flex-1 py-2 text-sm font-black rounded-md transition-all ${orderType === 'SELL' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-400 hover:text-white'}`}
              >
                SAT (SHORT)
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Fiyat (USD)</label>
                <div className="relative mt-1">
                  <input type="text" value={currentPrice} readOnly className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white font-mono text-sm focus:outline-none" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">USD</span>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">
                  <span>Miktar (SOL)</span>
                  <span className="text-[#16a34a]">Max: 24.5 SOL</span>
                </label>
                <div className="relative mt-1">
                  <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 focus:border-[#16a34a] rounded-lg py-2.5 px-3 text-white font-mono text-sm focus:outline-none transition-colors" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button className="bg-white/10 hover:bg-white/20 text-xs font-bold px-2 py-0.5 rounded text-gray-300">YARISI</button>
                    <button className="bg-white/10 hover:bg-white/20 text-xs font-bold px-2 py-0.5 rounded text-gray-300">MAX</button>
                  </div>
                </div>
              </div>

              {/* Leverage Slider Mock */}
              <div className="pt-2">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-2">
                  <span>Kaldıraç</span>
                  <span className="text-white">10x</span>
                </div>
                <input type="range" min="1" max="100" defaultValue="10" className="w-full accent-[#16a34a] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1 font-mono">
                  <span>1x</span>
                  <span>50x</span>
                  <span>100x</span>
                </div>
              </div>

              <button className={`w-full py-3.5 rounded-lg font-black text-sm uppercase tracking-widest mt-4 transition-all ${orderType === 'BUY' ? 'bg-[#16a34a] hover:bg-[#15803d] text-black shadow-[0_0_20px_rgba(22,163,74,0.4)]' : 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}>
                {orderType === 'BUY' ? 'LONG POZİSYON AÇ' : 'SHORT POZİSYON AÇ'}
              </button>
            </div>
          </div>

          {/* OrderBook Section */}
          <div className="flex-1 flex flex-col p-2 min-h-0">
             <div className="flex items-center gap-2 mb-2 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
               <Activity className="w-3 h-3" /> Emir Defteri
             </div>
             <div className="flex-1 overflow-hidden">
               <OrderBook currentPrice={currentPrice} />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
