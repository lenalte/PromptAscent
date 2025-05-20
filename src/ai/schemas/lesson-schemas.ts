
import { z } from 'genkit'; // Corrected import path

export const BaseLessonItemSchema = z.object({
  id: z.number().int().positive().describe('Unique integer ID for the item within this lesson, starting from 1.'),
  title: z.string().describe('Meaningful title for the lesson item.'),
  pointsAwarded: z.number().int().nonnegative().describe('Points awarded for successful completion of this item.'),
});

export const FreeResponseLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.literal('freeResponse'),
  question: z.string().describe('The free response question for the user.'),
  expectedAnswer: z.string().describe('A concise example or description of the expected answer, used for AI validation guidance and to inform the user if they get it wrong.'),
  pointsForIncorrect: z.literal(0).describe('Points deducted for a wrong answer (always 0 for this type as per rules).'),
});
export type FreeResponseLessonItem = z.infer<typeof FreeResponseLessonItemSchema>;

export const MultipleChoiceLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.literal('multipleChoice'),
  question: z.string().describe('The multiple choice question for the user.'),
  options: z.array(z.string()).min(2).max(5).describe('An array of 2 to 5 string options for the multiple choice question.'),
  correctOptionIndex: z.number().int().nonnegative().describe('The 0-based index of the correct option in the options array.'),
  pointsForIncorrect: z.literal(0).describe('Points deducted for a wrong answer (always 0 for this type as per rules).'),
});
export type MultipleChoiceLessonItem = z.infer<typeof MultipleChoiceLessonItemSchema>;

export const InformationalSnippetLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.literal('informationalSnippet'),
  content: z.string().describe('The informational content/text for the snippet. This should be a key takeaway or explanation derived from the lesson text.'),
  // pointsAwarded is 1 by rule, pointsForIncorrect is not applicable
});
export type InformationalSnippetLessonItem = z.infer<typeof InformationalSnippetLessonItemSchema>;

export const PromptingTaskLessonItemSchema = BaseLessonItemSchema.extend({
  type: z.literal('promptingTask'),
  taskDescription: z.string().describe('A detailed description of what the user\'s prompt should achieve. This should guide the user to apply techniques from the lesson content.'),
  evaluationGuidance: z.string().describe('Specific, numbered criteria (3-5 points) for the AI to evaluate the user\'s submitted prompt for THIS task. These criteria should relate to the application of concepts from the lesson text.'),
  pointsForIncorrect: z.literal(0).describe('Points deducted for an ineffective prompt (always 0 for this type as per rules).'),
});
export type PromptingTaskLessonItem = z.infer<typeof PromptingTaskLessonItemSchema>;

export const LessonItemSchema = z.discriminatedUnion('type', [
  FreeResponseLessonItemSchema,
  MultipleChoiceLessonItemSchema,
  InformationalSnippetLessonItemSchema,
  PromptingTaskLessonItemSchema,
]);
export type LessonItem = z.infer<typeof LessonItemSchema>;

export const LessonSchema = z.object({
  id: z.string().describe('Unique string identifier for the lesson (e.g., "intro-prompt-engineering").'),
  title: z.string().describe('The main title of the lesson.'),
  description: z.string().describe('A brief description of what the lesson covers.'),
  items: z.array(LessonItemSchema).describe('An array of lesson items, generated based on the raw lesson content. Ensure item IDs are sequential starting from 1 for this lesson.'),
});
export type Lesson = z.infer<typeof LessonSchema>;
