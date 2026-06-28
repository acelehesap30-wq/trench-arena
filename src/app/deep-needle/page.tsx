"use client";

import { usePythPrice } from "@/hooks/usePythPrice";
import { ArrowLeft, Zap, Crosshair, Wallet, Activity, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import TradingViewChart from "@/components/TradingViewChart";
import OrderBook from "@/components/OrderBook";
import PositionsTable from "@/components/PositionsTable";
import { createBetTransaction } from "@/utils/solana";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function DeepNeedleTerminal() {
    const { price, trend } = usePythPrice();
    const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET' | 'STOP'>('LIMIT');
    const [amount, setAmount] = useState("0.1");
    const [targetDrop, setTargetDrop] = useState("5"); 
    const [leverage, setLeverage] = useState("10");
    
    // Web3 State
    const { connection } = useConnection();
    const { connected, publicKey, sendTransaction } = useWallet();
    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const handleExecute = async () => {
        if (!connected || !publicKey) {
            alert("Lütfen önce cüzdanınızı bağlayın!");
            return;
        }

        if (parseFloat(amount) <= 0) {
            alert("Geçerli bir SOL miktarı giriniz.");
            return;
        }
        
        try {
            setIsProcessing(true);
            setTxHash(null);

            const transaction = await createBetTransaction(connection, publicKey, parseFloat(amount));
            const signature = await sendTransaction(transaction, connection);
            
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            });

            setTxHash(signature);

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
                alert("Devnet cüzdanınızda yeterli bakiye (SOL) yok!");
            } else {
                alert("İşlem başarısız oldu. Logları kontrol edin.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col bg-[#0b0e11] text-gray-300 font-sans text-sm selection:bg-blue-900 overflow-x-hidden">
            
            {/* Top Navigation Bar */}
            <nav className="h-14 bg-[#181a20] border-b border-white/5 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-bold tracking-widest text-white">TRENCH</span>
                    </Link>
                    
                    <div className="hidden md:flex items-center gap-6 text-xs font-mono font-bold">
                        <span className="text-white">DEEP NEEDLE</span>
                        <Link href="/" className="text-gray-500 hover:text-white transition-colors">DEAD CAT BOUNCE</Link>
                        <Link href="/" className="text-gray-500 hover:text-white transition-colors">DCA MASASI</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex gap-4">
                        <div className="px-3 py-1 bg-white/5 rounded flex items-center gap-2 text-xs font-mono text-green-400">
                            <Activity className="w-3 h-3" /> VOL: $1.2B
                        </div>
                        <div className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded flex items-center gap-2 text-xs font-mono">
                            <AlertTriangle className="w-3 h-3" /> DEVNET
                        </div>
                    </div>
                    <WalletMultiButtonDynamic />
                </div>
            </nav>

            {/* Trading Ticker Tape */}
            <div className="h-16 border-b border-white/5 bg-[#181a20] flex items-center px-6 gap-8 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white flex items-center gap-2">
                            SOL/USD
                            {trend === 'up' && <span className="text-sm text-green-500">▲</span>}
                            {trend === 'down' && <span className="text-sm text-red-500">▼</span>}
                        </span>
                        <a href="https://pyth.network" target="_blank" className="text-[10px] text-blue-400 font-mono underline hover:text-blue-300">Pyth Oracle</a>
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="flex flex-col font-mono text-xs">
                        <span className="text-gray-500">Anlık Fiyat</span>
                        <span className={`text-lg font-bold ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-white'}`}>
                            {price ? `$${price}` : '...'}
                        </span>
                    </div>
                    <div className="flex flex-col font-mono text-xs">
                        <span className="text-gray-500">24s Değişim</span>
                        <span className="text-green-500 font-bold">+2.45%</span>
                    </div>
                    <div className="hidden sm:flex flex-col font-mono text-xs">
                        <span className="text-gray-500">24s En Yüksek</span>
                        <span className="text-white font-bold">$154.20</span>
                    </div>
                    <div className="hidden md:flex flex-col font-mono text-xs">
                        <span className="text-gray-500">24s En Düşük</span>
                        <span className="text-white font-bold">$138.50</span>
                    </div>
                    <div className="hidden lg:flex flex-col font-mono text-xs">
                        <span className="text-gray-500">Fonlama (Funding)</span>
                        <span className="text-amber-500 font-bold">0.0150%</span>
                    </div>
                </div>
            </div>

            {/* 4-Zone Pro Terminal Layout */}
            <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                
                {/* Left: Orderbook (Spans ~250px) */}
                <div className="hidden lg:flex flex-col w-[250px] border-r border-white/5 bg-[#181a20] p-2 overflow-hidden shrink-0">
                    <OrderBook currentPrice={price} />
                </div>

                {/* Middle: Chart + Positions (Flexible width) */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top: TradingView Chart */}
                    <div className="flex-1 min-h-[400px] border-b border-white/5 bg-[#0b0e11] p-1 relative">
                        <TradingViewChart currentPrice={price} />
                    </div>
                    
                    {/* Bottom: Positions Table (Spans ~300px height) */}
                    <div className="h-[300px] bg-[#181a20] p-4 overflow-hidden">
                        <PositionsTable currentPrice={price} />
                    </div>
                </div>

                {/* Right: Order Entry Panel (Spans ~320px) */}
                <div className="w-full xl:w-[320px] border-l border-white/5 bg-[#181a20] p-4 flex flex-col overflow-y-auto shrink-0">
                    
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-white font-bold tracking-widest flex items-center gap-2">
                            <Crosshair className="w-4 h-4 text-blue-500" /> DEEP NEEDLE
                        </h2>
                    </div>

                    {/* Order Type Tabs */}
                    <div className="flex bg-[#0b0e11] p-1 rounded-md mb-6 font-mono text-xs">
                        {['LIMIT', 'MARKET', 'STOP'].map(type => (
                            <button 
                                key={type}
                                onClick={() => setOrderType(type as any)}
                                className={`flex-1 py-1.5 rounded text-center transition-colors ${orderType === type ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-white'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 flex-1">
                        {/* Amount Input */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-gray-500 font-mono">
                                <label>Risk (SOL)</label>
                                <span>Bakiye: --</span>
                            </div>
                            <div className="flex items-center bg-[#0b0e11] border border-white/5 rounded-md focus-within:border-blue-500/50 transition-colors">
                                <input 
                                    type="number" 
                                    value={amount}
                                    step="0.1"
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-transparent text-white font-mono p-2 text-right outline-none"
                                    disabled={isProcessing}
                                />
                                <span className="text-xs text-gray-500 font-mono pr-3 pl-2">SOL</span>
                            </div>
                        </div>

                        {/* Leverage Buttons */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500 font-mono">Kaldıraç</label>
                            <div className="flex gap-1 font-mono text-xs">
                                {['1', '5', '10', '25', '50'].map(x => (
                                    <button 
                                        key={x}
                                        onClick={() => setLeverage(x)}
                                        disabled={isProcessing}
                                        className={`flex-1 py-1.5 rounded transition-all ${leverage === x ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-[#0b0e11] border border-white/5 text-gray-500 hover:border-white/20'}`}
                                    >
                                        {x}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Target Drop Slider */}
                        <div className="flex flex-col gap-2 pt-2">
                            <div className="flex justify-between items-center text-xs font-mono">
                                <label className="text-gray-500">Çöküş Hedefi</label>
                                <span className="text-red-400 font-bold">-%{targetDrop} DROP</span>
                            </div>
                            <input 
                                type="range" min="1" max="50" 
                                value={targetDrop}
                                onChange={(e) => setTargetDrop(e.target.value)}
                                className="w-full accent-blue-500"
                                disabled={isProcessing}
                            />
                        </div>

                        {/* Order Summary Stats */}
                        <div className="bg-[#0b0e11] p-3 rounded-md border border-white/5 space-y-2 text-xs font-mono mt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Maliyet</span>
                                <span className="text-white">{amount} SOL</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Nominal Pozisyon</span>
                                <span className="text-white">{(parseFloat(amount) * parseInt(leverage)).toFixed(2)} SOL</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tetikleme Fiyatı</span>
                                <span className="text-amber-400">
                                    ${(parseFloat(price || "0") * (1 - parseFloat(targetDrop)/100)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Execute Button */}
                    <div className="mt-4 shrink-0">
                        <button 
                            onClick={handleExecute}
                            disabled={isProcessing}
                            className={`w-full font-bold tracking-widest py-3 rounded text-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.98] ${isProcessing ? 'bg-blue-900/50 text-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isProcessing ? "ONAY BEKLENİYOR" : "LONG DEEP NEEDLE"}
                            </div>
                        </button>
                    </div>

                    {/* Success Feedback */}
                    {txHash && (
                        <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded text-[10px] font-mono text-green-400 break-all text-center">
                            EMİR AĞA İLETİLDİ!<br/>
                            <a href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} target="_blank" rel="noreferrer" className="underline hover:text-green-300">
                                TxHash: {txHash.substring(0,16)}...
                            </a>
                        </div>
                    )}

                </div>
            </div>

        </main>
    );
}
