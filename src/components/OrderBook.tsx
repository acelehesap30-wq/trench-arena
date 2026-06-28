"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderLine {
  price: number;
  size: number;
  total: number;
  type: 'ask' | 'bid';
}

export default function OrderBook({ currentPrice }: { currentPrice: string | null }) {
  const [asks, setAsks] = useState<OrderLine[]>([]);
  const [bids, setBids] = useState<OrderLine[]>([]);

  useEffect(() => {
    if (!currentPrice) return;
    const price = parseFloat(currentPrice);

    const generateOrders = (type: 'ask' | 'bid') => {
      const orders = [];
      let total = 0;
      for (let i = 0; i < 15; i++) {
        const offset = (Math.random() * 0.5 + 0.1) * (i + 1);
        const p = type === 'ask' ? price + offset : price - offset;
        const s = Math.random() * 50 + 1;
        total += s;
        orders.push({ price: p, size: s, total, type });
      }
      return type === 'ask' ? orders.reverse() : orders;
    };

    const interval = setInterval(() => {
      setAsks(generateOrders('ask'));
      setBids(generateOrders('bid'));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <div className="w-full h-full flex flex-col font-mono text-[10px] sm:text-xs">
      <div className="flex justify-between text-gray-500 mb-2 px-2">
        <span>Fiyat (USD)</span>
        <span>Miktar (SOL)</span>
      </div>
      
      {/* Asks (Sells) */}
      <div className="flex-1 flex flex-col justify-end overflow-hidden">
        {asks.slice(-12).map((ask, i) => (
          <div key={`ask-${i}`} className="flex justify-between px-2 py-0.5 relative group cursor-pointer hover:bg-white/5">
            <div 
              className="absolute right-0 top-0 h-full bg-red-500/10 z-0" 
              style={{ width: `${Math.min(100, (ask.total / 500) * 100)}%` }} 
            />
            <span className="text-red-400 z-10">{ask.price.toFixed(3)}</span>
            <span className="text-gray-300 z-10">{ask.size.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      {/* Spread / Current Price */}
      <div className="my-2 py-2 border-y border-white/5 text-center bg-black/20">
        <span className="text-lg font-bold text-white tracking-widest">{currentPrice || "---"}</span>
      </div>

      {/* Bids (Buys) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {bids.slice(0, 12).map((bid, i) => (
          <div key={`bid-${i}`} className="flex justify-between px-2 py-0.5 relative group cursor-pointer hover:bg-white/5">
            <div 
              className="absolute right-0 top-0 h-full bg-green-500/10 z-0" 
              style={{ width: `${Math.min(100, (bid.total / 500) * 100)}%` }} 
            />
            <span className="text-green-400 z-10">{bid.price.toFixed(3)}</span>
            <span className="text-gray-300 z-10">{bid.size.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
