"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Activity, BarChart2, ShieldAlert, ChevronUp, ChevronDown, Filter, Info, Clock, DollarSign, X, CheckCircle2, ArrowRight, Flame } from "lucide-react";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

const GAMMA_API_URL = "https://gamma-api.polymarket.com/events?limit=50&active=true&closed=false&order=volume24hr&ascending=false";

export default function PolymarketPage() {
  const { session, balance } = useAuth();
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("TÜMÜ");
  
  // Trading Terminal State
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<any>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [isTrading, setIsTrading] = useState(false);

  const categories = ["TÜMÜ", "Politics", "Crypto", "Sports", "Pop Culture", "Business"];

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch(GAMMA_API_URL);
        const data = await response.json();
        
        const enriched = data.map((event: any) => {
          let parsedOutcomes: { name: string; price: number; history: number[] }[] = [];
          
          if (event.markets && event.markets.length > 0) {
            const market = event.markets[0];
            try {
              const outcomes = typeof market.outcomes === 'string' 
                ? JSON.parse(market.outcomes) 
                : market.outcomes;
              const prices = typeof market.outcomePrices === 'string'
                ? JSON.parse(market.outcomePrices)
                : market.outcomePrices;
              
              if (outcomes && prices) {
                parsedOutcomes = outcomes.map((name: string, i: number) => {
                   const currentPrice = parseFloat(prices[i]) || 0.01;
                   // Generate mock history for sparkline
                   const history = Array.from({length: 10}, () => Math.max(0.01, Math.min(0.99, currentPrice + (Math.random() * 0.1 - 0.05))));
                   history.push(currentPrice); // Ensure last is current
                   return {
                     name,
                     price: currentPrice,
                     history
                   };
                });
              }
            } catch {
              parsedOutcomes = [
                { name: 'Yes', price: 0.5, history: [0.5, 0.48, 0.52, 0.5] },
                { name: 'No', price: 0.5, history: [0.5, 0.52, 0.48, 0.5] },
              ];
            }
          }

          let category = "Other";
          const tags = event.tags || [];
          const title = event.title.toLowerCase();
          if (tags.includes("Politics") || title.includes("election") || title.includes("trump") || title.includes("biden")) category = "Politics";
          else if (tags.includes("Crypto") || title.includes("bitcoin") || title.includes("eth") || title.includes("crypto")) category = "Crypto";
          else if (tags.includes("Sports") || title.includes("nba") || title.includes("nfl") || title.includes("sports") || title.includes("f1") || title.includes("champion")) category = "Sports";
          else if (tags.includes("Pop Culture") || title.includes("movie") || title.includes("oscar")) category = "Pop Culture";
          else if (tags.includes("Business") || title.includes("fed") || title.includes("economy")) category = "Business";
          
          return { ...event, parsedOutcomes, category };
        });
        
        setMarkets(enriched);
      } catch (err) {
        console.error("Polymarket API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  const formatCurrency = (val: number | string | undefined) => {
    if (!val) return "$0";
    const num = Number(val);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const handleOpenTrade = (market: any, outcome: any) => {
    if (!session) {
      toast.error("İşlem yapmak için giriş yapmalısınız.");
      return;
    }
    setSelectedMarket(market);
    setSelectedOutcome(outcome);
    setTradeAmount(10);
  };

  const handleExecuteTrade = async () => {
    if (tradeAmount > balance) {
      toast.error("Yetersiz bakiye!");
      return;
    }
    
    setIsTrading(true);
    // Simulate API delay
    await new Promise(res => setTimeout(res, 1500));
    setIsTrading(false);
    toast.success(`${selectedOutcome.name} için $${tradeAmount} bahis alındı!`);
    setSelectedMarket(null);
  };

  const filteredMarkets = markets.filter(m => activeCategory === "TÜMÜ" || m.category === activeCategory);

  // Sparkline Component
  const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(' ');
    
    return (
      <svg viewBox="0 0 100 100" className="w-12 h-6 preserve-3d overflow-visible" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative overflow-x-hidden">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8 relative">
        
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Polymarket Hero Banner */}
        <div className="w-full h-[300px] rounded-[32px] mb-12 relative overflow-hidden flex items-center px-10 group border border-white/5 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#050505] to-[#050505]"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black mb-4 uppercase tracking-widest backdrop-blur">
              <Activity className="w-3 h-3" /> Gamma Protocol v2
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-2xl">
              GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">PREDICTION</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-lg mb-8 max-w-xl font-medium">
              Dünyanın en büyük olaylarına likidite sağlayın veya tahmin yapın. Şeffaf emir defteri, anlık fiyatlamalar ve limit emirleri ile profesyonel trade deneyimi.
            </p>
          </div>
        </div>

        {/* Categories & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2 w-full bg-[#0a0a0a] p-1.5 rounded-2xl border border-white/5 shadow-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                      : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat === 'TÜMÜ' ? 'MARKETS' : cat.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div className="hidden lg:flex items-center gap-6 bg-[#0a0a0a] px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex flex-col text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Markets</span>
                  <span className="text-white font-black font-mono text-sm">{filteredMarkets.length}</span>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="flex flex-col text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Vol</span>
                  <span className="text-green-400 font-black font-mono text-sm flex items-center gap-1"><TrendingUp className="w-3 h-3" /> $2.4B</span>
               </div>
            </div>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-32 text-center text-gray-500 font-mono flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
               <span className="tracking-widest text-xs font-bold animate-pulse">LIQUIDITY SYNCHRONIZATION...</span>
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 bg-[#0a0a0a] rounded-3xl border border-white/5">Pazar bulunamadı.</div>
          ) : filteredMarkets.map((market) => {
            const isHot = Number(market.volume) > 1000000;

            return (
            <div key={market.id} className={`bg-[#0a0a0a] rounded-3xl overflow-hidden transition-all duration-300 group flex flex-col relative ${isHot ? 'border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.05)]' : 'border border-white/5 shadow-xl hover:border-white/10'}`}>
              
              {/* Image Header */}
              {market.image && (
                <div className="h-40 w-full relative overflow-hidden bg-[#050505] shrink-0">
                  <img src={market.image} alt={market.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-300 border border-white/10 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    {market.category.toUpperCase()}
                  </div>
                  {isHot && (
                     <div className="absolute top-4 right-4 bg-orange-500/20 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
                       <Flame className="w-3 h-3" /> HOT
                     </div>
                  )}
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col bg-[#0a0a0a] relative z-10 -mt-4 rounded-t-3xl">
                <h3 className="text-base font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                  {market.title}
                </h3>
                
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Hacim</span>
                      <span className="text-white font-mono text-xs">{formatCurrency(market.volume)}</span>
                    </div>
                    <div className="w-px h-6 bg-white/5"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Likidite</span>
                      <span className="text-white font-mono text-xs">{formatCurrency(market.liquidity)}</span>
                    </div>
                </div>

                <div className="mt-auto space-y-3">
                  {market.parsedOutcomes && market.parsedOutcomes.length > 0 ? (
                    market.parsedOutcomes.slice(0, 3).map((outcome: any, idx: number) => {
                      const pct = Math.round(outcome.price * 100);
                      const isYes = outcome.name.toLowerCase() === 'yes';
                      const isNo = outcome.name.toLowerCase() === 'no';
                      
                      let colorClass = 'text-blue-400';
                      let bgClass = 'bg-blue-500/10 border-blue-500/20';
                      let barColor = 'bg-blue-500';
                      let sparkColor = '#3b82f6';
                      
                      if (isYes) {
                        colorClass = 'text-green-400';
                        bgClass = 'bg-green-500/10 border-green-500/20';
                        barColor = 'bg-green-500';
                        sparkColor = '#22c55e';
                      } else if (isNo) {
                        colorClass = 'text-red-400';
                        bgClass = 'bg-red-500/10 border-red-500/20';
                        barColor = 'bg-red-500';
                        sparkColor = '#ef4444';
                      }

                      return (
                        <div key={idx} className="relative w-full">
                          <button 
                            onClick={() => handleOpenTrade(market, outcome)}
                            className={`w-full ${bgClass} border rounded-xl p-3 flex flex-col transition-all hover:brightness-125 hover:-translate-y-0.5 active:translate-y-0`}
                          >
                            <div className="w-full flex items-center justify-between mb-2">
                              <span className="font-bold text-xs text-gray-200 truncate pr-2 max-w-[60%] text-left">{outcome.name}</span>
                              <div className="flex items-center gap-3">
                                 <Sparkline data={outcome.history} color={sparkColor} />
                                 <span className={`${colorClass} font-mono font-black text-sm`}>{pct}%</span>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                               <div className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-xs text-gray-500 py-4 font-mono border border-dashed border-white/10 rounded-xl">LIQUIDITY DEPLETED</div>
                  )}
                  {market.parsedOutcomes && market.parsedOutcomes.length > 3 && (
                    <div className="text-center text-[10px] text-gray-500 font-bold pt-2 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">
                      + {market.parsedOutcomes.length - 3} MORE OUTCOMES
                    </div>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Trade Terminal Drawer Overlay */}
      {selectedMarket && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedMarket(null)}></div>
          
          <div className="w-full max-w-md h-full bg-[#0a0a0a] border-l border-white/5 relative z-10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#050505]">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                     <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg tracking-tight">TRADE TERMINAL</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Gamma Protocol v2</p>
                  </div>
               </div>
               <button onClick={() => setSelectedMarket(null)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                 <X className="w-5 h-5 text-gray-400" />
               </button>
            </div>

            {/* Trade Info */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
               <div className="bg-[#14151a] p-5 rounded-2xl border border-white/5 mb-6">
                 <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold uppercase tracking-widest mb-3 inline-block">Market</span>
                 <p className="text-sm font-bold text-gray-300 leading-relaxed mb-4">{selectedMarket.title}</p>
                 
                 <div className="flex items-center justify-between p-3 bg-black/50 rounded-xl border border-white/5">
                   <span className="text-xs text-gray-500 font-bold uppercase">Seçiminiz:</span>
                   <span className="text-sm font-black text-white">{selectedOutcome.name}</span>
                 </div>
               </div>

               {/* Probability Info */}
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#14151a] p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Mevcut Olasılık</span>
                    <span className="text-2xl font-black text-blue-400 font-mono">{Math.round(selectedOutcome.price * 100)}%</span>
                  </div>
                  <div className="bg-[#14151a] p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Potansiyel Çarpan</span>
                    <span className="text-2xl font-black text-green-400 font-mono">{(1 / selectedOutcome.price).toFixed(2)}x</span>
                  </div>
               </div>

               {/* Slider Area */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Yatırım Tutarı (USD)</label>
                   <span className="text-sm font-black text-white font-mono">${tradeAmount}</span>
                 </div>
                 
                 <input 
                   type="range" 
                   min="1" 
                   max={Math.min(1000, balance > 0 ? balance : 1000)} 
                   value={tradeAmount} 
                   onChange={(e) => setTradeAmount(Number(e.target.value))}
                   className="w-full accent-blue-500 bg-white/10 h-2 rounded-lg appearance-none outline-none cursor-pointer"
                 />
                 
                 <div className="flex justify-between gap-2">
                   {[10, 50, 100, "MAX"].map((btn) => (
                     <button 
                       key={btn}
                       onClick={() => setTradeAmount(btn === "MAX" ? balance : Number(btn))}
                       className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-colors border border-white/5"
                     >
                       {btn === "MAX" ? btn : `$${btn}`}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Payout Calculation */}
               <div className="mt-8 bg-green-500/5 border border-green-500/20 p-5 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 font-bold uppercase">Potansiyel Kazanç</span>
                    <span className="text-lg font-black text-green-400 font-mono">${(tradeAmount * (1 / selectedOutcome.price)).toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">Bu işlem anlık likidite havuzu üzerinden simüle edilmektedir. Fiyat kayması (slippage) dahil değildir.</p>
               </div>
            </div>

            {/* Execute Button */}
            <div className="p-6 border-t border-white/5 bg-[#050505]">
              <div className="flex justify-between text-xs text-gray-500 mb-4 font-mono uppercase">
                 <span>Mevcut Bakiye</span>
                 <span>${balance.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleExecuteTrade}
                disabled={isTrading}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {isTrading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> ONAY BEKLENİYOR...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> İŞLEMİ ONAYLA</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
