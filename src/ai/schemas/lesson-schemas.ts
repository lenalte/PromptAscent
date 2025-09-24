
import { z } from 'genkit';

export const BaseLessonItemSchema = z.object({
  id: z.string().describe("Unique string ID for the item within this lesson (e.g., 's1_item1', 's2_item_mcq1'). Should be unique across all stages of a lesson."),
  title: z.string().describe('Meaningful title for the lesson item.'),
  pointsAwarded: z.number().int().nonnegative().describe('Points awarded for successful completion of this item.'),
});

export const FreeResponseLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.enum(['freeResponse']).describe("The type of the lesson item."),
  question: z.string().describe('The free response question for the user.'),
  expectedAnswer: z.string().describe('A concise example or description of the expected answer, used for AI validation guidance and to inform the user if they get it wrong.'),
  pointsForIncorrect: z.number().int().min(0).max(0).default(0).describe('Points deducted for a wrong answer (always 0 for this type as per rules).'),
});
export type FreeResponseLessonItem = z.infer<typeof FreeResponseLessonItemSchema>;

export const MultipleChoiceLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.enum(['multipleChoice']).describe("The type of the lesson item."),
  question: z.string().describe('The multiple choice question for the user.'),
  options: z.array(z.string()).min(2).max(5).describe('An array of 2 to 5 string options for the multiple choice question.'),
  correctOptionIndex: z.number().int().nonnegative().describe('The 0-based index of the correct option in the options array.'),
  pointsForIncorrect: z.number().int().min(0).max(0).default(0).describe('Points deducted for a wrong answer (always 0 for this type as per rules).'),
});
export type MultipleChoiceLessonItem = z.infer<typeof MultipleChoiceLessonItemSchema>;

export const InformationalSnippetLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.enum(['informationalSnippet']).describe("The type of the lesson item."),
  content: z.string().describe('The informational content/text for the snippet. This should be a key takeaway or explanation derived from the lesson text.'),
});
export type InformationalSnippetLessonItem = z.infer<typeof InformationalSnippetLessonItemSchema>;

export const PromptingTaskLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.enum(['promptingTask']).describe("The type of the lesson item."),
  taskDescription: z.string().describe('A detailed description of what the user\'s prompt should achieve. This should guide the user to apply techniques from the lesson content.'),
  evaluationGuidance: z.string().describe('Specific, numbered criteria (3-5 points) for the AI to evaluate the user\'s submitted prompt for THIS task. These criteria should relate to the application of concepts from the lesson text.'),
  pointsForIncorrect: z.number().int().min(0).max(0).default(0).describe('Points deducted for an ineffective prompt (always 0 for this type as per rules).'),
});
export type PromptingTaskLessonItem = z.infer<typeof PromptingTaskLessonItemSchema>;

// LikertScale nur für Evaluationszwecke erstellt
export const LikertScaleLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.enum(['likertScale']).describe("The type of the lesson item."),
  question: z.string().describe('The Likert scale question for the user.'),
  // Options are fixed for a 5-point scale, so they don't need to be in the schema
});
export type LikertScaleLessonItem = z.infer<typeof LikertScaleLessonItemSchema>;


export const LessonItemSchema = z.discriminatedUnion('type', [
  FreeResponseLessonItemSchema,
  MultipleChoiceLessonItemSchema,
  InformationalSnippetLessonItemSchema,
  PromptingTaskLessonItemSchema,
  LikertScaleLessonItemSchema, // Add the new type here
]);
export type LessonItem = z.infer<typeof LessonItemSchema>;

export const LessonStageSchema = z.object({
  id: z.string().describe("Unique ID for the stage (e.g., 'stage1', 'stage2')."),
  title: z.string().describe("Title of the stage (e.g., 'Stage 1: Verstehen')."),
  items: z.array(LessonItemSchema).describe("Array of lesson items for this stage. Item IDs within should be unique across the entire lesson."),
});
export type LessonStage = z.infer<typeof LessonStageSchema>;

export const LessonSchema = z.object({
  id: z.string().describe('Unique string identifier for the lesson (e.g., "intro-prompt-engineering").'),
  title: z.string().describe('The main title of the lesson.'),
  description: z.string().describe('A brief description of what the lesson covers.'),
  stages: z.array(LessonStageSchema).length(6).describe('An array of exactly 6 lesson stages, generated based on the raw lesson content.'),
});
export type Lesson = z.infer<typeof LessonSchema>;

// Helper types for UserProgress, not part of AI generation schema
export type StageItemStatus = {
  attempts: number;
  correct: boolean | null; // null if not yet attempted, true if correct, false if incorrect on last attempt
  points?: number; // Added to store points calculated on submission
  // answer?: number; // For Likert scale answer
};

export type StageStatusValue = 'locked' | 'unlocked' | 'in-progress' | 'completed-perfect' | 'completed-good' | 'failed-stage';

export type BossChallengeQuestionStatus = {
  correct: boolean | null;
  attempts: number;
};

export type BossChallenge = {
  bossId: string;
  questionIds: { lessonId: string; itemId: string }[];
  questionStatus: { [questionId: string]: BossChallengeQuestionStatus };
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'skipped';
  bonusPointsAwarded?: number;
};

export type StageProgress = {
  status: StageStatusValue;
  items: { [itemId: string]: StageItemStatus }; // Status of each item within the stage
  pointsEarned?: number; // Points earned in this specific stage
  hasBoss?: boolean;
  bossDefeated?: boolean;
  bossChallenge?: BossChallenge;
};

// This type represents a question fetched for a boss challenge, including its content.
export type BossQuestion = {
  lessonId: string;
  item: LessonItem;
};
