
export type BossIconType = 'ShieldAlert' | 'BossIcon' | 'Sword';

export interface Boss {
  id: string;
}

export const BOSS_LIBRARY: Boss[] = [
  { id: 'boss-1' },
];

export const getRandomBoss = (): Boss => {
  return BOSS_LIBRARY[0];
};

export const getBossById = (id: string): Boss | undefined => {
  return BOSS_LIBRARY.find(boss => boss.id === id);
};

    