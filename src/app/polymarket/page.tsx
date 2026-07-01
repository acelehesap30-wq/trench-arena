"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Activity, BarChart2, ShieldAlert, ChevronUp, ChevronDown } from "lucide-react";
import Header from "@/components/Header";

// Polymarket Gamma API - fetch real event data with outcomes
const GAMMA_API_URL = "https://gamma-api.polymarket.com/events?limit=20&active=true&closed=false&order=volume24hr&ascending=false";

export default function PolymarketPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          
          return { ...event, parsedOutcomes };
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

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8">
        
        {/* Polymarket Hero Banner */}
        <div className="w-full h-[250px] rounded-3xl mb-12 relative overflow-hidden flex items-center px-10 group border border-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-[#050505] to-[#050505]"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 py-1 px-3 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black mb-4 uppercase tracking-widest">
              <Activity className="w-3 h-3" /> Polymarket Entegrasyonu
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
              POLYMARKET <span className="text-blue-500">TAHMİN PAZARI</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base mb-8 max-w-xl">
              Dünyanın en büyük tahmin pazarındaki gerçek olaylara bahis yap. Gamma API üzerinden anlık, şeffaf veriler.
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
          <div>
            <h4 className="text-blue-400 font-bold mb-1">Canlı Polymarket Verileri</h4>
            <p className="text-sm text-gray-300">
              Aşağıdaki oranlar ve hacimler doğrudan Polymarket Gamma API'den gerçek zamanlı olarak çekilmektedir.
            </p>
          </div>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-500 font-mono">VERİLER ÇEKİLİYOR...</div>
          ) : markets.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500">Aktif pazar bulunamadı.</div>
          ) : markets.map((market) => (
            <div key={market.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group">
              {/* Image Header */}
              {market.image && (
                <div className="h-40 w-full relative overflow-hidden bg-white/5">
                  <img src={market.image} alt={market.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 leading-tight">
                  {market.title}
                </h3>

                <div className="flex items-center justify-between mb-6 text-xs font-mono border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BarChart2 className="w-4 h-4 text-blue-500" />
                    <span>HACİM:</span>
                    <span className="text-white font-bold">{formatCurrency(market.volume)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>AKTİF</span>
                  </div>
                </div>

                {/* Real Outcomes with actual prices */}
                {market.parsedOutcomes && market.parsedOutcomes.length > 0 ? (
                  <div className="space-y-3">
                    {market.parsedOutcomes.map((outcome: { name: string; price: number }, idx: number) => {
                      const pct = Math.round(outcome.price * 100);
                      const isYes = outcome.name.toLowerCase() === 'yes';
                      const colorClass = isYes ? 'text-green-400' : 'text-red-400';
                      const bgClass = isYes ? 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/40' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/40';
                      
                      return (
                        <button key={idx} className={`w-full ${bgClass} border rounded-xl p-4 flex items-center justify-between transition-all group/btn`}>
                          <div className="flex items-center gap-2">
                            {isYes ? <ChevronUp className="w-4 h-4 text-green-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />}
                            <span className="font-bold text-sm text-gray-200 group-hover/btn:text-white">{outcome.name}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`${colorClass} font-mono font-black text-lg`}>{pct}%</span>
                            <span className="text-[10px] text-gray-600 font-mono">{pct > 0 ? (100/pct).toFixed(2) : '0.00'}x</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 py-4">Seçenekler yüklenemedi</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
