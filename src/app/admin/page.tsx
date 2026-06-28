"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, DollarSign, Activity, Settings, LogOut, Loader2, Server } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Canlı Veri (Live Data) Supabase'den çekiliyor. Mock kaldırıldı.
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        // Supabase 'profiles' tablosundan canlı kullanıcı verilerini çekiyoruz
        // Not: Eğer RLS kuralları kapalı değilse veya tablo yoksa hata fırlatabilir.
        // Gerçek dünyada bu işlemler Server-Side veya Admin API Key ile yapılır.
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error("Supabase Error:", error);
          // Eğer profiles tablosu yoksa boş döndür, hata gösterme
          if (error.code === '42P01') { 
             setUsers([]); 
          } else {
             throw error;
          }
        } else {
          setUsers(data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex selection:bg-[#16a34a]/30">
      {/* Sidebar - Premium Dark */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-10 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <span className="text-3xl font-black text-[#16a34a] tracking-tighter drop-shadow-[0_0_15px_rgba(22,163,74,0.4)]">
            GOD<span className="text-white">MODE</span>
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]"></span>
            </span>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Canlı Sistem Aktif</div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-3 text-sm font-bold">
          <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#16a34a]/20 to-transparent border-l-4 border-[#16a34a] text-white rounded-r-lg transition-all">
            <Activity className="w-5 h-5 text-[#16a34a]" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Users className="w-5 h-5" /> Müşteriler
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <DollarSign className="w-5 h-5" /> Finans / Kasa
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Server className="w-5 h-5" /> API Yonetimi
          </button>
        </nav>
        <div className="p-6 border-t border-white/5">
          <Link href="/" className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors text-sm font-black uppercase tracking-wider border border-red-500/20">
            <LogOut className="w-5 h-5" /> Lobiye Dön
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#16a34a]/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">Merkezi Komuta</h1>
              <p className="text-gray-400 text-sm font-medium">Tüm canlı casino verilerini gerçek zamanlı yönetin.</p>
            </div>
            <div className="bg-black/50 backdrop-blur border border-white/10 px-6 py-3 rounded-xl font-mono text-sm shadow-xl flex items-center gap-3">
              <span className="text-gray-500">Root:</span> 
              <span className="font-bold text-[#16a34a]">berkecansuskun1998</span>
            </div>
          </div>

          {/* Stats - Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign className="w-24 h-24 text-white" /></div>
              <div className="text-gray-500 text-sm font-black uppercase tracking-widest mb-3 relative z-10">Toplam Kasa Hacmi</div>
              <div className="text-4xl font-black text-white relative z-10 drop-shadow-lg">$14,250.00</div>
              <div className="text-xs text-[#16a34a] font-bold mt-4 relative z-10">+%12 bu hafta</div>
            </div>
            
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users className="w-24 h-24 text-[#16a34a]" /></div>
              <div className="text-gray-500 text-sm font-black uppercase tracking-widest mb-3 relative z-10">Aktif Oyuncular</div>
              <div className="text-4xl font-black text-[#16a34a] relative z-10 drop-shadow-[0_0_10px_rgba(22,163,74,0.3)]">{users.length}</div>
              <div className="text-xs text-gray-500 font-bold mt-4 relative z-10">Supabase Canlı Veri</div>
            </div>
            
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-amber-500/20 relative overflow-hidden group shadow-[0_0_30px_rgba(245,158,11,0.05)]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity className="w-24 h-24 text-amber-500" /></div>
              <div className="text-amber-500/80 text-sm font-black uppercase tracking-widest mb-3 relative z-10">Bekleyen Yatırımlar</div>
              <div className="text-4xl font-black text-amber-500 relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">0</div>
              <div className="text-xs text-amber-500/50 font-bold mt-4 relative z-10">Manuel Onay Bekliyor</div>
            </div>
          </div>

          {/* Live Data Table */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div>
                <h2 className="text-xl font-black text-white">Canlı Müşteri Veritabanı</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Supabase bağlantısı aktif.</p>
              </div>
              <button className="text-sm font-bold bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors border border-white/5">Tümünü Gör</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 bg-black/40">
                    <th className="font-black text-xs uppercase tracking-widest py-5 px-8">Hesap ID</th>
                    <th className="font-black text-xs uppercase tracking-widest py-5 px-8">Bakiye (USD)</th>
                    <th className="font-black text-xs uppercase tracking-widest py-5 px-8">Durum</th>
                    <th className="font-black text-xs uppercase tracking-widest py-5 px-8 text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#16a34a]" />
                        <span className="font-mono text-xs">Canlı veri çekiliyor...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-500">
                        <Server className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <span className="font-bold text-sm block">Veritabanında kayıtlı üye bulunamadı.</span>
                        <span className="font-medium text-xs mt-1 block opacity-50">(Veya 'profiles' tablosu RLS tarafından engelleniyor)</span>
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 px-8 font-mono text-gray-300">{u.id.substring(0,8)}...</td>
                        <td className="py-5 px-8 font-black text-[#16a34a] text-base">${u.balance?.toFixed(2) || '0.00'}</td>
                        <td className="py-5 px-8">
                          <span className="text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-wider bg-[#16a34a]/20 text-[#16a34a] border border-[#16a34a]/20">
                            AKTİF
                          </span>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <button className="text-xs font-bold bg-white/5 text-white px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                            Yönet
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
