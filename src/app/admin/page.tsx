"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, DollarSign, Activity, Settings, LogOut, Loader2, Server, Check, X as XIcon, Clock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("KULLANICILAR");
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [totalBalance, setTotalBalance] = useState(0);
  const [pendingDepositsCount, setPendingDepositsCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!profilesError && profilesData) {
        setUsers(profilesData);
        setTotalBalance(profilesData.reduce((acc, user) => acc + (user.balance || 0), 0));
      }

      // Deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false });
        
      if (!depositsError && depositsData) {
        setDeposits(depositsData);
        setPendingDepositsCount(depositsData.filter(d => d.status === 'PENDING').length);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositAction = async (depositId: string, userId: string, amount: number, action: 'APPROVED' | 'REJECTED') => {
    try {
      // 1. Update Deposit Status
      const { error: depositError } = await supabase
        .from('deposits')
        .update({ status: action })
        .eq('id', depositId);
        
      if (depositError) throw depositError;

      // 2. If Approved, Add to User Balance
      if (action === 'APPROVED') {
         // Get current balance
         const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
         const newBalance = (profile?.balance || 0) + amount;
         
         const { error: profileError } = await supabase
           .from('profiles')
           .update({ balance: newBalance })
           .eq('id', userId);
           
         if (profileError) throw profileError;
      }

      toast.success(`Yatırım işlemi ${action === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`);
      fetchData(); // Refresh Data

    } catch (err: any) {
      toast.error("İşlem hatası: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="h-20 flex items-center justify-center border-b border-white/5 px-6">
          <span className="text-xl font-black tracking-tighter text-white">
            TRENCH<span className="text-red-500">ADMIN</span>
          </span>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2">
          {[
            { name: "KULLANICILAR", icon: <Users className="w-5 h-5" /> },
            { name: "YATIRIMLAR", icon: <DollarSign className="w-5 h-5" /> },
            { name: "SİSTEM LOGLARI", icon: <Activity className="w-5 h-5" /> },
            { name: "AYARLAR", icon: <Settings className="w-5 h-5" /> },
          ].map((item) => (
            <button 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                activeTab === item.name 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-white px-4 py-3 transition-colors">
            <LogOut className="w-5 h-5" /> Lobiye Dön
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-black tracking-wider flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-500" /> SİSTEM YÖNETİMİ
          </h1>
          <div className="flex items-center gap-4">
            <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded text-xs font-black tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              CANLI
            </span>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Toplam Kullanıcı</p>
              <h3 className="text-3xl font-black text-white">{users.length}</h3>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#16a34a]/10 rounded-full blur-2xl group-hover:bg-[#16a34a]/20 transition-all"></div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Sistemdeki Toplam Bakiye</p>
              <h3 className="text-3xl font-black text-[#16a34a]">${totalBalance.toFixed(2)}</h3>
            </div>
            <div className="bg-[#0a0a0a] border border-red-500/20 p-6 rounded-2xl relative overflow-hidden group shadow-[0_0_15px_rgba(239,68,68,0.05)]">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              <p className="text-red-500/80 text-xs font-bold uppercase tracking-widest mb-1">Bekleyen Yatırım Talepleri</p>
              <h3 className="text-3xl font-black text-white">{pendingDepositsCount}</h3>
            </div>
          </div>

          {activeTab === "KULLANICILAR" && (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-black text-white">Kullanıcı Listesi</h2>
                <button onClick={fetchData} className="text-xs font-bold bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4" /> YENİLE
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500 bg-black/40">
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6">Email / ID</th>
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6">Bakiye</th>
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6">Kayıt Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={3} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#16a34a]" /></td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                        <td className="py-4 px-6 text-gray-300 font-mono text-xs">{u.id}</td>
                        <td className="py-4 px-6 font-black text-[#16a34a]">${(u.balance || 0).toFixed(2)}</td>
                        <td className="py-4 px-6 text-gray-500 text-xs">{new Date(u.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "YATIRIMLAR" && (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-black text-white">Yatırım (Deposit) Talepleri</h2>
                <button onClick={fetchData} className="text-xs font-bold bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4" /> YENİLE
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500 bg-black/40">
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6">Tarih</th>
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6">Kullanıcı (ID)</th>
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6">Miktar (USD)</th>
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6">TxHash / Coin</th>
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6">Durum</th>
                      <th className="font-black text-xs uppercase tracking-widest py-4 px-6 text-right">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#16a34a]" /></td></tr>
                    ) : deposits.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-500 font-bold">Kayıtlı yatırım işlemi bulunamadı.</td></tr>
                    ) : deposits.map(dep => (
                      <tr key={dep.id} className={`border-t border-white/5 hover:bg-white/5 ${dep.status === 'PENDING' ? 'bg-amber-500/5' : ''}`}>
                        <td className="py-4 px-6 text-gray-500 font-mono text-[10px]">{new Date(dep.created_at).toLocaleString()}</td>
                        <td className="py-4 px-6 text-gray-300 font-mono text-xs">{dep.user_id.substring(0,8)}...</td>
                        <td className="py-4 px-6 font-black text-white">${dep.amount.toFixed(2)}</td>
                        <td className="py-4 px-6">
                           <div className="flex flex-col">
                             <span className="text-gray-500 font-mono text-[10px] break-all">{dep.tx_hash}</span>
                             <span className="text-xs font-bold text-amber-500">{dep.coin}</span>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                           <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${
                             dep.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                             dep.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                             'bg-amber-500/20 text-amber-500'
                           }`}>
                             {dep.status}
                           </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {dep.status === 'PENDING' && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleDepositAction(dep.id, dep.user_id, dep.amount, 'APPROVED')} className="bg-green-500/20 hover:bg-green-500/40 text-green-500 p-2 rounded-lg transition-colors border border-green-500/30">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDepositAction(dep.id, dep.user_id, dep.amount, 'REJECTED')} className="bg-red-500/20 hover:bg-red-500/40 text-red-500 p-2 rounded-lg transition-colors border border-red-500/30">
                                <XIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
