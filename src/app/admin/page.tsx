"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, DollarSign, Activity, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  
  // Mock veri. İleride Supabase'den çekilecek
  useEffect(() => {
    setUsers([
      { id: "1", email: "vip_player1@gmail.com", balance: 1450.00, status: "ACTIVE" },
      { id: "2", email: "crypto_king@yahoo.com", balance: 250.50, status: "ACTIVE" },
      { id: "3", email: "newbie123@gmail.com", balance: 0.00, status: "PENDING_DEPOSIT" },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#14151a] border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <span className="text-2xl font-black text-[#16a34a] tracking-tighter">GOD<span className="text-white">MODE</span></span>
          <div className="text-[10px] text-gray-500 font-mono mt-1">v1.0.0 Admin Panel</div>
        </div>
        <nav className="flex-1 p-4 space-y-2 text-sm font-bold">
          <button className="w-full flex items-center gap-3 p-3 bg-[#16a34a]/10 text-[#16a34a] rounded-lg">
            <Activity className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Users className="w-5 h-5" /> Kullanıcılar
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <DollarSign className="w-5 h-5" /> Yatırım / Çekim
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5" /> Site Ayarları
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link href="/" className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold">
            <LogOut className="w-5 h-5" /> Lobiye Dön
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Sistem Özeti</h1>
          <div className="bg-[#14151a] px-4 py-2 rounded-lg border border-white/5 font-mono text-sm">
            <span className="text-gray-500">Admin:</span> berkecansuskun1998
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#14151a] p-6 rounded-xl border border-white/5">
            <div className="text-gray-500 text-sm font-bold mb-2">Toplam Kasa Bakiyesi</div>
            <div className="text-3xl font-black text-white">$14,250.00</div>
          </div>
          <div className="bg-[#14151a] p-6 rounded-xl border border-white/5">
            <div className="text-gray-500 text-sm font-bold mb-2">Aktif Oyuncular</div>
            <div className="text-3xl font-black text-[#16a34a]">24</div>
          </div>
          <div className="bg-[#14151a] p-6 rounded-xl border border-white/5">
            <div className="text-gray-500 text-sm font-bold mb-2">Bekleyen Yatırımlar</div>
            <div className="text-3xl font-black text-amber-500">3</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#14151a] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold">Son Üyeler & Bakiyeler</h2>
            <button className="text-sm bg-white/5 px-3 py-1 rounded hover:bg-white/10 transition-colors">Tümünü Gör</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 bg-white/[0.02]">
                <th className="font-bold py-4 px-6">E-POSTA</th>
                <th className="font-bold py-4 px-6">BAKİYE (USD)</th>
                <th className="font-bold py-4 px-6">DURUM</th>
                <th className="font-bold py-4 px-6 text-right">İŞLEM</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-mono">{u.email}</td>
                  <td className="py-4 px-6 font-bold text-[#16a34a]">${u.balance.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${u.status === 'ACTIVE' ? 'bg-[#16a34a]/20 text-[#16a34a]' : 'bg-amber-500/20 text-amber-500'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                      Bakiye Düzenle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
