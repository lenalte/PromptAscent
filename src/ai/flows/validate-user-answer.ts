'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating user answers using a language model.
 *
 * - validateUserAnswer - A function that takes a user's answer and the expected answer as input, and returns a validation result with feedback.
 * - ValidateUserAnswerInput - The input type for the validateUserAnswer function.
 * - ValidateUserAnswerOutput - The output type for the validateUserAnswer function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const ValidateUserAnswerInputSchema = z.object({
  userAnswer: z.string().describe('The user\s answer to the question.'),
  expectedAnswer: z.string().describe('The expected answer to the question.'),
  question: z.string().describe('The question that the user is answering.'),
});
export type ValidateUserAnswerInput = z.infer<typeof ValidateUserAnswerInputSchema>;

const ValidateUserAnswerOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the user answer is valid or not.'),
  feedback: z.string().describe('Feedback to the user about their answer, including hints if the answer is incorrect.'),
});
export type ValidateUserAnswerOutput = z.infer<typeof ValidateUserAnswerOutputSchema>;

export async function validateUserAnswer(input: ValidateUserAnswerInput): Promise<ValidateUserAnswerOutput> {
  return validateUserAnswerFlow(input);
}

const validateUserAnswerPrompt = ai.definePrompt({
  name: 'validateUserAnswerPrompt',
  input: {
    schema: z.object({
      userAnswer: z.string().describe('Die Antwort des Nutzers auf die Frage.'),
      expectedAnswer: z.string().describe('Die erwartete Antwort auf die Frage.'),
      question: z.string().describe('Die Frage, die der Nutzer beantwortet.'),
    }),
  },
  output: {
    schema: z.object({
      isValid: z.boolean().describe('Ob die Antwort des Nutzers gültig ist oder nicht.'),
      feedback: z.string().describe('Feedback für den Nutzer zu seiner Antwort, einschließlich Hinweisen, falls die Antwort falsch ist.'),
    }),
  },
  prompt: `Du bist ein erfahrener Pädagoge, der Feedback zu den Antworten von Lernenden gibt. Die Antwort muss auf Deutsch sein.

  Beurteile anhand der Frage, der erwarteten Antwort und der Antwort des Lernenden, ob die Antwort des Lernenden gültig ist.
  Wenn die Antwort nicht gültig ist, gib dem Lernenden Feedback, um ihm zu helfen, seine Antwort zu verbessern. Gib bei Bedarf Hinweise.

  Frage: {{{question}}}
  Erwartete Antwort: {{{expectedAnswer}}}
  Antwort des Lernenden: {{{userAnswer}}}

  isValid: {{isValid}}
  feedback: {{feedback}}
  `,
});

const validateUserAnswerFlow = ai.defineFlow(
  {
    name: 'validateUserAnswerFlow',
    inputSchema: ValidateUserAnswerInputSchema,
    outputSchema: ValidateUserAnswerOutputSchema,
  },
  async (input) => {
    console.log(
      "[PROD DEBUG] Gemini API Key:",
      process.env.GOOGLE_GENAI_API_KEY
        ? `Present (${process.env.GOOGLE_GENAI_API_KEY.length} Zeichen)`
        : "Missing/Empty"
    );
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { output } = await validateUserAnswerPrompt(input);
        if (!output) {
          throw new Error('The AI did not return an output. Please try again.');
        }
        return output;
      } catch (error) {
        console.error(`[validateUserAnswerFlow] Attempt ${attempt} failed:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check for non-retryable quota errors
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
          throw new Error('API-Kontingent überschritten. Bitte versuchen Sie es später erneut.');
        }

        if (attempt === MAX_RETRIES) {
          throw new Error(`Failed to validate answer after ${MAX_RETRIES} attempts: ${errorMessage}`);
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Flow failed to produce an output after all retries.');
  }
);
