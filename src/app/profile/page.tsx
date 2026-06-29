"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Shield, Wallet, History, Settings, ArrowUpRight, ArrowDownRight, Clock, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { session, balance, loading: authLoading, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("GENEL BAKIŞ");
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!session) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      // Fetch Deposits
      const { data: userDeposits } = await supabase.from('deposits').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(10);
      if (userDeposits) setDeposits(userDeposits);

      setProfileData({
        username: session.user.email?.split('@')[0] || "Trader",
        joinDate: new Date(session.user.created_at).toLocaleDateString(),
        totalTrades: 142,
        winRate: "68%",
        totalVolume: "$45,230.00"
      });
      setLoading(false);
    };

    fetchData();
  }, [session, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-20 glass-premium border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-3xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
            TRENCH<span className="text-[#16a34a]">BET</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
             <span className="text-xs text-gray-500">Bakiye</span>
             <span className="text-sm font-bold text-[#16a34a]">${balance}</span>
          </div>
          <button onClick={handleLogout} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-colors text-red-500 ml-4">
             <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar (Profile Menu) */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
           <div className="glass-premium p-6 rounded-2xl border border-white/5 mb-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/30 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-[#16a34a]" />
              </div>
              <h2 className="text-lg font-black">{session?.user?.email?.split('@')[0] || "Misafir"}</h2>
              <span className="text-xs text-gray-500 font-mono mt-1">ID: {session?.user?.id?.slice(0,8) || "---"}</span>
           </div>

           <nav className="space-y-1">
             {[
               { name: "GENEL BAKIŞ", icon: <User className="w-4 h-4" /> },
               { name: "CÜZDAN", icon: <Wallet className="w-4 h-4" /> },
               { name: "İŞLEM GEÇMİŞİ", icon: <History className="w-4 h-4" /> },
               { name: "GÜVENLİK", icon: <Shield className="w-4 h-4" /> },
               { name: "AYARLAR", icon: <Settings className="w-4 h-4" /> },
             ].map((tab) => (
               <button 
                 key={tab.name}
                 onClick={() => setActiveTab(tab.name)}
                 className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === tab.name ? 'bg-[#16a34a] text-black shadow-[0_0_15px_rgba(22,163,74,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
               >
                 {tab.icon} {tab.name}
               </button>
             ))}
           </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 glass-premium rounded-3xl border border-white/5 p-6 md:p-10 relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#16a34a]/10 blur-[100px] rounded-full pointer-events-none"></div>

           {activeTab === "GENEL BAKIŞ" && (
             <div className="space-y-8 relative z-10">
               <div>
                 <h3 className="text-2xl font-black mb-1">Hoş Geldin, Savaşçı!</h3>
                 <p className="text-gray-400 text-sm">Buradan tüm istatistiklerini ve finansal işlemlerini yönetebilirsin.</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col">
                   <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Toplam Bakiye</span>
                   <span className="text-3xl font-black text-white">${balance}</span>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col">
                   <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Toplam Bahis</span>
                   <span className="text-3xl font-black text-white">$12,450.00</span>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col">
                   <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">VIP Seviyesi</span>
                   <span className="text-3xl font-black text-amber-500">BRONZE</span>
                 </div>
               </div>
             </div>
           )}

           {activeTab === "CÜZDAN" && (
             <div className="space-y-8 relative z-10">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><Wallet className="w-6 h-6 text-[#16a34a]" /> Kasa Yönetimi</h3>
                
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-sm text-gray-500 font-bold uppercase mb-1">Mevcut Bakiye</span>
                     <span className="text-4xl font-black text-[#16a34a]">${balance}</span>
                   </div>
                   <div className="flex gap-3">
                     <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all">
                       ÇEKİM YAP
                     </button>
                     <button className="bg-[#16a34a] text-black font-black py-3 px-6 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(22,163,74,0.3)]">
                       PARA YATIR
                     </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === "İŞLEM GEÇMİŞİ" && (
             <div className="space-y-6 relative z-10">
                <h3 className="text-2xl font-black flex items-center gap-2"><History className="w-6 h-6 text-[#16a34a]" /> Son Yatırımlar</h3>
                
                {deposits.length === 0 ? (
                  <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10 text-gray-500 font-bold">
                    Henüz işlem bulunmuyor.
                  </div>
                ) : (
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#14151a] text-xs uppercase font-black text-gray-500">
                        <tr>
                          <th className="px-6 py-4">Tarih</th>
                          <th className="px-6 py-4">Miktar</th>
                          <th className="px-6 py-4">Coin</th>
                          <th className="px-6 py-4">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {deposits.map((dep) => (
                          <tr key={dep.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-gray-400 font-mono text-xs flex items-center gap-2">
                               <Clock className="w-3 h-3" /> {new Date(dep.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-black text-white">{dep.amount}</td>
                            <td className="px-6 py-4 font-bold text-gray-300">{dep.coin}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded ${
                                 dep.status === 'APPROVED' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                                 dep.status === 'REJECTED' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                               }`}>
                                 {dep.status === 'PENDING' ? 'BEKLİYOR' : dep.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
           )}

           {(activeTab === "GÜVENLİK" || activeTab === "AYARLAR") && (
             <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 grayscale">
                <Settings className="w-16 h-16 mb-4 text-[#16a34a]" />
                <h3 className="text-2xl font-black mb-2">Çok Yakında</h3>
                <p className="text-gray-400 font-medium max-w-md">Bu bölüm üzerindeki çalışmalarımız devam ediyor.</p>
             </div>
           )}

        </main>
      </div>
    </div>
  );
}
