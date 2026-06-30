"use client";

import { Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, Settings2, Wallet } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import usePythPrice from '@/hooks/usePythPrice';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

// Dinamik yüklenen bileşenler (SSR hatası vermemesi için)
const TradingViewChart = dynamic(() => import('@/components/TradingViewChart'), { ssr: false });
const OrderBook = dynamic(() => import('@/components/OrderBook'), { ssr: false });
const PositionsTable = dynamic(() => import('@/components/PositionsTable'), { ssr: false });
const LiquidationFeed = dynamic(() => import('@/components/LiquidationFeed'), { ssr: false });

export default function Web3TradingPage() {
  const { currentPrice, priceChange, loading: pythLoading } = usePythPrice();
  const { session, balance } = useAuth();
  
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Binance 24h Stats
  const [marketStats, setMarketStats] = useState({ volume: 0, changePercent: 0 });

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const res = await fetch('/api/binance/ticker?symbol=SOLUSDT');
        const data = await res.json();
        setMarketStats({
          volume: parseFloat(data.quoteVolume) || 0,
          changePercent: parseFloat(data.priceChangePercent) || 0
        });
      } catch (err) {
        console.error("Failed to fetch market stats:", err);
      }
    };
    
    fetchMarketStats();
    const interval = setInterval(fetchMarketStats, 10000); // 10s'de bir güncelle
    return () => clearInterval(interval);
  }, []);

  const handleTrade = async (type: 'LONG' | 'SHORT') => {
    if (!session) {
      toast.error("Lütfen giriş yapın.");
      return;
    }
    
    const tradeAmount = parseFloat(amount);
    if (!tradeAmount || tradeAmount <= 0) {
      toast.error("Geçerli bir miktar girin.");
      return;
    }

    if (tradeAmount > balance) {
      toast.error("Yetersiz bakiye.");
      return;
    }
    
    if (!currentPrice) {
      toast.error("Fiyat bekleniyor, lütfen bekleyin.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const entryPrice = parseFloat(currentPrice);
      
      const { error } = await supabase
        .from('trading_positions')
        .insert({
          user_id: session.user.id,
          type,
          asset: 'SOL/USD',
          size: tradeAmount, // Burada basitlik adına USD miktarını margin olarak kaydedip size'ı aynı alıyoruz (demo amaçlı)
          entry_price: entryPrice,
          leverage,
          status: 'OPEN'
        });

      if (error) throw error;
      
      toast.success(`${leverage}x ${type} pozisyonu başarıyla açıldı!`);
      setAmount("");
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatVolume = (vol: number) => {
    if (vol > 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol > 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col h-screen overflow-hidden">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[2560px] mx-auto overflow-hidden">
        
        {/* Sol Panel: OrderBook & Market Info */}
        <div className="w-full lg:w-80 border-r border-white/5 flex flex-col bg-[#0a0a0a] shrink-0">
          {/* Market Info */}
          <div className="p-4 border-b border-white/5 bg-[#050505]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center p-1.5 border border-white/10">
                  <img src="https://cryptologos.cc/logos/solana-sol-logo.svg?v=029" alt="SOL" className="w-full h-full" />
                </div>
                <div>
                  <h2 className="font-black text-lg leading-none">SOL-PERP</h2>
                  <a href="https://pyth.network" target="_blank" rel="noreferrer" className="text-[9px] text-[#b084e9] hover:underline font-bold">Pyth Network Oracle</a>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">MARKET FİYATI</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-mono font-black ${
                    priceChange === 'up' ? 'text-green-500' : priceChange === 'down' ? 'text-red-500' : 'text-white'
                  }`}>
                    {currentPrice ? `$${currentPrice}` : '---.--'}
                  </span>
                  {priceChange === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                  {priceChange === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">24S DEĞİŞİM</p>
                <span className={`text-sm font-mono font-bold ${marketStats.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketStats.changePercent >= 0 ? '+' : ''}{marketStats.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-2 border-b border-white/5 flex justify-between text-[10px] font-bold text-gray-500">
            <span>24H HACİM: <span className="text-white">{formatVolume(marketStats.volume)}</span></span>
            <span>FONLAMA: <span className="text-yellow-500">0.01%</span></span>
          </div>

          <div className="flex-1 overflow-hidden">
            <OrderBook currentPrice={currentPrice} />
          </div>
        </div>

        {/* Orta Panel: Grafik ve Pozisyonlar */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 border-b border-white/5 relative bg-[#050505]">
            <TradingViewChart currentPrice={currentPrice} />
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <span className="bg-white/10 backdrop-blur px-2 py-1 rounded text-xs font-mono text-gray-400 border border-white/5 shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> CANLI VERİ BAĞLANTISI (BINANCE API)
              </span>
            </div>
          </div>
          
          <div className="h-64 bg-[#0a0a0a]">
            <PositionsTable currentPrice={currentPrice} />
          </div>
        </div>

        {/* Sağ Panel: İşlem Paneli & Likidasyon */}
        <div className="w-full lg:w-80 border-l border-white/5 flex flex-col bg-[#0a0a0a] shrink-0">
          {/* İşlem Formu */}
          <div className="p-4 border-b border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-sm tracking-widest text-gray-400">İŞLEM AÇ</h3>
              <button className="text-gray-500 hover:text-white transition-colors"><Settings2 className="w-4 h-4" /></button>
            </div>

            <div className="flex gap-2 mb-6">
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded transition-colors text-xs border border-white/5">Limit</button>
              <button className="flex-1 bg-[#16a34a] text-black font-bold py-2 rounded transition-colors text-xs shadow-[0_0_15px_rgba(22,163,74,0.3)] border border-[#16a34a]">Piyasa</button>
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded transition-colors text-xs border border-white/5">Stop</button>
            </div>

            {/* Kaldıraç Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>Kaldıraç</span>
                <span className="text-white bg-white/10 px-2 py-0.5 rounded">{leverage}x</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={leverage} 
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full accent-[#16a34a] h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1 font-mono">
                <span>1x</span><span>25x</span><span>50x</span><span>75x</span><span>100x</span>
              </div>
            </div>

            {/* Miktar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>Miktar</span>
                <span className="flex items-center gap-1 text-[#16a34a]">
                  <Wallet className="w-3 h-3" /> ${balance.toFixed(2)}
                </span>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 pr-16 text-white text-right font-mono focus:outline-none focus:border-[#16a34a] transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">SOL</span>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setAmount((balance/2).toFixed(2))} className="text-[10px] bg-white/10 px-1.5 py-1 rounded text-white hover:bg-white/20">50%</button>
                  <button onClick={() => setAmount(balance.toFixed(2))} className="text-[10px] bg-white/10 px-1.5 py-1 rounded text-white hover:bg-white/20">MAX</button>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleTrade('LONG')}
                disabled={isSubmitting || !session}
                className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
              >
                LONG<br/><span className="text-[10px] opacity-70 block -mt-1 font-mono">{currentPrice ? `$${currentPrice}` : 'Yükleniyor'}</span>
              </button>
              <button 
                onClick={() => handleTrade('SHORT')}
                disabled={isSubmitting || !session}
                className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
              >
                SHORT<br/><span className="text-[10px] opacity-70 block -mt-1 font-mono">{currentPrice ? `$${currentPrice}` : 'Yükleniyor'}</span>
              </button>
            </div>
            
            {!session && (
              <p className="text-center text-xs text-red-500 mt-4 font-bold border border-red-500/20 bg-red-500/5 p-2 rounded">İşlem yapmak için giriş yapmalısınız.</p>
            )}
          </div>

          <div className="flex-1 overflow-hidden bg-[#050505]">
            <LiquidationFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
