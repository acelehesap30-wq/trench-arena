"use client";

import { usePythPrice } from "@/hooks/usePythPrice";
import { ArrowLeft, Zap, Crosshair, Wallet, TrendingDown, Activity, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import LiveChart from "@/components/LiveChart";
import LiquidationFeed from "@/components/LiquidationFeed";
import { createBetTransaction } from "@/utils/solana";

export default function DeepNeedlePage() {
    const { price, trend } = usePythPrice();
    const [amount, setAmount] = useState("0.1");
    const [targetDrop, setTargetDrop] = useState("5"); 
    const [leverage, setLeverage] = useState("1");
    
    // Web3 State
    const { connection } = useConnection();
    const { connected, publicKey, sendTransaction } = useWallet();
    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const handleExecute = async () => {
        if (!connected || !publicKey) {
            alert("Lütfen önce sağ üstten Phantom cüzdanınızı bağlayın!");
            return;
        }

        if (parseFloat(amount) <= 0) {
            alert("Geçerli bir SOL miktarı giriniz.");
            return;
        }
        
        try {
            setIsProcessing(true);
            setTxHash(null);

            // 1. İşlem Oluşturma (Transfer Instruction)
            const transaction = await createBetTransaction(connection, publicKey, parseFloat(amount));
            
            // 2. Cüzdan ile İmzalama ve Ağa Gönderme
            const signature = await sendTransaction(transaction, connection);
            
            // 3. Solana Ağında Onay (Confirmation) Bekleme
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            });

            setTxHash(signature);

            // 4. Veritabanına Başarılı Kayıt
            const { error } = await supabase
                .from('bets')
                .insert([
                    { 
                        wallet_address: publicKey.toBase58(),
                        game_type: `DEEP_NEEDLE_${leverage}X`,
                        amount_sol: parseFloat(amount),
                        target_drop_percent: parseFloat(targetDrop),
                        entry_price: parseFloat(price || "0"),
                        status: 'EXECUTED_DEVNET'
                    }
                ]);

            if (error) throw error;
            
        } catch (error: any) {
            console.error("Web3 Error:", error);
            if (error?.message?.includes("User rejected")) {
                alert("İşlem cüzdandan reddedildi.");
            } else if (error?.message?.includes("insufficient lamports")) {
                alert("Devnet cüzdanınızda yeterli bakiye (SOL) yok! (Solana Faucet üzerinden test SOL alın)");
            } else {
                alert("İşlem başarısız oldu. Logları kontrol edin.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden bg-[#050505] text-white p-4 md:p-6 pt-24 font-sans">
            
            {/* Top Navigation */}
            <div className="max-w-[1600px] mx-auto w-full mb-6 z-10 flex justify-between items-center">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="tracking-widest font-mono text-xs uppercase">Terminalden Çık</span>
                </Link>
                <div className="flex gap-4">
                    <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-mono text-green-400">
                        <Activity className="w-4 h-4" /> 24H VOL: $1.2B
                    </div>
                    <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-mono text-amber-400">
                        <AlertTriangle className="w-4 h-4" /> DEVNET MODE
                    </div>
                </div>
            </div>

            {/* 3-Column Terminal Layout */}
            <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 flex-1 min-h-[700px]">
                
                {/* Column 1: Market Stats & Live Chart (Spans 8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Header Stats */}
                    <div className="glass-panel p-6 rounded-2xl flex justify-between items-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                        
                        <div className="flex flex-col z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                                <span className="font-mono text-xs tracking-widest text-gray-400">PYTH ORACLE - SOL/USD</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl md:text-6xl font-black tracking-tighter">
                                    {price === null ? "..." : `$${price}`}
                                </span>
                                {trend === 'up' && <TrendingDown className="w-8 h-8 text-blue-500 rotate-180" />}
                                {trend === 'down' && <TrendingDown className="w-8 h-8 text-red-500" />}
                            </div>
                        </div>

                        <div className="hidden md:flex gap-8 text-right z-10">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-mono mb-1">FUNDING RATE</span>
                                <span className="text-sm font-bold text-green-400">+0.0150%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-mono mb-1">24H HIGH</span>
                                <span className="text-sm font-bold">$154.20</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-mono mb-1">24H LOW</span>
                                <span className="text-sm font-bold">$138.50</span>
                            </div>
                        </div>
                    </div>

                    {/* Live Chart Panel */}
                    <div className="glass-panel p-6 rounded-2xl flex-1 relative flex flex-col">
                        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 text-xs font-mono">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div> <span>LIVE PRICE</span>
                            <div className="w-2 h-2 bg-red-500 rounded-full ml-4"></div> <span>TARGET DROP</span>
                        </div>
                        <LiveChart currentPrice={price} targetDropPercent={targetDrop} />
                    </div>
                </div>

                {/* Column 2: Order Book & Liquidation (Spans 4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Execution Form */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-transparent"></div>
                        
                        <div className="flex items-center gap-3">
                            <Crosshair className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-bold tracking-widest text-white">DEEP NEEDLE GİRİŞİ</h3>
                        </div>

                        <div className="space-y-5">
                            {/* Amount */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                                    <label>RİSK MİKTARI (SOL)</label>
                                </div>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="number" 
                                        value={amount}
                                        step="0.1"
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
                                        disabled={isProcessing}
                                    />
                                </div>
                            </div>

                            {/* Leverage */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-gray-400 font-mono">KALDIRAÇ (LEVERAGE)</label>
                                <div className="flex gap-2">
                                    {['1', '2', '5', '10', '25'].map(x => (
                                        <button 
                                            key={x}
                                            onClick={() => setLeverage(x)}
                                            disabled={isProcessing}
                                            className={`flex-1 py-2 rounded-lg text-xs font-mono border transition-all ${leverage === x ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#0a0a0a] border-white/10 text-gray-500 hover:border-white/30'}`}
                                        >
                                            {x}x
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Target Drop */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-gray-400 font-mono">HEDEF ÇÖKÜŞ ORANI</label>
                                    <span className="text-red-400 font-mono font-bold">-%{targetDrop} DROP</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="50" 
                                    value={targetDrop}
                                    onChange={(e) => setTargetDrop(e.target.value)}
                                    className="w-full accent-blue-500"
                                    disabled={isProcessing}
                                />
                                <div className="text-[10px] text-gray-500 font-mono flex justify-between">
                                    <span>Safe</span>
                                    <span>Degen</span>
                                </div>
                            </div>
                        </div>

                        {/* Execute Button */}
                        <div className="mt-2">
                            <button 
                                onClick={handleExecute}
                                disabled={isProcessing}
                                className={`w-full relative overflow-hidden group font-bold tracking-widest py-4 rounded-xl transition-all ${isProcessing ? 'bg-blue-900 text-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] active:scale-95'}`}
                            >
                                {!isProcessing && (
                                    <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                )}
                                <div className="flex items-center justify-center gap-2">
                                    {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {isProcessing ? "İŞLEM ONAYLANIRKEN BEKLEYİN..." : "İĞNEYİ KUR"}
                                </div>
                            </button>
                        </div>

                        {/* Success Message */}
                        {txHash && (
                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs font-mono text-green-400 break-all text-center">
                                İŞLEM BAŞARILI!<br/>
                                <a href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} target="_blank" rel="noreferrer" className="underline hover:text-green-300">
                                    TxHash: {txHash.substring(0,20)}...
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Liquidation Feed Panel */}
                    <div className="glass-panel p-4 rounded-2xl flex-1 flex flex-col relative overflow-hidden">
                        <LiquidationFeed />
                    </div>

                </div>
            </div>

        </main>
    );
}
