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
  prompt: z.string().describe('The prompt to evaluate.'),
  context: z.string().optional().describe('The context for the prompt.'),
});
export type EvaluatePromptInput = z.infer<typeof EvaluatePromptInputSchema>;

const EvaluatePromptOutputSchema = z.object({
  score: z.number().describe('The score of the prompt, from 0 to 100.'),
  explanation: z.string().describe('The explanation of the score.'),
});
export type EvaluatePromptOutput = z.infer<typeof EvaluatePromptOutputSchema>;

export async function evaluatePrompt(input: EvaluatePromptInput): Promise<EvaluatePromptOutput> {
  return evaluatePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluatePromptPrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('The prompt to evaluate.'),
      context: z.string().optional().describe('The context for the prompt.'),
    }),
  },
  output: {
    schema: z.object({
      score: z.number().describe('The score of the prompt, from 0 to 100.'),
      explanation: z.string().describe('The explanation of the score.'),
    }),
  },
  prompt: `You are an expert prompt engineer.

You will evaluate the effectiveness of a prompt based on the context provided.

Prompt: {{{prompt}}}
Context: {{{context}}}

Provide a score from 0 to 100, and explain the score.

Output in JSON format:
{
  "score": <score>,
  "explanation": <explanation>
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
    return output!;
  }
);
