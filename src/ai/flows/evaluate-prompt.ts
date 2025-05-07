
'use server';
/**
 * @fileOverview A prompt evaluation AI agent.
 *
 * - evaluatePrompt - A function that handles the prompt evaluation process.
 * - EvaluatePromptInput - The input type for the evaluatePrompt function.
 * - EvaluatePromptOutput - The return type for the evaluatePrompt function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const EvaluatePromptInputSchema = z.object({
  prompt: z.string().describe('The user-submitted prompt to evaluate.'),
  context: z.string().optional().describe('The context or task description for which the prompt was created.'),
  evaluationGuidance: z.string().describe('Specific criteria and guidance for how to evaluate the prompt based on the task.'),
});
export type EvaluatePromptInput = z.infer<typeof EvaluatePromptInputSchema>;

const EvaluatePromptOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('The score of the prompt, from 0 to 100, based on the evaluation guidance.'),
  explanation: z.string().describe('A detailed explanation of the score, referencing the specific evaluation guidance and how well the prompt met the criteria.'),
  isCorrect: z.boolean().describe('Whether the prompt is considered correct/effective based on the evaluation. Generally true if score is above a certain threshold (e.g., 70).')
});
export type EvaluatePromptOutput = z.infer<typeof EvaluatePromptOutputSchema>;

export async function evaluatePrompt(input: EvaluatePromptInput): Promise<EvaluatePromptOutput> {
  return evaluatePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateUserPromptForTaskPrompt',
  input: {
    schema: EvaluatePromptInputSchema,
  },
  output: {
    schema: EvaluatePromptOutputSchema,
  },
  prompt: `You are an expert prompt engineering instructor. Your task is to evaluate a user-submitted prompt intended to achieve a specific goal.

Task Context:
{{{context}}}

User's Prompt:
"{{{prompt}}}"

Evaluation Guidance (Criteria for a good prompt for this task):
{{{evaluationGuidance}}}

Based on the Task Context and the Evaluation Guidance, evaluate the user's prompt.
Provide a score from 0 to 100. A score of 70 or higher generally indicates an effective prompt for the task.
Provide a detailed explanation for your score, specifically referencing how well the user's prompt meets each point in the Evaluation Guidance.
Determine if the prompt is considered correct/effective (isCorrect: true/false).

Output in JSON format:
{
  "score": <score_integer_0_to_100>,
  "explanation": "<detailed_explanation_referencing_guidance>",
  "isCorrect": <true_or_false>
}
`,
});

const evaluatePromptFlow = ai.defineFlow<
  typeof EvaluatePromptInputSchema,
  typeof EvaluatePromptOutputSchema
>(
  {
    name: 'evaluatePromptFlow',
    inputSchema: EvaluatePromptInputSchema,
    outputSchema: EvaluatePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("The AI did not return an output. Please try again.");
    }
    // Ensure the score is within the 0-100 range, clamp if necessary.
    const score = Math.max(0, Math.min(100, output.score));
    return { ...output, score };
  }
);
