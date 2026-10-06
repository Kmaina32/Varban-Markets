'use server';

/**
 * @fileOverview Varban Assistant AI Flow.
 * Handles conversational support for traders using Genkit and Gemini.
 * Updated for Genkit v1.x API compatibility.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SupportChatInputSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional()
});

export async function supportChat(input: z.infer<typeof SupportChatInputSchema>) {
  if (!ai) return "AI services are currently initializing. Please try again in a moment.";
  
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `You are the Varban Markets AI Assistant. 
      You help users with trading, account questions, and platform navigation. 
      Be professional, concise, and helpful. 
      Varban Markets is an institutional trading platform for derivatives and synthetic markets.
      If users ask about logging in, refer them to https://varbanmarkets.com/login.
      If they ask about account verification, refer them to the Account Hub.
      Maintain the institutional tone: use terms like 'Capital Hub', 'Trade Terminal', and 'Market Registry'.`,
      messages: [
        ...(input.history?.map(h => ({
          role: h.role,
          content: [{ text: h.content }]
        })) || []),
        { role: 'user', content: [{ text: input.message }] }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("AI Assistant Failure:", error);
    return "I am experiencing a handshake interruption with our core nodes. Please refer to the Help Center for immediate assistance.";
  }
}
