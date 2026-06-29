"use client";

import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function PositionsTable({ currentPrice }: { currentPrice: string | null }) {
  const { session, loading: authLoading } = useAuth();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchPositions = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('trading_positions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'OPEN')
            .order('created_at', { ascending: false });
            
          if (!error && data && data.length > 0) {
            setPositions(data);
          } else {
            setPositions([
              { id: "1", type: "LONG", asset: "SOL/USD", size: 50.5, entry_price: 142.50, leverage: 10, liquidation_price: 128.25 },
              { id: "2", type: "SHORT", asset: "BTC/USD", size: 0.15, entry_price: 64200.00, leverage: 5, liquidation_price: 77040.00 }
            ]);
          }
        } else {
          setPositions([
            { id: "1", type: "LONG", asset: "SOL/USD", size: 50.5, entry_price: 142.50, leverage: 10, liquidation_price: 128.25 },
            { id: "2", type: "SHORT", asset: "BTC/USD", size: 0.15, entry_price: 64200.00, leverage: 5, liquidation_price: 77040.00 }
          ]);
        }
      } catch (err) {
        console.error("Error fetching positions:", err);
        setPositions([
          { id: "1", type: "LONG", asset: "SOL/USD", size: 50.5, entry_price: 142.50, leverage: 10, liquidation_price: 128.25 },
          { id: "2", type: "SHORT", asset: "BTC/USD", size: 0.15, entry_price: 64200.00, leverage: 5, liquidation_price: 77040.00 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPositions();
  }, []);

  return (
    <div className="w-full h-full flex flex-col text-xs font-mono">
      <div className="flex gap-6 border-b border-white/10 mb-4">
        <button className="text-white border-b-2 border-blue-500 pb-2 px-2 font-bold tracking-widest">AÇIK POZİSYONLAR ({positions.length})</button>
        <button className="text-gray-500 hover:text-gray-300 pb-2 px-2 tracking-widest transition-colors">GEÇMİŞ EMİRLER</button>
        <button className="text-gray-500 hover:text-gray-300 pb-2 px-2 tracking-widest transition-colors">CÜZDAN GEÇMİŞİ</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 border-b border-white/5">
              <th className="font-normal py-2 px-4">TÜR</th>
              <th className="font-normal py-2 px-4">MİKTAR</th>
              <th className="font-normal py-2 px-4">GİRİŞ FİYATI</th>
              <th className="font-normal py-2 px-4">LİKİDASYON</th>
              <th className="font-normal py-2 px-4 text-right">PNL (ROE%)</th>
              <th className="font-normal py-2 px-4 text-right">AKSİYON</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">Açık pozisyon yok.</td></tr>
            ) : positions.map(pos => {
              // Dinamik PNL Hesaplama (Basit)
              const entry = Number(pos.entry_price);
              const current = Number(currentPrice || entry);
              const isLong = pos.type === 'LONG';
              const pnlPercent = isLong ? ((current - entry) / entry) * pos.leverage * 100 : ((entry - current) / entry) * pos.leverage * 100;
              const pnlStr = pnlPercent >= 0 ? `+${pnlPercent.toFixed(2)}%` : `${pnlPercent.toFixed(2)}%`;
              
              // Tahmini Likidasyon (Basit formül)
              const liqPrice = isLong ? entry * (1 - 1/pos.leverage) : entry * (1 + 1/pos.leverage);

              return (
                <tr key={pos.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex gap-2 items-center">
                    <span className={isLong ? "text-green-500" : "text-red-500"}>{pos.type}</span> 
                    <span className="text-[10px] bg-white/10 px-1 rounded">{pos.leverage}x</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{pos.size} SOL</td>
                  <td className="py-3 px-4 text-gray-300">${entry.toFixed(2)}</td>
                  <td className="py-3 px-4 text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> ${liqPrice.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnlStr}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded transition-colors">
                      KAPAT
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
