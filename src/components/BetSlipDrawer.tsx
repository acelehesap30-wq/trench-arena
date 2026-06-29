"use client";

import { useBet } from "@/contexts/BetContext";
import { useAuth } from "@/contexts/AuthContext";
import { X, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function BetSlipDrawer() {
  const { isSlipOpen, setIsSlipOpen, selections, removeSelection, clearSelections } = useBet();
  const { session, balance, refreshBalance } = useAuth();
  
  const [wager, setWager] = useState<string>("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total odds and potential win
  const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, 1);
  const numericWager = parseFloat(wager) || 0;
  const potentialWin = numericWager * totalOdds;

  const handlePlaceBet = async () => {
    if (!session?.user) {
      toast.error("Lütfen önce giriş yapın veya cüzdanınızı bağlayın.");
      return;
    }
    if (selections.length === 0) {
      toast.error("Kuponunuzda maç bulunmuyor.");
      return;
    }
    if (numericWager <= 0) {
      toast.error("Geçerli bir bahis tutarı girin.");
      return;
    }
    if (numericWager > balance) {
      toast.error("Bakiyeniz yetersiz.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create bet records in Supabase
      // In a real app with backend, we would use an RPC to deduct balance and insert bet atomically.
      // Since we simulate frontend-heavy, we will update balance directly and insert.
      
      const newBalance = balance - numericWager;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Insert all bets
      const betsToInsert = selections.map(s => ({
        user_id: session.user.id,
        amount: numericWager / selections.length, // split wager across bets, or keep as a parlay? 
        // Let's do it as a Parlay (Kombine Kupon)
        potential_win: potentialWin,
        match_id: s.matchId,
        selection: s.selection,
        odds: s.odds,
        status: 'PENDING'
      }));

      // Instead of array if we do parlay, we can just insert one record or multiple.
      // For simplicity, we insert them individually with the same amount if it's single, or just one parlay record.
      // Let's just insert them all.
      
      const { error: betError } = await supabase.from('bets').insert(betsToInsert);
      
      if (betError) throw betError;

      toast.success("Bahis başarıyla onaylandı!");
      clearSelections();
      setIsSlipOpen(false);
      refreshBalance();
    } catch (err: any) {
      console.error("Bet error:", err);
      toast.error(err.message || "Bahis alınırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isSlipOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSlipOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-[#0b0e11] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#14151a]">
              <h2 className="text-white font-black tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#16a34a]" /> KUPON
                {selections.length > 0 && (
                  <span className="bg-[#16a34a] text-black text-xs px-2 py-0.5 rounded-full">{selections.length}</span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                {selections.length > 0 && (
                  <button onClick={clearSelections} className="text-xs text-red-500 font-bold hover:underline uppercase">
                    Temizle
                  </button>
                )}
                <button onClick={() => setIsSlipOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {selections.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                  <ShieldCheck className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-bold uppercase">Kuponunuz Boş</p>
                </div>
              ) : (
                selections.map((bet) => (
                  <div key={bet.id} className="bg-[#14151a] border border-white/5 rounded-xl p-3 relative group">
                    <button 
                      onClick={() => removeSelection(bet.id)}
                      className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1 line-clamp-1 pr-6">
                      {bet.matchTitle}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm">{bet.selection}</span>
                      <span className="text-[#16a34a] font-black">{bet.odds.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[#14151a]">
              {selections.length > 0 && (
                <>
                  <div className="space-y-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm font-bold">Toplam Oran</span>
                      <span className="text-white font-black text-lg">{totalOdds.toFixed(2)}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 font-bold mb-2">
                        <span>Bahis Tutarı ($)</span>
                        {session && <span>Bakiye: ${balance.toLocaleString()}</span>}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={wager}
                          onChange={(e) => setWager(e.target.value)}
                          className="flex-1 bg-[#0b0e11] border border-white/10 rounded-lg p-2 text-white font-bold outline-none focus:border-[#16a34a] transition-colors"
                        />
                        <div className="flex gap-1">
                          {['10', '50', 'Max'].map(amt => (
                            <button 
                              key={amt}
                              onClick={() => setWager(amt === 'Max' ? balance.toString() : amt)}
                              className="px-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold transition-colors border border-white/5"
                            >
                              {amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-gray-400 text-sm font-bold">Olası Kazanç</span>
                      <span className="text-[#16a34a] font-black text-xl">${potentialWin.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handlePlaceBet}
                    disabled={isSubmitting}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'BAHSİ ONAYLA'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
