"use client";

import { X, Copy, Check, Send, Loader2 } from "lucide-react";
import { VAULTS } from "@/config/vaults";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function DepositModal({ isOpen, onClose, user }: DepositModalProps) {
  const [selectedCoin, setSelectedCoin] = useState<keyof typeof VAULTS>("TRX");
  const [copied, setCopied] = useState(false);
  
  // Yeni Form Stateleri
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Cüzdan Gösterimi, 2: Bildirim Formu

  const handleCopy = () => {
    navigator.clipboard.writeText(VAULTS[selectedCoin].address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Lütfen önce giriş yapın.");
      return;
    }
    if (!amount || !txHash) {
      toast.error("Lütfen miktar ve işlem özetini (TxHash) girin.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('deposits').insert([
        {
          user_id: user.id,
          coin: selectedCoin,
          amount: parseFloat(amount),
          tx_hash: txHash,
          status: 'PENDING'
        }
      ]);

      if (error) throw error;

      toast.success("Yatırım bildiriminiz alındı! Admin onayından sonra bakiyenize eklenecektir.", {
        duration: 5000,
      });
      setStep(1);
      setAmount("");
      setTxHash("");
      onClose();
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentVault = VAULTS[selectedCoin];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#14151a]">
            <h2 className="text-white font-bold tracking-wide">
              {step === 1 ? "PARA YATIR" : "YATIRIM BİLDİRİMİ"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {step === 1 ? (
              <>
                {/* Coin Selector */}
                <div className="mb-6">
                  <label className="text-xs text-gray-500 font-bold tracking-wider mb-2 block uppercase">Ağ Seçimi</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(VAULTS) as Array<keyof typeof VAULTS>).map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setSelectedCoin(coin)}
                        className={`py-2 px-1 rounded-lg text-sm font-bold transition-all ${
                          selectedCoin === coin 
                            ? 'bg-[#16a34a] text-white shadow-[0_0_10px_rgba(22,163,74,0.4)]' 
                            : 'bg-[#0b0e11] text-gray-400 border border-white/5 hover:border-white/20'
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Code Area (Mock) */}
                <div className="flex justify-center mb-6">
                  <div className="w-48 h-48 bg-white rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentVault.address}`} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Address Area */}
                <div className="bg-[#0b0e11] rounded-xl p-4 border border-white/5 relative group mb-6">
                  <span className="text-[10px] text-gray-500 font-mono absolute -top-2 left-4 bg-[#1a1c23] px-1">
                    {currentVault.network} Adresi
                  </span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-white font-mono text-xs break-all pr-4">
                      {currentVault.address}
                    </span>
                    <button 
                      onClick={handleCopy}
                      className="shrink-0 p-2 bg-white/5 hover:bg-white/10 rounded transition-colors text-gray-300"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Transferi Yaptım, Bildir
                </button>

                {/* Warning */}
                <div className="mt-4 text-xs text-gray-500 leading-relaxed text-center">
                  Yukarıdaki adrese gönderim yaptıktan sonra <b className="text-white">"Transferi Yaptım"</b> butonuna basarak işleminizi onaylayın.
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold tracking-wider mb-2 block uppercase">
                    Yatırılan Miktar ({selectedCoin})
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Örn: 100.5"
                    className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#16a34a] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold tracking-wider mb-2 block uppercase">
                    İşlem Özeti (TxHash)
                  </label>
                  <input 
                    type="text" 
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Gönderim sonrası cüzdanın verdiği TxID"
                    className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-[#16a34a] transition-colors"
                    required
                  />
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-transparent border border-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Geri
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 bg-[#16a34a] disabled:opacity-50 hover:bg-[#15803d] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Onaya Gönder"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
