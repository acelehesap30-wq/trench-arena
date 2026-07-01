"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CoinData {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const COINS = "bitcoin,ethereum,solana,binancecoin,tron,the-open-network,dogecoin,ripple";

export default function CryptoTicker() {
  const [coins, setCoins] = useState<CoinData[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setCoins(data);
        }
      } catch (err) {
        console.error("CoinGecko fetch error:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // 1 dk'da bir güncelle
    return () => clearInterval(interval);
  }, []);

  if (coins.length === 0) return null;

  const displayCoins = [...coins, ...coins, ...coins]; // Triple for seamless scroll

  return (
    <div className="w-full bg-[#0a0a0a]/80 backdrop-blur border-b border-white/5 overflow-hidden relative h-9 flex items-center">
      {/* Left Fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex gap-8 animate-[marquee_40s_linear_infinite] whitespace-nowrap">
        {displayCoins.map((coin, idx) => (
          <div key={`${coin.id}-${idx}`} className="flex items-center gap-2 text-xs shrink-0">
            <span className="font-bold text-gray-500 uppercase">{coin.symbol}</span>
            <span className="font-mono font-bold text-white">
              ${coin.current_price >= 1 ? coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : coin.current_price.toFixed(4)}
            </span>
            <span className={`flex items-center gap-0.5 font-mono font-bold text-[10px] ${
              coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {coin.price_change_percentage_24h >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Right Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}
