"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface TradingViewChartProps {
  currentPrice: string | null;
}

export default function TradingViewChart({ currentPrice }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/binance/klines?symbol=SOLUSDT&interval=1m&limit=100');
        const json = await res.json();
        
        if (Array.isArray(json)) {
          const formatted = json.map(item => ({
            time: item[0] / 1000 as any, // Unix timestamp in seconds
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
          }));
          setData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch klines:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      crosshair: {
        mode: 1, // Magnet
      }
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candleSeries.setData(data);
    
    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 0);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  // Update live price via Pyth Network Current Price
  useEffect(() => {
    if (!seriesRef.current || !currentPrice || data.length === 0) return;
    
    const price = parseFloat(currentPrice);
    if (isNaN(price)) return;
    
    const lastData = data[data.length - 1];
    
    // Create new candle if time elapsed, else update current
    const currentTime = Math.floor(Date.now() / 1000);
    const lastTime = lastData.time as number;
    
    if (currentTime - lastTime >= 60) {
      // New minute candle
      const newCandle = {
        time: currentTime as any,
        open: lastData.close,
        high: Math.max(lastData.close, price),
        low: Math.min(lastData.close, price),
        close: price,
      };
      seriesRef.current.update(newCandle);
      setData(prev => [...prev, newCandle]);
    } else {
      // Update existing candle
      seriesRef.current.update({
        time: lastData.time,
        open: lastData.open,
        high: Math.max(lastData.high, price),
        low: Math.min(lastData.low, price),
        close: price,
      });
    }
  }, [currentPrice, data]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
       {loading && (
         <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <span className="text-gray-400 font-mono text-sm animate-pulse">GRAFİK VERİSİ YÜKLENİYOR...</span>
         </div>
       )}
       <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
    </div>
  );
}
