
import { Skull, ShieldAlert, Sword, type LucideIcon } from 'lucide-react';

export interface Boss {
  id: string;
  name: string;
  visual: LucideIcon;
  quote: string;
  bonusPoints: number;
}

export const BOSS_LIBRARY: Boss[] = [
  {
    id: 'boss-1',
    name: 'Der Wächter der Grundlagen',
    visual: ShieldAlert,
    quote: "Du denkst, du hast die Grundlagen gemeistert? Beweise es, bevor du weitermachst!",
    bonusPoints: 50,
  },
  {
    id: 'boss-2',
    name: 'Der Logik-Lord',
    visual: Skull,
    quote: "Worte sind leicht, aber wahre Logik ist eine scharfe Klinge. Zeig mir deine Schärfe!",
    bonusPoints: 75,
  },
  {
    id: 'boss-3',
    name: 'Der Meister der Anwendung',
    visual: Sword,
    quote: "Theorie ist nichts ohne Praxis. Wende an, was du gelernt hast, oder scheitere!",
    bonusPoints: 100,
  },
];

export const getRandomBoss = (): Boss => {
  return BOSS_LIBRARY[Math.floor(Math.random() * BOSS_LIBRARY.length)];
};

export const getBossById = (id: string): Boss | undefined => {
  return BOSS_LIBRARY.find(boss => boss.id === id);
};
