"use client";

import { AlertCircle } from 'lucide-react';

export default function PositionsTable({ currentPrice }: { currentPrice: string | null }) {
  // Mock data for display. In real app, fetch from Supabase.
  const positions = [
    { id: 1, type: "DEEP NEEDLE 10X", size: "1.5 SOL", entry: 142.50, liq: 128.25, pnl: "+15.4%" },
    { id: 2, type: "DEAD CAT BOUNCE", size: "0.5 SOL", entry: 144.10, liq: 151.30, pnl: "-2.1%" },
  ];

  return (
    <div className="w-full h-full flex flex-col text-xs font-mono">
      <div className="flex gap-6 border-b border-white/10 mb-4">
        <button className="text-white border-b-2 border-blue-500 pb-2 px-2 font-bold tracking-widest">AÇIK POZİSYONLAR (2)</button>
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
            {positions.map(pos => (
              <tr key={pos.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-bold text-white">{pos.type}</td>
                <td className="py-3 px-4 text-gray-300">{pos.size}</td>
                <td className="py-3 px-4 text-gray-300">${pos.entry.toFixed(2)}</td>
                <td className="py-3 px-4 text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> ${pos.liq.toFixed(2)}
                </td>
                <td className={`py-3 px-4 text-right font-bold ${pos.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {pos.pnl}
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded transition-colors">
                    KAPAT
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
