// src/ai/flows/validate-user-answer.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating user answers using a language model.
 *
 * - validateUserAnswer - A function that takes a user's answer and the expected answer as input, and returns a validation result with feedback.
 * - ValidateUserAnswerInput - The input type for the validateUserAnswer function.
 * - ValidateUserAnswerOutput - The output type for the validateUserAnswer function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

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
      userAnswer: z.string().describe('The user\s answer to the question.'),
      expectedAnswer: z.string().describe('The expected answer to the question.'),
      question: z.string().describe('The question that the user is answering.'),
    }),
  },
  output: {
    schema: z.object({
      isValid: z.boolean().describe('Whether the user answer is valid or not.'),
      feedback: z.string().describe('Feedback to the user about their answer, including hints if the answer is incorrect.'),
    }),
  },
  prompt: `You are an expert educator providing feedback on student answers to questions.

  Based on the question, the expected answer, and the student's answer, determine if the student's answer is valid.
  If the answer is not valid, provide feedback to the student to help them improve their answer. Include hints if necessary.

  Question: {{{question}}}
  Expected Answer: {{{expectedAnswer}}}
  Student's Answer: {{{userAnswer}}}

  isValid: {{isValid}}
  feedback: {{feedback}}
  `,
});

const validateUserAnswerFlow = ai.defineFlow<
  typeof ValidateUserAnswerInputSchema,
  typeof ValidateUserAnswerOutputSchema
>({
  name: 'validateUserAnswerFlow',
  inputSchema: ValidateUserAnswerInputSchema,
  outputSchema: ValidateUserAnswerOutputSchema,
},
async input => {
  const {output} = await validateUserAnswerPrompt(input);
  return output!;
});
