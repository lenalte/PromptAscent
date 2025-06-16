'use client';
import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        p5: any;
    }
}

const BirdsBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Sicherstellen, dass wir im Browser sind
        if (typeof window === 'undefined') return;

        let p5Instance: any = null;

        // P5.js laden
        const loadP5 = async () => {
            // Wenn p5 bereits existiert, nicht neu laden
            if (window.p5) {
                initializeSketch();
                return;
            }

            try {
                // p5.js über Script-Tag laden
                const p5Script = document.createElement('script');
                p5Script.src = '/lib/p5.js';
                p5Script.async = true;

                // Warten bis p5.js geladen ist
                await new Promise((resolve, reject) => {
                    p5Script.onload = resolve;
                    p5Script.onerror = reject;
                    document.body.appendChild(p5Script);
                });

                console.log('p5.js erfolgreich geladen');
                initializeSketch();
            } catch (error) {
                console.error('Fehler beim Laden von p5.js:', error);
            }
        };

        // CSS-Variablen aus dem DOM lesen
        const getCssVariableColor = (variableName: string) => {
            const computedStyle = getComputedStyle(document.documentElement);
            const hslValue = computedStyle.getPropertyValue(variableName).trim();

            // Wenn der Wert im Format "H S% L%" ist
            if (hslValue) {
                return `hsl(${hslValue})`;
            }
            return '#000000'; // Fallback
        };

        // Den Sketch initialisieren, nachdem p5.js geladen wurde
        const initializeSketch = () => {
            // p5 ist jetzt geladen, Sketch erstellen
            p5Instance = new window.p5((p: any) => {
                const zoom = 500;
                const s = 10;
                const k = 0;
                const birdsNumber = 15;
                const birds: any[] = [];

                // Farben aus CSS-Variablen
                let backgroundColor: string;
                let birdColor: string;

                // Bird class type definition
                interface BirdType {
                    pos: any;
                    angle: number;
                    vel: number;
                    flap: number;
                    draw: () => void;
                }

                // Bird constructor type
                type BirdConstructor = new () => BirdType;

                p.setup = function () {
                    const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
                    /* p.background(255); */
                    // Farben aus CSS-Variablen holen
                    backgroundColor = getCssVariableColor('--background');
                    birdColor = getCssVariableColor('--foreground');

                    // Canvas dem Container hinzufügen
                    if (containerRef.current) {
                        canvas.parent(containerRef.current);
                    }

                    // Vögel erstellen
                    for (let i = 0; i < birdsNumber; i++) {
                        birds.push(new (bird_c as unknown as BirdConstructor)());
                    }
                };

                p.windowResized = function () {
                    p.resizeCanvas(window.innerWidth, window.innerHeight);

                    // Farben bei Größenänderung aktualisieren (falls sich das Theme ändert)
                    backgroundColor = getCssVariableColor('--background');
                    birdColor = getCssVariableColor('--foreground');
                };

                p.draw = function () {
                    p.background(backgroundColor);

                    // Alle Vögel zeichnen
                    for (let i = 0; i < birds.length; i++) {
                        birds[i].draw();
                    }
                };

                // Flapping bird class
                function bird_c(this: BirdType) {
                    // Variablen für jeden Vogel
                    this.pos = p.createVector(
                        p.random(p.width * 0.2, p.width * 0.8),
                        p.random(p.height * 0.2, p.height * 0.8)
                    );

                    this.angle = Math.max(0, Math.min(p.random(p.TWO_PI, p.TWO_PI * 1), p.TWO_PI));
                    this.vel = Math.max(0, Math.min(p.random(2, 5), 5));
                    this.flap = p.random(0, p.TWO_PI);

                    this.draw = function () {
                        if (!isFinite(this.angle) || !isFinite(this.vel)) {
                            console.error('Ungültiger Winkel oder Geschwindigkeit:', this.angle, this.vel);
                            return;
                        }

                        this.pos.add(p.createVector(Math.cos(this.angle) * this.vel, Math.sin(this.angle) * this.vel));

                        if (!isFinite(this.pos.x) || !isFinite(this.pos.y)) {
                            console.error('Ungültige Position:', this.pos);
                            return;
                        }

                        // Prüfen, ob außerhalb des Bildschirms
                        if (this.pos.x > p.width * 0.9) {
                            this.pos = p.createVector(
                                p.random(p.width * 0.2, p.width * 0.8),
                                p.random(p.height * 0.2, p.height * 0.8)
                            );
                            this.vel = p.random(1.5, 3);
                            this.flap = p.random(0, p.TWO_PI);
                            this.angle = p.random(p.TWO_PI * 0.97, p.TWO_PI * 1.03);
                        }

                        // Flügelschlag erhöhen
                        this.flap += this.vel * 0.05;

                        // Drei Punkte für ein Dreieck konstruieren
                        let angle1 = this.angle;
                        let angle2 = this.angle + Math.PI;
                        let angle3 = this.angle + p.HALF_PI;

                        let p0 = p.createVector(
                            this.pos.x + Math.cos(angle2) * 5,
                            this.pos.y + Math.sin(angle2) * 5
                        );

                        let p1 = p.createVector(
                            this.pos.x + Math.cos(angle1) * 10,
                            this.pos.y + Math.sin(angle1) * 10
                        );

                        let p2 = p.createVector(
                            this.pos.x + Math.cos(angle3) * 15 * p.sin(this.flap),
                            this.pos.y + Math.sin(angle3) * 15 * p.sin(this.flap)
                        );

                        // Positionen überprüfen
                        if (!isFinite(p0.x) || !isFinite(p0.y) ||
                            !isFinite(p1.x) || !isFinite(p1.y) ||
                            !isFinite(p2.x) || !isFinite(p2.y)) {
                            return;
                        }

                        // Vogel zeichnen
                        p.noStroke();
                        p.fill(birdColor);

                        // Pixel-Vogelkörper
                        p.rect(this.pos.x, this.pos.y, 10, 10);

                        // Pixelflügel
                        p.rect(p0.x, p0.y, 4, 4);
                        p.rect(p1.x, p1.y, 4, 4);
                        p.rect(p2.x, p2.y, 4, 4);

                        // Verbindungen
                        drawConnectionRect(p0, p1);
                        drawConnectionRect(p1, p2);
                        drawConnectionRect(p2, p0);
                    };

                    function drawConnectionRect(pA: any, pB: any, step = 8) {
                        let d = p.dist(pA.x, pA.y, pB.x, pB.y);
                        let dirX = (pB.x - pA.x) / d;
                        let dirY = (pB.y - pA.y) / d;

                        for (let i = 0; i < d; i += step) {
                            let posX = pA.x + dirX * i;
                            let posY = pA.y + dirY * i;
                            p.rect(posX, posY, 6, 6);
                        }
                    }
                }
            }, containerRef.current);
        };

        loadP5();

        // Cleanup beim Unmount
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

export default BirdsBackground;