
export interface Level {
  id: string;
  title: string;
  lessonIds: string[];
}

export const LEVELS: Level[] = [
  {
    id: 'level-1',
    title: 'Level 1: Foundations',
    lessonIds: [
      'intro-prompt-engineering',
      'lp-combining-techniques',
      'lp-showing-examples',
      'lp-formalizing-prompts',
    ],
  },
  {
    id: 'level-2',
    title: 'Level 2: Core Techniques',
    lessonIds: [
      'lp-giving-instructions',
      'lp-pitfalls-of-llms',
      'lp-priming-chatbots',
      'lp-prompt-engineering-intro',
    ],
  },
  {
    id: 'level-3',
    title: 'Level 3: Advanced Concepts',
    lessonIds: [
      'lp-prompting-with-chatgpt',
      'lp-assigning-roles',
      'lp-understanding-ai-minds',
    ],
  },
];

export function getLevelForLessonId(lessonId: string): Level | undefined {
  return LEVELS.find(level => level.lessonIds.includes(lessonId));
}
