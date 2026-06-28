"use client";

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function BackgroundEngine() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Pixi Application
        const app = new PIXI.Application({
            view: canvasRef.current,
            resizeTo: window,
            transparent: true,
            antialias: true,
            backgroundAlpha: 0,
        });

        appRef.current = app as unknown as PIXI.Application; // bypass strict type for older pixi ver if any

        // Create particles
        const particles: PIXI.Graphics[] = [];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const isSpike = Math.random() > 0.9;
            const color = isSpike ? (Math.random() > 0.5 ? 0xef4444 : 0x3b82f6) : 0xffffff; // Red, Blue or White
            const alpha = isSpike ? 0.3 : 0.05;

            const p = new PIXI.Graphics();
            p.beginFill(color, alpha);
            p.drawRect(0, 0, Math.random() * 2 + 1, Math.random() * 20 + 10);
            p.endFill();

            p.x = Math.random() * window.innerWidth;
            p.y = Math.random() * window.innerHeight;
            
            // Custom properties for animation
            (p as any).speedY = Math.random() * 2 + 0.5;
            
            app.stage.addChild(p);
            particles.push(p);
        }

        // Animation Loop
        app.ticker.add(() => {
            particles.forEach((p) => {
                p.y += (p as any).speedY;
                if (p.y > window.innerHeight) {
                    p.y = -50;
                    p.x = Math.random() * window.innerWidth;
                }
            });
        });

        return () => {
            app.destroy(false, { children: true });
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-60" 
        />
    );
}
