export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  levelId: string; // The level required to unlock this badge
}

export const BADGES: Badge[] = [
  {
    id: 'badge-basics-completed',
    name: 'Basics-Meister',
    description: 'Für den Abschluss aller Lektionen im "Basics"-Level.',
    imageUrl: '/assets/images/Level1_badge.png',
    levelId: 'level-1',
  },
  {
    id: 'badge-application-completed',
    name: 'Anwendungs-Profi',
    description: 'Für den Abschluss aller Lektionen im "Application"-Level.',
    imageUrl: '/assets/images/Level2_badge.png',
    levelId: 'level-2',
  },
  {
    id: 'badge-intermediate-completed',
    name: 'Fortgeschrittener-Experte',
    description: 'Für den Abschluss aller Lektionen im "Intermediate"-Level.',
    imageUrl: '/assets/images/Level3_badge.png',
    levelId: 'level-3',
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(badge => badge.id === id);
}
