"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Activity, BarChart2, ShieldAlert, ChevronUp, ChevronDown, Filter, Info, Clock, DollarSign } from "lucide-react";
import Header from "@/components/Header";

// Polymarket Gamma API - fetch real event data with outcomes
const GAMMA_API_URL = "https://gamma-api.polymarket.com/events?limit=50&active=true&closed=false&order=volume24hr&ascending=false";

export default function PolymarketPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("TÜMÜ");

  const categories = ["TÜMÜ", "Politics", "Crypto", "Sports", "Pop Culture", "Business"];

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch(GAMMA_API_URL);
        const data = await response.json();
        
        // Parse real outcome prices from the API
        const enriched = data.map((event: any) => {
          let parsedOutcomes: { name: string; price: number }[] = [];
          
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
                parsedOutcomes = outcomes.map((name: string, i: number) => ({
                  name,
                  price: parseFloat(prices[i]) || 0.5,
                }));
              }
            } catch {
              // If parsing fails, use defaults
              parsedOutcomes = [
                { name: 'Yes', price: 0.5 },
                { name: 'No', price: 0.5 },
              ];
            }
          }

          // Category mapping based on tags
          let category = "Other";
          const tags = event.tags || [];
          const title = event.title.toLowerCase();
          if (tags.includes("Politics") || title.includes("election") || title.includes("trump") || title.includes("biden")) category = "Politics";
          else if (tags.includes("Crypto") || title.includes("bitcoin") || title.includes("eth") || title.includes("crypto")) category = "Crypto";
          else if (tags.includes("Sports") || title.includes("nba") || title.includes("nfl") || title.includes("sports")) category = "Sports";
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

  const filteredMarkets = markets.filter(m => activeCategory === "TÜMÜ" || m.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8">
        
        {/* Polymarket Hero Banner */}
        <div className="w-full h-[300px] rounded-[32px] mb-12 relative overflow-hidden flex items-center px-10 group border border-blue-500/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-[#050505] to-[#050505]"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black mb-4 uppercase tracking-widest">
              <Activity className="w-3 h-3" /> Polymarket Gamma Entegrasyonu
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              KÜRESEL <span className="text-blue-500">TAHMİN PAZARI</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-lg mb-8 max-w-xl">
              Dünyanın en büyük tahmin pazarındaki gerçek olaylara bahis yap. Gamma API üzerinden anlık oranlar, %100 şeffaf veriler ve derin likidite.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-3 w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat === 'TÜMÜ' ? 'TÜM PAZARLAR' : cat}
                </button>
              ))}
            </div>
            
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-gray-400 whitespace-nowrap">
              <BarChart2 className="w-4 h-4 text-blue-500" /> TOPLAM PAZAR: <span className="text-white">{filteredMarkets.length}</span>
            </div>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-500 font-mono flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               VERİLER ÇEKİLİYOR...
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500">Bu kategoride aktif pazar bulunamadı.</div>
          ) : filteredMarkets.map((market) => (
            <div key={market.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group flex flex-col shadow-xl">
              {/* Image Header */}
              {market.image && (
                <div className="h-48 w-full relative overflow-hidden bg-white/5 shrink-0">
                  <img src={market.image} alt={market.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-blue-400 border border-blue-500/20">
                    {market.category}
                  </div>
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-3 leading-tight group-hover:text-blue-400 transition-colors">
                  {market.title}
                </h3>
                
                {market.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                    {market.description.replace(/<[^>]*>?/gm, '')}
                  </p>
                )}

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4 text-[11px] font-mono border-y border-white/5 py-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <DollarSign className="w-3.5 h-3.5 text-green-500" />
                      <span>HACİM:</span>
                      <span className="text-white font-bold">{formatCurrency(market.volume)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>LİKİDİTE:</span>
                      <span className="text-white font-bold">{formatCurrency(market.liquidity)}</span>
                    </div>
                  </div>

                  {/* Real Outcomes with actual prices */}
                  {market.parsedOutcomes && market.parsedOutcomes.length > 0 ? (
                    <div className="space-y-2">
                      {market.parsedOutcomes.slice(0, 3).map((outcome: { name: string; price: number }, idx: number) => {
                        const pct = Math.round(outcome.price * 100);
                        const isYes = outcome.name.toLowerCase() === 'yes';
                        const isNo = outcome.name.toLowerCase() === 'no';
                        let colorClass = 'text-blue-400';
                        let bgClass = 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20';
                        let Icon = Info;
                        
                        if (isYes) {
                          colorClass = 'text-green-400';
                          bgClass = 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20';
                          Icon = ChevronUp;
                        } else if (isNo) {
                          colorClass = 'text-red-400';
                          bgClass = 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20';
                          Icon = ChevronDown;
                        }
                        
                        return (
                          <button key={idx} className={`w-full ${bgClass} border rounded-xl p-3 flex items-center justify-between transition-all group/btn`}>
                            <div className="flex items-center gap-2 max-w-[60%]">
                              <Icon className={`w-4 h-4 ${colorClass} shrink-0`} />
                              <span className="font-bold text-xs text-gray-200 group-hover/btn:text-white truncate">{outcome.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-gray-500 font-mono">{pct > 0 ? (100/pct).toFixed(2) : '0.00'}x</span>
                              <span className={`${colorClass} font-mono font-black text-sm`}>{pct}%</span>
                            </div>
                          </button>
                        );
                      })}
                      {market.parsedOutcomes.length > 3 && (
                        <div className="text-center text-[10px] text-gray-500 font-bold pt-1">
                          +{market.parsedOutcomes.length - 3} SEÇENEK DAHA
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-gray-500 py-4">Seçenekler yüklenemedi</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
