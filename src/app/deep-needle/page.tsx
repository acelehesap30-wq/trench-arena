"use client";

import { usePythPrice } from "@/hooks/usePythPrice";
import { ArrowLeft, Zap, Crosshair, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function DeepNeedlePage() {
    const { price, trend } = usePythPrice();
    const [amount, setAmount] = useState("1.0");
    const [targetDrop, setTargetDrop] = useState("5"); // percentage drop
    const { connected } = useWallet();

    const handleExecute = () => {
        if (!connected) {
            alert("Lütfen önce sağ üstten cüzdanınızı bağlayın!");
            return;
        }
        alert(`${amount} SOL ile %${targetDrop} çöküşüne (Deep Needle) limit emir girildi! (Akıllı kontrat aşamasında aktif olacak)`);
    };

    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white p-6 pt-20">
            {/* Top Navigation Back */}
            <div className="max-w-7xl mx-auto w-full mb-8 z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="tracking-widest font-mono text-sm">LOBİYE DÖN</span>
                </Link>
            </div>

            <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 z-10">
                
                {/* Left Panel: Pyth Oracle Live Price */}
                <div className="flex-1 glass-panel p-10 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-4 left-6 flex items-center gap-2 opacity-60">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="font-mono text-xs tracking-widest text-purple-400">PYTH NETWORK ORACLE</span>
                    </div>

                    <h2 className="text-gray-500 font-mono tracking-widest mb-4">LIVE SOL/USD</h2>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-5xl md:text-8xl font-black tracking-tighter">
                            {price === null ? "..." : `$${price}`}
                        </span>
                        {trend === 'up' && <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse"></div>}
                        {trend === 'down' && <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-pulse"></div>}
                        {trend === 'neutral' && <div className="w-4 h-4 rounded-full bg-gray-500"></div>}
                    </div>
                </div>

                {/* Right Panel: Limit Order Desk */}
                <div className="w-full lg:w-[400px] glass-panel p-8 rounded-2xl flex flex-col gap-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Crosshair className="w-6 h-6 text-blue-500" />
                        <h3 className="text-xl font-bold tracking-widest">DEEP NEEDLE GİRİŞİ</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400 font-mono">RİSK MİKTARI (SOL)</label>
                            <div className="relative">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400 font-mono">HEDEF ÇÖKÜŞ ORANI (%)</label>
                            <input 
                                type="range" 
                                min="1" 
                                max="99" 
                                value={targetDrop}
                                onChange={(e) => setTargetDrop(e.target.value)}
                                className="w-full accent-blue-500"
                            />
                            <div className="text-right text-blue-400 font-mono font-bold">
                                -%{targetDrop} DROP
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <button 
                            onClick={handleExecute}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] active:scale-95"
                        >
                            İĞNEYİ KUR
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}
