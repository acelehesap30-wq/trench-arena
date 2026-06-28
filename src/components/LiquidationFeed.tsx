"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Liquidation {
  id: string;
  wallet: string;
  amount: string;
  type: 'LONG' | 'SHORT';
  time: string;
}

export default function LiquidationFeed() {
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);

  useEffect(() => {
    // Generate fake live liquidations to create FOMO and atmosphere
    const interval = setInterval(() => {
      const isLong = Math.random() > 0.5;
      const amount = (Math.random() * 50 + 1).toFixed(2);
      const walletStr = `${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const newLiq: Liquidation = {
        id: Math.random().toString(36),
        wallet: walletStr,
        amount: amount,
        type: isLong ? 'LONG' : 'SHORT',
        time: new Date().toLocaleTimeString([], { hour12: false }),
      };

      setLiquidations(prev => [newLiq, ...prev].slice(0, 15)); // keep last 15
    }, Math.random() * 3000 + 1000); // 1 to 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center pb-2 mb-4 border-b border-white/5">
        <span className="text-xs font-mono text-gray-500 tracking-widest">NETWORK LIQUIDATIONS</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        <AnimatePresence>
          {liquidations.map((liq) => (
            <motion.div
              key={liq.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs font-mono"
            >
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">{liq.wallet}</span>
                <span className={`${liq.type === 'LONG' ? 'text-red-400' : 'text-green-400'}`}>
                  {liq.type} REKT
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-white font-bold">{liq.amount} SOL</span>
                <span className="text-gray-600 text-[10px]">{liq.time}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
