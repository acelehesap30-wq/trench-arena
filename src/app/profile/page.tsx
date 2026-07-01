"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { User, Wallet, Activity, History, ArrowUpRight, ArrowDownRight, RefreshCw, Crown, Trophy, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { session, balance, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DEPOSITS' | 'SPORTS_HISTORY' | 'CASINO_HISTORY' | 'SETTINGS'>('OVERVIEW');
  
  const [deposits, setDeposits] = useState<any[]>([]);
  const [sportBets, setSportBets] = useState<any[]>([]);
  const [casinoHistory, setCasinoHistory] = useState<any[]>([]);
  
  const [profileStats, setProfileStats] = useState({
    totalWagered: 0,
    vipLevel: 'BRONZE',
    totalTrades: 0,
    winRate: 0,
  });
  
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch Deposits
        const { data: depositsData } = await supabase
          .from('deposits')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (depositsData) setDeposits(depositsData);

        // Fetch Profile Stats
        const { data: profileData } = await supabase
          .from('profiles')
          .select('total_wagered, vip_level, username')
          .eq('id', session.user.id)
          .single();

        if (profileData && profileData.username) {
          setUsername(profileData.username);
        }

        // Fetch Sport Bets
        const { data: sportBetsData } = await supabase
          .from('sport_bets')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (sportBetsData) setSportBets(sportBetsData);

        // Fetch Casino History
        const { data: casinoData } = await supabase
          .from('game_history')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (casinoData) setCasinoHistory(casinoData);

        let winRate = 0;
        let totalTrades = 0;
        
        if (sportBetsData && sportBetsData.length > 0) {
          totalTrades = sportBetsData.length;
          const wins = sportBetsData.filter(b => b.status === 'WON').length;
          winRate = Math.round((wins / totalTrades) * 100);
        }

        if (profileData) {
          setProfileStats({
            totalWagered: profileData.total_wagered || 0,
            vipLevel: profileData.vip_level || 'BRONZE',
            totalTrades,
            winRate
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [session]);

  const handleUpdateProfile = async () => {
    if (!session?.user?.id) return;
    setSettingsLoading(true);
    try {
      if (username) {
        const { error } = await supabase
          .from('profiles')
          .update({ username })
          .eq('id', session.user.id);
        if (error) throw error;
      }
      
      if (newPassword) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }
      
      toast.success("Profil güncellendi.");
      setNewPassword("");
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-500 font-bold">
          Lütfen giriş yapın.
        </div>
      </div>
    );
  }

  const getVipColor = (level: string) => {
    switch(level) {
      case 'DIAMOND': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'GOLD': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'SILVER': return 'text-gray-300 bg-gray-400/10 border-gray-400/30';
      default: return 'text-orange-700 bg-orange-700/10 border-orange-700/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8">
        
        {/* Profile Header */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#16a34a] blur-[150px] opacity-10 pointer-events-none"></div>
          
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#16a34a] to-blue-600 p-1 shrink-0">
            <div className="w-full h-full bg-[#050505] rounded-xl flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-3xl font-black text-white">{username || session.user.email?.split('@')[0] || "User"}</h1>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-black uppercase tracking-widest border ${getVipColor(profileStats.vipLevel)}`}>
                <Crown className="w-3 h-3" /> VIP {profileStats.vipLevel}
              </span>
            </div>
            <p className="text-gray-500 font-mono text-xs break-all bg-white/5 p-2 rounded-lg inline-block border border-white/10">ID: {session.user.id}</p>
            <p className="text-gray-500 font-mono text-xs ml-2 break-all bg-white/5 p-2 rounded-lg inline-block border border-white/10">{session.user.email}</p>
          </div>
          
          <div className="bg-[#14151a] border border-white/5 rounded-2xl p-6 min-w-[250px] text-center md:text-right z-10">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Bakiye</p>
            <p className="text-4xl font-black text-[#16a34a] font-mono">${balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/5 mb-8 overflow-x-auto custom-scrollbar">
          {(['OVERVIEW', 'DEPOSITS', 'SPORTS_HISTORY', 'CASINO_HISTORY', 'SETTINGS'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-bold text-sm tracking-widest transition-colors whitespace-nowrap ${
                activeTab === tab ? 'text-white border-b-2 border-[#16a34a]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'OVERVIEW' && 'GENEL BAKIŞ'}
              {tab === 'DEPOSITS' && 'YATIRIM GEÇMİŞİ'}
              {tab === 'SPORTS_HISTORY' && 'SPOR BAHİSLERİ'}
              {tab === 'CASINO_HISTORY' && 'CASINO GEÇMİŞİ'}
              {tab === 'SETTINGS' && 'AYARLAR'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-500" /></div>
        ) : activeTab === 'OVERVIEW' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-40">
              <div className="flex items-center gap-3 text-gray-400">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-sm">Toplam Bahis Hacmi</span>
              </div>
              <div className="text-3xl font-black text-white font-mono">${profileStats.totalWagered.toFixed(2)}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-40">
              <div className="flex items-center gap-3 text-gray-400">
                <History className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-sm">Toplam Spor Bahsi</span>
              </div>
              <div className="text-3xl font-black text-white font-mono">{profileStats.totalTrades}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-40">
              <div className="flex items-center gap-3 text-gray-400">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-sm">Kazanma Oranı (Spor)</span>
              </div>
              <div className="text-3xl font-black text-white font-mono">{profileStats.winRate}%</div>
            </div>
          </div>
        ) : activeTab === 'DEPOSITS' ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#14151a] border-b border-white/5 text-xs text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Coin</th>
                  <th className="p-4">Miktar</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">TxHash</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {deposits.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-sans">Henüz yatırım işlemi bulunmuyor.</td></tr>
                ) : deposits.map(dep => (
                  <tr key={dep.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-gray-400">{new Date(dep.created_at).toLocaleString()}</td>
                    <td className="p-4 text-white font-bold">{dep.coin}</td>
                    <td className="p-4 text-[#16a34a] font-bold">+${Number(dep.amount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        dep.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                        dep.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-gray-500 truncate max-w-[150px]">{dep.tx_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'SPORTS_HISTORY' ? (
           <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#14151a] border-b border-white/5 text-xs text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Maç</th>
                  <th className="p-4">Seçim & Oran</th>
                  <th className="p-4">Miktar</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">Kazanç</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {sportBets.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-sans">Henüz spor bahsi bulunmuyor.</td></tr>
                ) : sportBets.map(bet => (
                  <tr key={bet.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-gray-400">{new Date(bet.created_at).toLocaleString()}</td>
                    <td className="p-4 text-white font-bold">{bet.match_title}</td>
                    <td className="p-4 text-gray-300">{bet.selection} <span className="text-[#16a34a] font-bold">({Number(bet.odds).toFixed(2)})</span></td>
                    <td className="p-4 text-gray-300">${Number(bet.stake).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        bet.status === 'WON' ? 'bg-green-500/10 text-green-500' :
                        bet.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {bet.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-[#16a34a]">${Number(bet.potential_win).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'CASINO_HISTORY' ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#14151a] border-b border-white/5 text-xs text-gray-500 uppercase tracking-widest">
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Oyun</th>
                  <th className="p-4">Bahis</th>
                  <th className="p-4">Çarpan</th>
                  <th className="p-4 text-right">Kazanç</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {casinoHistory.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-sans">Henüz casino geçmişi bulunmuyor.</td></tr>
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
        ) : (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 max-w-lg">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-[#16a34a]" /> HESAP AYARLARI</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Kullanıcı Adı</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#16a34a]" />
               </div>
               <div>
                  <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#16a34a]" />
               </div>
               <button 
                 onClick={handleUpdateProfile} 
                 disabled={settingsLoading}
                 className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
               >
                 {settingsLoading ? "KAYDEDİLİYOR..." : <><Save className="w-4 h-4" /> DEĞİŞİKLİKLERİ KAYDET</>}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
