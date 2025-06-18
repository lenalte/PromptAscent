
'use server';
/**
 * @fileOverview A Genkit flow for generating structured lesson items, organized into 6 stages, from raw lesson text.
 *
 * - generateLessonItems - A function that takes raw lesson content and metadata,
 *   and returns a fully structured Lesson object with 6 stages, each containing AI-generated items.
 * - GenerateLessonItemsInput - The input type for the generateLessonItems function.
 * - Lesson (from lesson-schemas) - The output type (structured lesson with stages).
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import {
  LessonSchema,
  type Lesson,
} from '@/ai/schemas/lesson-schemas';

const GenerateLessonItemsInputSchema = z.object({
  lessonId: z.string().describe('The unique ID of the lesson.'),
  lessonTitle: z.string().describe('The title of the lesson.'),
  lessonDescription: z.string().describe('The description of the lesson.'),
  rawContent: z.string().describe('The raw text content of the lesson from which items should be generated.'),
});
export type GenerateLessonItemsInput = z.infer<typeof GenerateLessonItemsInputSchema>;

export async function generateLessonItems(input: GenerateLessonItemsInput): Promise<Lesson> {
  return generateLessonItemsFlow(input);
}

const lessonGenerationPrompt = ai.definePrompt({
  name: 'generateLessonItemsWithStagesPrompt',
  input: { schema: GenerateLessonItemsInputSchema },
  output: { schema: LessonSchema },
  prompt: `You are an expert educational content creator for a learning platform teaching AI and prompt engineering.
Your task is to analyze the provided raw lesson text (delimited by <raw_content></raw_content>) and generate a structured lesson composed of EXACTLY 6 STAGES.
Each stage will have a specific theme and set of learning item types.
The lesson has the following metadata:
Lesson ID: {{{lessonId}}}
Lesson Title: "{{{lessonTitle}}}"
Lesson Description: "{{{lessonDescription}}}"

Raw lesson content:
<raw_content>
{{{rawContent}}}
</raw_content>

Output MUST be a single, valid JSON object conforming to the provided Lesson schema, where the 'stages' array contains these 6 stages, and each stage contains its own 'items' array of lesson activities.
Item IDs MUST be unique across the entire lesson (e.g., "s1_item1", "s2_mcq1", etc.).

Stage Details:

Stage 1: "Verstehen" (Understanding)
- id: "stage1"
- title: "Stage 1: Verstehen"
- Goal: Introduce core concepts and definitions.
- Item Types:
    - 2-3 'informationalSnippet' items explaining key terms or concepts from the raw text. (Assign IDs like "s1_info1", "s1_info2")
    - 1-2 'multipleChoice' questions testing comprehension of these snippets. (Assign IDs like "s1_mcq1")
    - 1 'freeResponse' question (easy) asking to define a concept in their own words. (Assign ID like "s1_fr1")
- Point Allocation: Snippets (1pt), MCQs (3pts), Easy Free Response (5pts). 'pointsForIncorrect' must be 0 for all items.

Stage 2: "Anwenden" (Applying)
- id: "stage2"
- title: "Stage 2: Anwenden"
- Goal: Apply learned concepts in simple scenarios.
- Item Types:
    - 2-3 'freeResponse' questions requiring users to apply concepts to given examples. (Assign IDs like "s2_fr1", "s2_fr2")
    - 1-2 'informationalSnippet' items demonstrating simple applications or providing worked examples. (Assign IDs like "s2_info1")
- Point Allocation: Free Response (5-7pts), Snippets (1pt). 'pointsForIncorrect' must be 0.

Stage 3: "Variieren" (Varying)
- id: "stage3"
- title: "Stage 3: Variieren"
- Goal: Encourage users to create variations of prompts or apply concepts in different ways.
- Item Types:
    - 1-2 'promptingTask' items where users write prompts for a given scenario, possibly with slight variations to the scenario. (Assign IDs like "s3_pt1")
    - Evaluation guidance should focus on achieving the task and using varied techniques if applicable.
- Point Allocation: Prompting Tasks (10-15pts). 'pointsForIncorrect' must be 0.

Stage 4: "Reflektieren" (Reflecting - Error Analysis)
- id: "stage4"
- title: "Stage 4: Reflektieren"
- Goal: Develop critical thinking by analyzing and improving prompts.
- Item Types:
    - 1-2 'promptingTask' items. The 'taskDescription' will present a (intentionally) flawed or suboptimal prompt and ask the user to identify its weaknesses and suggest improvements. 'evaluationGuidance' for the LLM should focus on the quality of the user's analysis and the validity of their suggested improvements. (Assign IDs like "s4_pt_error1")
    - 1 'freeResponse' question asking about common pitfalls or best practices related to the lesson topic. (Assign ID like "s4_fr1")
- Point Allocation: Prompting Tasks (10-15pts), Free Response (5-7pts). 'pointsForIncorrect' must be 0.

Stage 5: "Wiederholen" (Repeating - Revision Quiz)
- id: "stage5"
- title: "Stage 5: Wiederholen"
- Goal: Reinforce learning through a targeted quiz.
- Item Types:
    - 2-3 'multipleChoice' questions covering key concepts from the entire lesson. (Assign IDs like "s5_mcq1", "s5_mcq2")
    - 1-2 'freeResponse' questions summarizing or explaining important topics. (Assign IDs like "s5_fr1")
- Point Allocation: MCQs (3-5pts), Free Response (5-7pts). 'pointsForIncorrect' must be 0.

Stage 6: "Anwenden & Reflektieren" (Applying & Reflecting - Complex Task)
- id: "stage6"
- title: "Stage 6: Anwenden & Reflektieren"
- Goal: Apply knowledge to a complex task and reflect on the learning process.
- Item Types:
    - 1 'promptingTask' (complex) that requires integrating multiple concepts from the lesson. Evaluation guidance should be comprehensive. (Assign ID like "s6_pt_complex1")
    - 1 'freeResponse' question: "What are your key takeaways from this lesson and how might you apply them in the future?" (Expected answer should be a placeholder like "User's personal reflection"). (Assign ID like "s6_fr_reflect1")
- Point Allocation: Complex Prompting Task (15-20pts), Reflection Free Response (5pts). 'pointsForIncorrect' must be 0.

CRITICAL Content Sequencing Rule:
- Concepts tested in a stage MUST have been introduced in earlier informational snippets within THE SAME STAGE OR PREVIOUS STAGES.
- Later stages should build upon knowledge from earlier stages.
- All content for items (questions, options, descriptions, snippet content, task details etc.) must be derived from or directly reference the provided raw lesson text. Do not invent new concepts not present in the text.

General Guidelines:
- Each stage must have the specified 'id' (e.g., "stage1") and 'title' (e.g., "Stage 1: Verstehen").
- Ensure generated JSON is valid and strictly adheres to the Lesson schema structure, including all required fields for each item type and stage.
- The final output should be a single JSON object: { "id": "{{{lessonId}}}", "title": "{{{lessonTitle}}}", "description": "{{{lessonDescription}}}", "stages": [ { "id": "stage1", "title": "Stage 1: Verstehen", "items": [...] }, ...6 stages total... ] }.
- For multiple choice options, ensure one is clearly correct based on the text and others are plausible distractors.
- For prompting tasks, the taskDescription should clearly state what the user needs to do, and evaluationGuidance should provide clear, actionable criteria.

Produce ONLY the JSON object. Do not include any other text before or after the JSON.
`,
});

const generateLessonItemsFlow = ai.defineFlow(
  {
    name: 'generateLessonItemsWithStagesFlow',
    inputSchema: GenerateLessonItemsInputSchema,
    outputSchema: LessonSchema,
  },
  async (input) => {
    console.log(`Generating lesson items with 6 stages for: ${input.lessonTitle}`);
    const { output } = await lessonGenerationPrompt(input);

    if (!output) {
      console.error('AI did not return an output for lesson generation with stages.');
      throw new Error('Failed to generate lesson items with stages: No output from AI.');
    }

    // Additional validation for 6 stages and unique item IDs across stages
    if (output.stages.length !== 6) {
        console.error(`AI did not return exactly 6 stages. Got: ${output.stages.length}`);
        throw new Error(`AI generation error: Expected 6 stages, but received ${output.stages.length}.`);
    }

    const allItemIds = new Set<string>();
    output.stages.forEach(stage => {
        if(!stage.items) {
            console.warn(`Stage ${stage.id} has no items array.`);
            stage.items = []; // Ensure items array exists
        }
        stage.items.forEach(item => {
            if (allItemIds.has(item.id)) {
                console.warn(`Duplicate item ID found: ${item.id} in stage ${stage.id}. This might cause issues.`);
                // Potentially re-assign ID or throw error. For now, log warning.
                // item.id = `${item.id}_dup_${Math.random().toString(36).substring(7)}`; // Simple fix, but ideally AI gets it right
            }
            allItemIds.add(item.id);
        });
    });
    
    console.log(`Successfully generated lesson ${input.lessonId} with ${output.stages.length} stages and a total of ${allItemIds.size} items.`);
    return output;
  }
);
