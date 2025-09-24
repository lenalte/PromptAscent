'use client';
import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        p5: any;
    }
}

const FireworkBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        let p5Instance: any = null;

        const loadP5 = async () => {
            if (window.p5) {
                initializeSketch();
                return;
            }
            try {
                const p5Script = document.createElement('script');
                p5Script.src = '/lib/p5.js';
                p5Script.async = true;

                await new Promise((resolve, reject) => {
                    p5Script.onload = resolve;
                    p5Script.onerror = reject;
                    document.body.appendChild(p5Script);
                });

                initializeSketch();
            } catch (e) {
                console.error('Fehler beim Laden von p5.js:', e);
            }
        };

        function Particle(this: any, x: number, y: number, color: any, vel?: any) {
            this.pos = window.p5 ? new window.p5.Vector(x, y) : { x, y };
            this.lifespan = 255;
            this.color = color;
            this.vel = vel || (window.p5 ? window.p5.Vector.random2D().mult(window.p5.random(2, 10)) : { x: 0, y: 0 });
            this.acc = window.p5 ? new window.p5.Vector(0, 0) : { x: 0, y: 0 };
            this.applyForce = function (force: any) {
                this.acc.add(force);
            };
            this.update = function () {
                this.vel.add(this.acc);
                this.pos.add(this.vel);
                this.acc.mult(0);
                this.lifespan -= 4;
            };
            this.show = function (p: any) {
                p.noStroke();
                p.fill(this.color[0], this.color[1], this.color[2], this.lifespan);
                p.rect(this.pos.x, this.pos.y, 5, 5); // 6x6 Pixel-Kästchen (passt du einfach an)
            };
            this.done = function () {
                return this.lifespan < 0;
            };
        }

        function Firework(this: any, p: any) {
            this.color = [p.random(100, 255), p.random(100, 255), p.random(100, 255)];

            this.firework = new (Particle as any)(
                p.width / 2,
                p.height,
                this.color,
                p.createVector(p.random(-3, 3), p.random(-18, -8))
            );

            this.exploded = false;
            this.particles = [];

            this.update = function () {
                if (!this.exploded) {
                    this.firework.applyForce(p.createVector(0, 0.2));
                    this.firework.update();
                    if (this.firework.vel.y >= 0) {
                        this.exploded = true;
                        for (let i = 0; i < 100; i++) {
                            const part = new (Particle as any)(
                                this.firework.pos.x,
                                this.firework.pos.y,
                                this.color,
                                p5Instance.constructor.Vector.random2D().mult(p.random(2, 10))
                            );
                            this.particles.push(part);
                        }
                    }
                }
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    this.particles[i].applyForce(p.createVector(0, 0.2));
                    this.particles[i].update();
                    if (this.particles[i].done()) {
                        this.particles.splice(i, 1);
                    }
                }
            };
            this.show = function () {
                if (!this.exploded) {
                    this.firework.show(p);
                }
                for (let particle of this.particles) {
                    particle.show(p);
                }
            };
            this.done = function () {
                return this.exploded && this.particles.length === 0;
            };
        }

        const initializeSketch = () => {
            p5Instance = new window.p5((p: any) => {
                let fireworks: any[] = [];

                p.setup = function () {
                    const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                    p.colorMode(p.RGB, 255, 255, 255, 255);
                    p.background(20, 0, 51);

                    if (containerRef.current) {
                        canvas.parent(containerRef.current);
                    }
                };

                p.windowResized = function () {
                    p.resizeCanvas(window.innerWidth, window.innerHeight);
                    p.background(20, 0, 51);
                };

                p.draw = function () {
                    // Schwarz mit trail (leicht durchsichtig)
                    p.background(20, 0, 51, 100);

                    if (p.frameCount % 40 === 0) {
                        fireworks.push(new (Firework as any)(p));
                    }

                    for (let i = fireworks.length - 1; i >= 0; i--) {
                        fireworks[i].update();
                        fireworks[i].show();
                        if (fireworks[i].done()) {
                            fireworks.splice(i, 1);
                        }
                    }
                };
            }, containerRef.current);
        };

        loadP5();

        return () => {
            if (p5Instance) {
                p5Instance.remove();
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
        />
    );
};

export default FireworkBackground;
