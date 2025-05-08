import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure GOOGLE_GENAI_API_KEY is set in your .env file
// You can obtain a key from Google AI Studio: https://aistudio.google.com/app/apikey
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn(
    'GOOGLE_GENAI_API_KEY is not set. AI features may not work. Please set it in your .env file.'
  );
}

export const ai = genkit({
  promptDir: './prompts', // If you have a prompts directory
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || 'YOUR_API_KEY_HERE', // Fallback to prevent build errors if not set, but will fail at runtime
    }),
  ],
  // Default model, can be overridden in specific flows/prompts
  model: 'googleai/gemini-2.0-flash', // Using a generally available model
});
