"use client";

import { X, Copy, Check } from "lucide-react";
import { VAULTS } from "@/config/vaults";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [selectedCoin, setSelectedCoin] = useState<keyof typeof VAULTS>("TRX");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(VAULTS[selectedCoin].address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h2 className="text-white font-bold tracking-wide">PARA YATIR</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
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
                {/* Şimdilik fake bir QR görseli */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentVault.address}`} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Address Area */}
            <div className="bg-[#0b0e11] rounded-xl p-4 border border-white/5 relative group">
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

            {/* Warning */}
            <div className="mt-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500/80 leading-relaxed text-center">
              Lütfen sadece <b>{currentVault.network}</b> ağını kullanarak gönderim yapın. Farklı bir ağ veya token gönderimi kayıplara yol açabilir. Bakiye 1-3 dakika içinde hesabınıza yansıyacaktır.
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
