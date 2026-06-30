"use client";

import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function PositionsTable({ currentPrice }: { currentPrice: string | null }) {
  const { session, loading: authLoading } = useAuth();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    if (!session?.user) {
      setPositions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trading_positions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setPositions(data);
      }
    } catch (err) {
      console.error("Error fetching positions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchPositions();
    
    // Set up realtime subscription for positions
    const channel = supabase
      .channel('public:trading_positions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trading_positions' },
        () => {
          fetchPositions(); // Refetch on any change
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, authLoading]);

  const closePosition = async (id: string, currentPriceVal: number, isLong: boolean, entryPrice: number, leverage: number) => {
    if (!session) return;
    
    try {
      const pnlPercent = isLong ? ((currentPriceVal - entryPrice) / entryPrice) * leverage * 100 : ((entryPrice - currentPriceVal) / entryPrice) * leverage * 100;
      
      const { error } = await supabase
        .from('trading_positions')
        .update({ 
          status: 'CLOSED', 
          close_price: currentPriceVal,
          pnl: pnlPercent,
          closed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success("Pozisyon başarıyla kapatıldı!");
      fetchPositions();
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500 text-xs font-mono">POZİSYONLAR YÜKLENİYOR...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col text-xs font-mono">
      <div className="flex gap-6 border-b border-white/10 mb-4">
        <button className="text-white border-b-2 border-blue-500 pb-2 px-2 font-bold tracking-widest">AÇIK POZİSYONLAR ({positions.length})</button>
        <button className="text-gray-500 hover:text-gray-300 pb-2 px-2 tracking-widest transition-colors">GEÇMİŞ EMİRLER</button>
      </div>

      <div className="overflow-x-auto flex-1">
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
            {!session ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Pozisyonlarınızı görmek için giriş yapın.</td></tr>
            ) : positions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Açık pozisyon yok.</td></tr>
            ) : positions.map(pos => {
              const entry = Number(pos.entry_price);
              const current = Number(currentPrice || entry);
              const isLong = pos.type === 'LONG';
              const pnlPercent = isLong ? ((current - entry) / entry) * pos.leverage * 100 : ((entry - current) / entry) * pos.leverage * 100;
              const pnlStr = pnlPercent >= 0 ? `+${pnlPercent.toFixed(2)}%` : `${pnlPercent.toFixed(2)}%`;
              
              const liqPrice = isLong ? entry * (1 - 1/pos.leverage) : entry * (1 + 1/pos.leverage);

              return (
                <tr key={pos.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex gap-2 items-center">
                    <span className={isLong ? "text-green-500" : "text-red-500"}>{pos.type}</span> 
                    <span className="text-[10px] bg-white/10 px-1 rounded">{pos.leverage}x</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{pos.size} {pos.asset.split('/')[0]}</td>
                  <td className="py-3 px-4 text-gray-300">${entry.toFixed(2)}</td>
                  <td className="py-3 px-4 text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> ${liqPrice.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnlStr}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => closePosition(pos.id, current, isLong, entry, pos.leverage)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded transition-colors"
                    >
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
