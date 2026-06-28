"use client";

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function BackgroundEngine() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        let isMounted = true;
        const app = new PIXI.Application();
        appRef.current = app;

        const initPixi = async () => {
            // PixiJS v8 initialization
            await app.init({
                canvas: canvasRef.current as HTMLCanvasElement,
                resizeTo: window,
                antialias: true,
                backgroundAlpha: 0,
            });

            if (!isMounted) return;

            // Create particles
            const particles: PIXI.Graphics[] = [];
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const isSpike = Math.random() > 0.9;
                const color = isSpike ? (Math.random() > 0.5 ? 0xef4444 : 0x3b82f6) : 0xffffff;
                const alpha = isSpike ? 0.3 : 0.05;

                const p = new PIXI.Graphics();
                p.rect(0, 0, Math.random() * 2 + 1, Math.random() * 20 + 10);
                p.fill({ color, alpha }); // v8 syntax for fill

                p.x = Math.random() * window.innerWidth;
                p.y = Math.random() * window.innerHeight;
                
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
        };

        initPixi();

        return () => {
            isMounted = false;
            app.destroy(true, { children: true });
        };
    }, []);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-60" 
        />
    );
}
