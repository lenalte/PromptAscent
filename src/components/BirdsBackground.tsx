
'use client';
import React, { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        p5: any;
    }
}

const BirdsBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const p5InstanceRef = useRef<any>(null); // Ref to store p5 instance

    useEffect(() => {
        setIsClient(true); // Component has mounted on the client
    }, []);

    useEffect(() => {
        if (!isClient || typeof window === 'undefined') {
            return;
        }

        let localP5Instance: any = null; // Variable to hold the instance for cleanup

        const loadP5 = async () => {
            if (window.p5 && p5InstanceRef.current) {
                // p5 already loaded and sketch might be running, or was cleaned up
                // If p5InstanceRef.current exists, it means sketch was initialized
                // If not, means it was cleaned up, so reinitialize
                if (!p5InstanceRef.current) initializeSketch();
                return;
            }
            if (window.p5 && !p5InstanceRef.current) { // p5 loaded, but no instance (e.g. after hot reload)
                initializeSketch();
                return;
            }
            if (!window.p5) { // p5 script not loaded yet
                try {
                    const p5Script = document.createElement('script');
                    p5Script.src = '/lib/p5.js'; // Ensure p5.js is in public/lib/
                    p5Script.async = true;

                    await new Promise((resolve, reject) => {
                        p5Script.onload = resolve;
                        p5Script.onerror = reject;
                        document.body.appendChild(p5Script);
                    });
                    console.log('p5.js dynamically loaded');
                    initializeSketch();
                } catch (error) {
                    console.error('Error loading p5.js:', error);
                }
            }
        };

        const getCssVariableColor = (variableName: string) => {
            if (typeof document !== 'undefined') {
                const computedStyle = getComputedStyle(document.documentElement);
                const hslValue = computedStyle.getPropertyValue(variableName).trim();
                if (hslValue) {
                    return `hsl(${hslValue})`;
                }
            }
            return '#000000'; // Fallback
        };

        const initializeSketch = () => {
            if (!containerRef.current || p5InstanceRef.current) return; // Don't re-initialize if already exists

            localP5Instance = new window.p5((p: any) => {
                const birdsNumber = 15;
                const birds: any[] = [];
                let backgroundColor: string;
                let birdColor: string;

                interface BirdType {
                    pos: any;
                    angle: number;
                    vel: number;
                    flap: number;
                    draw: () => void;
                }
                type BirdConstructor = new () => BirdType;

                p.setup = function () {
                    const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                    backgroundColor = getCssVariableColor('--background');
                    birdColor = getCssVariableColor('--foreground');
                    if (containerRef.current) {
                         canvas.parent(containerRef.current);
                    }
                    for (let i = 0; i < birdsNumber; i++) {
                        birds.push(new (bird_c as unknown as BirdConstructor)());
                    }
                };

                p.windowResized = function () {
                    p.resizeCanvas(window.innerWidth, window.innerHeight);
                    backgroundColor = getCssVariableColor('--background');
                    birdColor = getCssVariableColor('--foreground');
                };

                p.draw = function () {
                    p.background(backgroundColor);
                    for (let i = 0; i < birds.length; i++) {
                        birds[i].draw();
                    }
                };

                function bird_c(this: BirdType) {
                    this.pos = p.createVector(
                        p.random(p.width * 0.2, p.width * 0.8),
                        p.random(p.height * 0.2, p.height * 0.8)
                    );
                    this.angle = p.random(p.TWO_PI);
                    this.vel = p.random(1.5, 3);
                    this.flap = p.random(0, p.TWO_PI);

                    this.draw = function () {
                        if (!isFinite(this.angle) || !isFinite(this.vel)) return;
                        this.pos.add(p.createVector(Math.cos(this.angle) * this.vel, Math.sin(this.angle) * this.vel));

                        if (this.pos.x > p.width * 1.1 || this.pos.x < -p.width * 0.1 || this.pos.y > p.height * 1.1 || this.pos.y < -p.height * 0.1) {
                             this.pos = p.createVector(
                                p.random(p.width * 0.2, p.width * 0.8),
                                p.random(p.height * 0.2, p.height * 0.8)
                            );
                            this.vel = p.random(1.5, 3);
                            this.flap = p.random(0, p.TWO_PI);
                            this.angle = p.random(p.TWO_PI);
                        }

                        this.flap += this.vel * 0.05;
                        p.noStroke();
                        p.fill(birdColor);

                        // Simplified pixel bird drawing
                        const birdSize = 8;
                        p.rect(this.pos.x, this.pos.y, birdSize, birdSize); // Body
                        // Wings based on flap
                        const wingOffset = birdSize * 1.5 * p.sin(this.flap);
                        p.rect(this.pos.x - birdSize, this.pos.y + wingOffset/2, birdSize/2, birdSize/2);
                        p.rect(this.pos.x + birdSize, this.pos.y - wingOffset/2, birdSize/2, birdSize/2);
                    };
                }
            }, containerRef.current);
            p5InstanceRef.current = localP5Instance;
        };

        loadP5();

        return () => {
            if (p5InstanceRef.current) {
                p5InstanceRef.current.remove();
                p5InstanceRef.current = null;
                console.log('p5 instance removed');
            }
             // Clean up script tag if added by this component instance
            const existingScript = document.querySelector('script[src="/lib/p5.js"]');
            if (existingScript && existingScript.parentElement === document.body) {
                // Be cautious about removing if other components might need it,
                // but for a dedicated background, it's safer.
                // document.body.removeChild(existingScript);
                // console.log('p5.js script tag potentially removed');
            }
        };
    }, [isClient]);

    if (!isClient) {
        return null; // Render nothing on the server
    }

    return (
        <div
            ref={containerRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
        />
    );
};

export default BirdsBackground;
