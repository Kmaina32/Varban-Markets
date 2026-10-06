
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview AI INITIALIZATION (RE-ACTIVATED).
 * Re-enabled for the Varban Assistant chatbot.
 */

export const ai = genkit({
  plugins: [googleAI()],
});
