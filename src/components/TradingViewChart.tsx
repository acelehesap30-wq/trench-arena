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
  
  // Create mock historical candlestick data for SOL/USD
  const [data] = useState(() => {
    const historical = [];
    let time = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    let lastClose = 145.0;
    
    for(let i=0; i<60; i++) {
      const open = lastClose;
      const change = (Math.random() - 0.5) * 2;
      const close = open + change;
      const high = Math.max(open, close) + Math.random();
      const low = Math.min(open, close) - Math.random();
      
      historical.push({
        time: time as any, // lightweight-charts expects UTCTimestamp
        open,
        high,
        low,
        close
      });
      lastClose = close;
      time += 60; // 1 minute per candle
    }
    return historical;
  });

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
    
    // Initial resize to fit container
    setTimeout(handleResize, 0);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  // Update live price
  useEffect(() => {
    if (!seriesRef.current || !currentPrice) return;
    
    const price = parseFloat(currentPrice);
    const lastData = data[data.length - 1];
    
    // Simulate live ticking by updating the last candle
    seriesRef.current.update({
      time: Math.floor(Date.now() / 1000) as any,
      open: lastData.close,
      high: Math.max(lastData.close, price),
      low: Math.min(lastData.close, price),
      close: price,
    });
  }, [currentPrice, data]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
       {!currentPrice && (
         <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <span className="text-gray-400 font-mono text-sm animate-pulse">CONNECTING TO PYTH...</span>
         </div>
       )}
       <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
    </div>
  );
}
