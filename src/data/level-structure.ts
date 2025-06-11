
export interface Level {
  id: string;
  title: string;
  lessonIds: string[];
}

const level1LessonIds: string[] = [];
for (let i = 1; i <= 11; i++) {
  level1LessonIds.push(`lesson${i}`);
}

const level2LessonIds: string[] = [];
for (let i = 12; i <= 22; i++) {
  level2LessonIds.push(`lesson${i}`);
}

const level3LessonIds: string[] = [];
for (let i = 23; i <= 34; i++) {
  level3LessonIds.push(`lesson${i}`);
}

export const LEVELS: Level[] = [
  {
    id: 'level-1',
    title: 'Basics',
    lessonIds: level1LessonIds,
  },
  {
    id: 'level-2',
    title: 'Application',
    lessonIds: level2LessonIds,
  },
  {
    id: 'level-3',
    title: 'Intermediate',
    lessonIds: level3LessonIds,
  },
];

export function getLevelForLessonId(lessonId: string): Level | undefined {
  return LEVELS.find(level => level.lessonIds.includes(lessonId));
}
