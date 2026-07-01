"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Wallet, Activity, History, ArrowUpRight, ArrowDownRight, RefreshCw, Crown, Trophy, Lock, Save, Shield, TrendingUp, Zap } from "lucide-react";
import toast from "react-hot-toast";

const VIP_LEVELS = [
  { name: 'BRONZE', color: 'text-orange-700', bgColor: 'bg-orange-700/10', borderColor: 'border-orange-700/30', min: 0 },
  { name: 'SILVER', color: 'text-gray-300', bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400/30', min: 1000 },
  { name: 'GOLD', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/30', min: 5000 },
  { name: 'DIAMOND', color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/30', min: 25000 },
];

export default function ProfilePage() {
  const { session, balance, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEPOSITS' | 'SPORTS_HISTORY' | 'CASINO_HISTORY' | 'TRADING' | 'SETTINGS'>('OVERVIEW');
  
  const [deposits, setDeposits] = useState<any[]>([]);
  const [sportBets, setSportBets] = useState<any[]>([]);
  const [casinoHistory, setCasinoHistory] = useState<any[]>([]);
  const [tradingPositions, setTradingPositions] = useState<any[]>([]);
  
  const [profileStats, setProfileStats] = useState({
    totalWagered: 0, vipLevel: 'BRONZE', totalTrades: 0, winRate: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [depositsRes, profileRes, sportRes, casinoRes, tradingRes] = await Promise.all([
          supabase.from('deposits').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
          supabase.from('profiles').select('total_wagered, vip_level, username').eq('id', session.user.id).single(),
          supabase.from('sport_bets').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
          supabase.from('game_history').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
          supabase.from('trading_positions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        ]);

        if (depositsRes.data) setDeposits(depositsRes.data);
        if (sportRes.data) setSportBets(sportRes.data);
        if (casinoRes.data) setCasinoHistory(casinoRes.data);
        if (tradingRes.data) setTradingPositions(tradingRes.data);
        if (profileRes.data?.username) setUsername(profileRes.data.username);

        let winRate = 0, totalTrades = 0;
        if (sportRes.data && sportRes.data.length > 0) {
          totalTrades = sportRes.data.length;
          const wins = sportRes.data.filter((b: any) => b.status === 'WON').length;
          winRate = Math.round((wins / totalTrades) * 100);
        }
        if (profileRes.data) {
          setProfileStats({
            totalWagered: profileRes.data.total_wagered || 0,
            vipLevel: profileRes.data.vip_level || 'BRONZE',
            totalTrades, winRate
          });
        }
      } catch (err) { console.error("Profile fetch error:", err); }
      finally { setLoading(false); }
    };
    fetchUserData();
  }, [session]);

  const handleUpdateProfile = async () => {
    if (!session?.user?.id) return;
    setSettingsLoading(true);
    try {
      if (username) {
        const { error } = await supabase.from('profiles').update({ username }).eq('id', session.user.id);
        if (error) throw error;
      }
      if (newPassword) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }
      toast.success("Profil güncellendi."); setNewPassword("");
    } catch (error: any) { toast.error("Hata: " + error.message); }
    finally { setSettingsLoading(false); }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-500 font-bold">Lütfen giriş yapın.</div>
      </div>
    );
  }

  const currentVipIdx = VIP_LEVELS.findIndex(v => v.name === profileStats.vipLevel);
  const currentVip = VIP_LEVELS[currentVipIdx] || VIP_LEVELS[0];
  const nextVip = VIP_LEVELS[Math.min(currentVipIdx + 1, VIP_LEVELS.length - 1)];
  const vipProgress = currentVipIdx < VIP_LEVELS.length - 1 
    ? ((profileStats.totalWagered - currentVip.min) / (nextVip.min - currentVip.min)) * 100
    : 100;

  const tabs = [
    { key: 'OVERVIEW' as const, label: 'GENEL BAKIŞ' },
    { key: 'DEPOSITS' as const, label: 'YATIRIMLAR' },
    { key: 'SPORTS_HISTORY' as const, label: 'SPOR BAHİS' },
    { key: 'CASINO_HISTORY' as const, label: 'CASINO' },
    { key: 'TRADING' as const, label: 'TRADING' },
    { key: 'SETTINGS' as const, label: 'AYARLAR' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8">
        
        {/* Profile Header */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#16a34a] blur-[150px] opacity-10 pointer-events-none"></div>
          
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#16a34a] to-blue-600 p-1 shrink-0">
            <div className="w-full h-full bg-[#050505] rounded-xl flex items-center justify-center">
              <User className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-white">{username || session.user.email?.split('@')[0] || "User"}</h1>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-black uppercase tracking-widest border ${currentVip.color} ${currentVip.bgColor} ${currentVip.borderColor}`}>
                <Crown className="w-3 h-3" /> VIP {profileStats.vipLevel}
              </span>
            </div>
            <p className="text-gray-500 font-mono text-[10px] break-all bg-white/5 p-2 rounded-lg inline-block border border-white/10 mb-2">{session.user.email}</p>
            
            {/* VIP Progress */}
            <div className="mt-3 max-w-md">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-bold">
                <span>{currentVip.name}</span>
                {currentVipIdx < VIP_LEVELS.length - 1 && <span>{nextVip.name} ({nextVip.min.toLocaleString()}$)</span>}
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-[#16a34a] to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(vipProgress, 100)}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#14151a] border border-white/5 rounded-2xl p-5 min-w-[220px] text-center md:text-right z-10">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Bakiye</p>
            <p className="text-3xl md:text-4xl font-black text-[#16a34a] font-mono">${balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/5 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-3 font-bold text-xs tracking-widest transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'text-white border-b-2 border-[#16a34a]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-500" /></div>
        ) : activeTab === 'OVERVIEW' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-36">
              <div className="flex items-center gap-3 text-gray-400"><Activity className="w-5 h-5 text-blue-500" /><span className="font-bold text-xs">Toplam Bahis Hacmi</span></div>
              <div className="text-2xl font-black text-white font-mono">${profileStats.totalWagered.toFixed(2)}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-36">
              <div className="flex items-center gap-3 text-gray-400"><History className="w-5 h-5 text-purple-500" /><span className="font-bold text-xs">Toplam Bahis</span></div>
              <div className="text-2xl font-black text-white font-mono">{profileStats.totalTrades}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-36">
              <div className="flex items-center gap-3 text-gray-400"><Trophy className="w-5 h-5 text-yellow-500" /><span className="font-bold text-xs">Kazanma Oranı</span></div>
              <div className="text-2xl font-black text-white font-mono">{profileStats.winRate}%</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-36">
              <div className="flex items-center gap-3 text-gray-400"><Zap className="w-5 h-5 text-[#16a34a]" /><span className="font-bold text-xs">Trading Pozisyonları</span></div>
              <div className="text-2xl font-black text-white font-mono">{tradingPositions.length}</div>
            </div>
          </div>
        ) : activeTab === 'DEPOSITS' ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-[#14151a] border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
                <th className="p-4">Tarih</th><th className="p-4">Coin</th><th className="p-4">Miktar</th><th className="p-4">Durum</th><th className="p-4 text-right">TxHash</th>
              </tr></thead>
              <tbody className="text-sm font-mono">
                {deposits.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-sans">Henüz yatırım yok.</td></tr>
                ) : deposits.map(dep => (
                  <tr key={dep.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-gray-400">{new Date(dep.created_at).toLocaleString()}</td>
                    <td className="p-4 text-white font-bold">{dep.coin}</td>
                    <td className="p-4 text-[#16a34a] font-bold">+${Number(dep.amount).toFixed(2)}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${dep.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : dep.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>{dep.status}</span></td>
                    <td className="p-4 text-right text-xs text-gray-500 truncate max-w-[150px]">{dep.tx_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'SPORTS_HISTORY' ? (
           <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-[#14151a] border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
                <th className="p-4">Tarih</th><th className="p-4">Maç</th><th className="p-4">Seçim & Oran</th><th className="p-4">Miktar</th><th className="p-4">Durum</th><th className="p-4 text-right">Kazanç</th>
              </tr></thead>
              <tbody className="text-sm font-mono">
                {sportBets.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-sans">Henüz bahis yok.</td></tr>
                ) : sportBets.map(bet => (
                  <tr key={bet.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-gray-400">{new Date(bet.created_at).toLocaleString()}</td>
                    <td className="p-4 text-white font-bold">{bet.match_title}</td>
                    <td className="p-4 text-gray-300">{bet.selection} <span className="text-[#16a34a] font-bold">({Number(bet.odds).toFixed(2)})</span></td>
                    <td className="p-4 text-gray-300">${Number(bet.stake).toFixed(2)}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${bet.status === 'WON' ? 'bg-green-500/10 text-green-500' : bet.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>{bet.status}</span></td>
                    <td className="p-4 text-right font-bold text-[#16a34a]">${Number(bet.potential_win).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'CASINO_HISTORY' ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-[#14151a] border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
                <th className="p-4">Tarih</th><th className="p-4">Oyun</th><th className="p-4">Bahis</th><th className="p-4">Çarpan</th><th className="p-4 text-right">Kazanç</th>
              </tr></thead>
              <tbody className="text-sm font-mono">
                {casinoHistory.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-sans">Henüz casino geçmişi yok.</td></tr>
                ) : casinoHistory.map(game => (
                  <tr key={game.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-gray-400">{new Date(game.created_at).toLocaleString()}</td>
                    <td className="p-4 text-white font-bold">{game.game_title}</td>
                    <td className="p-4 text-gray-300">${Number(game.bet_amount).toFixed(2)}</td>
                    <td className="p-4 text-[#16a34a] font-bold">{Number(game.multiplier).toFixed(2)}x</td>
                    <td className="p-4 text-right font-bold text-[#16a34a]">${Number(game.win_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'TRADING' ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-[#14151a] border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest">
                <th className="p-4">Tarih</th><th className="p-4">Parite</th><th className="p-4">Tür</th><th className="p-4">Kaldıraç</th><th className="p-4">Giriş Fiyatı</th><th className="p-4 text-right">Durum</th>
              </tr></thead>
              <tbody className="text-sm font-mono">
                {tradingPositions.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-sans">Henüz trading pozisyonu yok.</td></tr>
                ) : tradingPositions.map(pos => (
                  <tr key={pos.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-gray-400">{new Date(pos.created_at).toLocaleString()}</td>
                    <td className="p-4 text-white font-bold">{pos.asset}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${pos.type === 'LONG' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{pos.type}</span></td>
                    <td className="p-4 text-gray-300">{pos.leverage}x</td>
                    <td className="p-4 text-gray-300">${Number(pos.entry_price).toFixed(4)}</td>
                    <td className="p-4 text-right"><span className={`px-2 py-1 rounded text-[10px] font-bold ${pos.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>{pos.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 max-w-lg">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-[#16a34a]" /> HESAP AYARLARI</h3>
            <div className="space-y-4">
               <div>
                 <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Kullanıcı Adı</label>
                 <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#16a34a]" />
               </div>
               <div>
                 <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Yeni Şifre</label>
                 <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#16a34a]" />
               </div>
               <button onClick={handleUpdateProfile} disabled={settingsLoading}
                 className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4">
                 {settingsLoading ? "KAYDEDİLİYOR..." : <><Save className="w-4 h-4" /> DEĞİŞİKLİKLERİ KAYDET</>}
               </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
