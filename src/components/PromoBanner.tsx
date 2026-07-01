"use client";

import { Gift, RefreshCw, Crown, ArrowRight } from "lucide-react";

const promos = [
  {
    icon: Gift,
    title: "HOŞGELDİN BONUSU",
    subtitle: "İlk Yatırıma %100",
    description: "İlk kripto yatırımına %100 bonus. Maksimum $1,000 bonus ile oynamaya başla.",
    cta: "HEMEN YATIR",
    gradient: "from-[#16a34a] to-emerald-800",
    glowColor: "rgba(22, 163, 74, 0.15)",
    borderColor: "border-[#16a34a]/30",
  },
  {
    icon: RefreshCw,
    title: "HAFTALIK CASHBACK",
    subtitle: "%15 Kayıp İadesi",
    description: "Her Pazartesi kayıplarının %15'i otomatik olarak hesabına yansır. VIP seviyene göre %25'e kadar.",
    cta: "DETAYLAR",
    gradient: "from-blue-600 to-blue-900",
    glowColor: "rgba(37, 99, 235, 0.15)",
    borderColor: "border-blue-500/30",
  },
  {
    icon: Crown,
    title: "VIP PROGRAM",
    subtitle: "Diamond Elite",
    description: "Özel VIP yöneticisi, yüksek limitler, hızlı para çekme ve eksklüzif turnuva davetleri.",
    cta: "VIP OL",
    gradient: "from-[#d4af37] to-amber-800",
    glowColor: "rgba(212, 175, 55, 0.15)",
    borderColor: "border-[#d4af37]/30",
  },
];

export default function PromoBanner() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
      {promos.map((promo, idx) => {
        const Icon = promo.icon;
        return (
          <div
            key={idx}
            className={`relative group rounded-2xl border ${promo.borderColor} bg-[#0a0a0a] p-6 overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
            style={{ boxShadow: `0 0 40px ${promo.glowColor}` }}
          >
            {/* Background Gradient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${promo.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                 style={{ background: promo.glowColor }}></div>

            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${promo.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{promo.title}</p>
              <h3 className="text-xl font-black text-white mb-2">{promo.subtitle}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">{promo.description}</p>
              
              <button className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-gradient-to-r ${promo.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                {promo.cta} <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
