
'use server';
/**
 * @fileOverview A Genkit flow for generating structured lesson items from raw lesson text.
 *
 * - generateLessonItems - A function that takes raw lesson content and metadata,
 *   and returns a fully structured Lesson object with AI-generated items.
 * - GenerateLessonItemsInput - The input type for the generateLessonItems function.
 * - Lesson (from lesson-schemas) - The output type (structured lesson).
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit'; // Corrected import path
import {
  LessonSchema,
  type Lesson,
  LessonItemSchema,
} from '@/ai/schemas/lesson-schemas'; // Ensure this path is correct

// Define Zod schema for the input to this flow
const GenerateLessonItemsInputSchema = z.object({
  lessonId: z.string().describe('The unique ID of the lesson.'),
  lessonTitle: z.string().describe('The title of the lesson.'),
  lessonDescription: z.string().describe('The description of the lesson.'),
  rawContent: z.string().describe('The raw text content of the lesson from which items should be generated.'),
});
export type GenerateLessonItemsInput = z.infer<typeof GenerateLessonItemsInputSchema>;

// Exported function to be called by the application
export async function generateLessonItems(input: GenerateLessonItemsInput): Promise<Lesson> {
  return generateLessonItemsFlow(input);
}

const lessonGenerationPrompt = ai.definePrompt({
  name: 'generateLessonItemsPrompt',
  input: { schema: GenerateLessonItemsInputSchema },
  output: { schema: LessonSchema },
  prompt: `You are an expert educational content creator for a learning platform teaching AI and prompt engineering.
Your task is to analyze the provided raw lesson text (delimited by <raw_content></raw_content>) and generate a structured list of learning items.
The output MUST be a single, valid JSON object conforming to the provided Lesson schema.

The lesson has the following metadata:
Lesson ID: {{{lessonId}}}
Lesson Title: "{{{lessonTitle}}}"
Lesson Description: "{{{lessonDescription}}}"

Raw lesson content:
<raw_content>
{{{rawContent}}}
</raw_content>

Based on the raw content, generate an array of lesson 'items'. Each item must have:
1.  A unique 'id' (integer, sequential starting from 1 for this lesson).
2.  A 'title' (string, meaningful and concise, derived from the content).
3.  'pointsAwarded' (integer) based on these rules:
    *   'freeResponse': 5 points. 'pointsForIncorrect' must be 0.
    *   'multipleChoice': 3 points. 'pointsForIncorrect' must be 0.
    *   'informationalSnippet': 1 point.
    *   'promptingTask': 10 points. 'pointsForIncorrect' must be 0.

Item Types and specific fields:
-   **informationalSnippet**:
    *   'type': "informationalSnippet"
    *   'content': A key takeaway, definition, or explanation directly extracted or summarized from the raw text. Max 2-3 sentences.
    *   'pointsAwarded': 1
-   **freeResponse**:
    *   'type': "freeResponse"
    *   'question': A question that tests understanding of concepts from the raw text.
    *   'expectedAnswer': A concise example or description of the correct answer.
    *   'pointsAwarded': 5
    *   'pointsForIncorrect': 0
-   **multipleChoice**:
    *   'type': "multipleChoice"
    *   'question': A question based on the raw text.
    *   'options': An array of 3-4 string options. One option must be correct.
    *   'correctOptionIndex': The 0-based index of the correct option.
    *   'pointsAwarded': 3
    *   'pointsForIncorrect': 0
-   **promptingTask**:
    *   'type': "promptingTask"
    *   'taskDescription': A detailed task for the user to write a prompt, applying techniques discussed in the raw text.
    *   'evaluationGuidance': 3-5 specific, numbered criteria for evaluating the user's submitted prompt. These criteria should relate to the task and concepts from the raw text.
    *   'pointsAwarded': 10
    *   'pointsForIncorrect': 0

General Guidelines:
-   Generate a variety of item types. Aim for at least 5-10 items per lesson if content allows.
-   All content for items (questions, options, descriptions, etc.) must be derived from or directly reference the provided raw lesson text. Do not invent new concepts not present in the text.
-   Ensure the generated JSON is valid and strictly adheres to the Lesson schema structure, including all required fields for each item type.
-   The final output should be a single JSON object: { "id": "{{{lessonId}}}", "title": "{{{lessonTitle}}}", "description": "{{{lessonDescription}}}", "items": [...] }.
-   For multiple choice options, ensure one is clearly correct based on the text and others are plausible distractors.
-   For prompting tasks, the task description should clearly state what the user needs to do, and evaluation guidance should provide clear, actionable criteria.

Produce ONLY the JSON object. Do not include any other text before or after the JSON.
`,
});

const generateLessonItemsFlow = ai.defineFlow(
  {
    name: 'generateLessonItemsFlow',
    inputSchema: GenerateLessonItemsInputSchema,
    outputSchema: LessonSchema,
  },
  async (input) => {
    console.log(`Generating lesson items for: ${input.lessonTitle}`);
    const { output } = await lessonGenerationPrompt(input);

    if (!output) {
      console.error('AI did not return an output for lesson generation.');
      throw new Error('Failed to generate lesson items: No output from AI.');
    }

    // Additional validation could be done here if needed, beyond Zod's parsing.
    // For example, ensuring item IDs are sequential.
    // For now, we rely on the prompt and Zod schema validation.
    let itemIdCounter = 1;
    const validatedItems = output.items.map(item => ({
      ...item,
      id: itemIdCounter++ // Ensure sequential IDs
    }));

    return {
        ...output,
        items: validatedItems
    };
  }
);
