"use client";

import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface LiveChartProps {
  currentPrice: string | null;
  targetDropPercent: string;
}

interface DataPoint {
  time: string;
  price: number;
}

export default function LiveChart({ currentPrice, targetDropPercent }: LiveChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    if (!currentPrice) return;
    const priceVal = parseFloat(currentPrice);
    
    setData(prev => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      const newData = [...prev, { time: timeStr, price: priceVal }];
      if (newData.length > 30) newData.shift(); // Keep last 30 points (approx 30 seconds if updated per sec)
      return newData;
    });
  }, [currentPrice]);

  if (!currentPrice || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-600 font-mono text-sm animate-pulse">
        [ BAĞLANTI BEKLENİYOR... ]
      </div>
    );
  }

  const currentP = parseFloat(currentPrice);
  const targetP = currentP - (currentP * parseFloat(targetDropPercent) / 100);

  // Determine min and max for Y-Axis dynamically to make small movements visible
  const minPrice = Math.min(...data.map(d => d.price), targetP) * 0.999;
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.001;

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            tick={{ fill: '#4b5563', fontSize: 10 }}
            tickFormatter={(val) => `$${val.toFixed(2)}`}
            orientation="right"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#1f2937', color: '#fff' }}
            itemStyle={{ color: '#3b82f6' }}
            labelStyle={{ display: 'none' }}
          />
          {/* Target Drop Line */}
          <Area 
            type="monotone" 
            dataKey={() => targetP} 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            fillOpacity={0} 
            isAnimationActive={false}
          />
          {/* Actual Price Line */}
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
