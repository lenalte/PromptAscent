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
  prompt: `Du bist ein Experte für Prompt-Engineering und bewertest den Prompt eines Nutzers für eine bestimmte Aufgabe. Die Antwort muss auf Deutsch sein.

Aufgabenkontext:
{{{context}}}

Prompt des Nutzers:
"{{{prompt}}}"

Bewertungsleitfaden (Kriterien für einen guten Prompt für diese Aufgabe):
{{{evaluationGuidance}}}

Bewerte auf Basis des Aufgabenkontexts und des Bewertungsleitfadens den Prompt des Nutzers.
Gib eine Punktzahl von 0 bis 100. Eine Punktzahl von 70 oder höher bedeutet in der Regel, dass der Prompt für die Aufgabe effektiv ist.
Gib eine detaillierte Erklärung für deine Punktzahl und beziehe dich dabei auf die Punkte im Bewertungsleitfaden.
Stelle fest, ob der Prompt als korrekt/effektiv angesehen wird (isCorrect: true/false).

Gib das Ergebnis im JSON-Format aus:
{
  "score": <score_integer_0_to_100>,
  "explanation": "<detaillierte_erklärung_mit_bezug_auf_den_leitfaden_auf_deutsch>",
  "isCorrect": <true_oder_false>
}
`,
});

const evaluatePromptFlow = ai.defineFlow(
  {
    name: 'evaluatePromptFlow',
    inputSchema: EvaluatePromptInputSchema,
    outputSchema: EvaluatePromptOutputSchema,
  },
  async (input) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { output } = await prompt(input);
        if (!output) {
          throw new Error('The AI did not return an output. Please try again.');
        }
        // Ensure the score is within the 0-100 range, clamp if necessary.
        const score = Math.max(0, Math.min(100, output.score));
        return { ...output, score };
      } catch (error) {
        console.error(`[evaluatePromptFlow] Attempt ${attempt} failed:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check for non-retryable quota errors
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            throw new Error('API-Kontingent überschritten. Bitte versuchen Sie es später erneut.');
        }

        if (attempt === MAX_RETRIES) {
          throw new Error(`Failed to evaluate prompt after ${MAX_RETRIES} attempts: ${errorMessage}`);
        }
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Flow failed to produce an output after all retries.');
  }
);
