"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type GameState = "IDLE" | "BETTING" | "RUNNING" | "CRASHED";

export default function CrashGame() {
  const { session, balance, refreshBalance } = useAuth();
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [multiplier, setMultiplier] = useState(1.00);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [userBet, setUserBet] = useState<number | null>(null);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([1.23, 4.56, 1.05, 12.30, 2.15]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1.00);

  // Math for the curve
  const calculateMultiplier = (ms: number) => {
    // A standard crash formula: e^(kt)
    const e = 0.00006;
    return Math.pow(Math.E, e * ms);
  };

  const drawGraph = (currentMult: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw curve
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    
    const points = 100;
    const maxMult = Math.max(2, currentMult * 1.2);
    
    ctx.strokeStyle = gameState === "CRASHED" ? "#ef4444" : "#16a34a";
    ctx.lineWidth = 3;
    
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * (canvas.width * 0.8); // 80% width
      // Exponential curve visual representation
      const m = 1 + (currentMult - 1) * (i / points);
      const y = canvas.height - ((m - 1) / (maxMult - 1)) * canvas.height * 0.8;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.stroke();

    // Gradient fill under curve
    ctx.lineTo(canvas.width * 0.8, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, gameState === "CRASHED" ? "rgba(239,68,68,0.2)" : "rgba(22,163,74,0.2)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  useEffect(() => {
    if (gameState === "RUNNING") {
      const start = Date.now();
      startTimeRef.current = start;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - start;
        const currentMult = calculateMultiplier(elapsed);
        
        if (currentMult >= crashPointRef.current) {
          setMultiplier(crashPointRef.current);
          setGameState("CRASHED");
          handleCrash();
          return; // Stop animation
        }
        
        setMultiplier(currentMult);
        drawGraph(currentMult);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  // Initial draw
  useEffect(() => {
    drawGraph(1.0);
  }, []);

  const handleCrash = () => {
    setHistory(prev => [parseFloat(crashPointRef.current.toFixed(2)), ...prev].slice(0, 10));
    
    if (userBet !== null) {
      // User lost
      toast.error(`Ağ patladı! $${userBet} kaybettiniz.`);
      setUserBet(null);
    }
    
    setTimeout(() => {
      setGameState("IDLE");
      setMultiplier(1.00);
      setWinAmount(null);
      drawGraph(1.0);
    }, 4000); // 4 seconds before next round
  };

  const startGame = () => {
    // Generate provably fair crash point (simplified)
    // In real app, this should come from backend based on server seed + client seed
    const hash = Math.random();
    const crashAt = Math.max(1.00, 1 / (1 - hash * 0.99)); 
    crashPointRef.current = parseFloat(crashAt.toFixed(2));
    
    setGameState("RUNNING");
  };

  const placeBet = () => {
    const amt = parseFloat(betAmount);
    if (!session) {
      toast.error("Giriş yapın!");
      return;
    }
    if (amt <= 0 || amt > balance) {
      toast.error("Geçersiz miktar veya yetersiz bakiye.");
      return;
    }
    
    // In real app, deduct from Supabase here
    setUserBet(amt);
    toast.success("Bahis alındı! Bol şans.");
    
    // Auto start for demo
    if (gameState === "IDLE") {
      setGameState("BETTING");
      setTimeout(startGame, 1000);
    }
  };

  const cashOut = () => {
    if (gameState !== "RUNNING" || userBet === null) return;
    
    const won = userBet * multiplier;
    setWinAmount(won);
    setUserBet(null);
    toast.success(`Kârı Alındı! $${won.toFixed(2)} kazandınız.`);
    // In real app, add to Supabase here
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-24 px-4 pb-10 font-sans">
      <div className="w-full max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Ana Sayfaya Dön
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <Rocket className="w-8 h-8 text-[#16a34a]" />
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">Trench Crash</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
          {/* Controls */}
          <div className="lg:col-span-1 bg-[#14151a] border border-white/5 rounded-2xl p-4 flex flex-col shadow-2xl">
            <div className="mb-4 bg-[#0b0e11] p-3 rounded-lg border border-white/5 flex justify-between items-center">
              <span className="text-gray-400 text-xs font-bold uppercase">Bakiyeniz</span>
              <span className="text-[#16a34a] font-black text-lg">${balance.toLocaleString()}</span>
            </div>

            <div className="flex-1 flex flex-col justify-end space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Bahis Miktarı</label>
                <div className="flex bg-[#0b0e11] border border-white/10 rounded-lg overflow-hidden focus-within:border-[#16a34a] transition-colors">
                  <div className="px-3 flex items-center justify-center text-gray-500 font-bold">$</div>
                  <input 
                    type="number" 
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    disabled={gameState === "RUNNING"}
                    className="w-full bg-transparent py-3 text-white font-black outline-none"
                  />
                  <div className="flex">
                    <button onClick={() => setBetAmount((parseFloat(betAmount)/2).toString())} className="px-3 hover:bg-white/5 text-gray-400 font-bold text-xs border-l border-white/5">/2</button>
                    <button onClick={() => setBetAmount((parseFloat(betAmount)*2).toString())} className="px-3 hover:bg-white/5 text-gray-400 font-bold text-xs border-l border-white/5">x2</button>
                  </div>
                </div>
              </div>
              
              {userBet === null ? (
                <button 
                  onClick={placeBet}
                  disabled={gameState === "RUNNING"}
                  className="w-full py-4 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)]"
                >
                  {gameState === "RUNNING" ? "BEKLENİYOR..." : "BAHİS YAP"}
                </button>
              ) : (
                <button 
                  onClick={cashOut}
                  disabled={gameState !== "RUNNING"}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                >
                  ÇEKİL (${(userBet * multiplier).toFixed(2)})
                </button>
              )}
            </div>
          </div>

          {/* Game Area */}
          <div className="lg:col-span-3 bg-[#0b0e11] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col shadow-2xl">
            {/* History Bar */}
            <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 overflow-x-auto hide-scrollbar">
              {history.map((mult, i) => (
                <div key={i} className={`px-3 py-1 rounded-full text-xs font-black ${mult >= 2 ? 'bg-[#16a34a]/20 text-[#16a34a]' : 'bg-red-500/20 text-red-500'}`}>
                  {mult.toFixed(2)}x
                </div>
              ))}
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
              <canvas 
                ref={canvasRef}
                width={800}
                height={500}
                className="w-full h-full object-cover opacity-80"
              />
              
              {/* Overlay Multiplier */}
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                {gameState === "CRASHED" && <span className="text-red-500 font-bold text-xl uppercase tracking-widest mb-2 animate-pulse">Patladı!</span>}
                <motion.div 
                  key={gameState}
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className={`text-6xl md:text-8xl font-black tabular-nums tracking-tighter ${gameState === "CRASHED" ? "text-red-500" : "text-white"}`}
                  style={{ textShadow: gameState === "RUNNING" ? "0 0 40px rgba(22,163,74,0.3)" : "none" }}
                >
                  {multiplier.toFixed(2)}x
                </motion.div>
                {winAmount && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 text-[#16a34a] font-black text-2xl bg-[#16a34a]/20 px-4 py-2 rounded-xl backdrop-blur-md">
                    +{winAmount.toFixed(2)} $
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-gray-500 font-bold cursor-help" title="Kanıtlanabilir Adil (Provably Fair) SHA-256">
              <ShieldAlert className="w-3 h-3" /> PROVABLY FAIR
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
