
'use server';

/**
 * @fileOverview Varban Assistant AI Flow.
 * Handles conversational support for traders using Genkit and Gemini.
 * Supports Image Analysis and Error Reporting Tools.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SupportChatInputSchema = z.object({
  message: z.string(),
  locale: z.string().optional(),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  photoDataUri: z.string().optional().describe(
    "A photo as a data URI with MIME type and Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional()
});

export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const logErrorReport = ai.defineTool(
  {
    name: 'logErrorReport',
    description: 'Sends a technical error report provided by the user to the administration desk for review.',
    inputSchema: z.object({
      errorText: z.string().describe('The full text of the error message or description provided by the user.'),
      userId: z.string().describe('The unique ID of the user reporting the error.'),
      userEmail: z.string().describe('The email of the user reporting the error.')
    }),
    outputSchema: z.object({ success: z.boolean(), ref: z.string() }),
  },
  async (input) => {
    try {
      const { db } = initializeFirebase();
      const ref = `ERR-${Math.random().toString(36).substring(7).toUpperCase()}`;
      await addDoc(collection(db, 'error_reports'), {
        userId: input.userId,
        userEmail: input.userEmail,
        errorText: input.errorText,
        ref,
        timestamp: serverTimestamp(),
        status: 'New'
      });
      return { success: true, ref };
    } catch (e) {
      console.error("Failed to log error report:", e);
      return { success: false, ref: 'FAILED' };
    }
  }
);

export async function supportChat(input: SupportChatInput) {
  if (!ai) return "AI services are currently initializing. Please try again in a moment.";
  
  const locale = input.locale || 'en';
  
  try {
    const userMessageContent: any[] = [{ text: input.message }];
    if (input.photoDataUri) {
      userMessageContent.push({ media: { url: input.photoDataUri } });
    }

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      tools: [logErrorReport],
      system: `You are the Varban Markets AI Assistant. 
      You help users with trading, account questions, and platform navigation. 
      Be professional, concise, and helpful. 
      Varban Markets is an institutional trading platform for derivatives and synthetic markets.
      
      IMPORTANT: You must respond in the language corresponding to the locale: ${locale}.
      
      ERROR REPORTING PROTOCOL:
      - If a user mentions an "error", "problem", or "not working", ask them to paste the exact error message or upload a screenshot.
      - Once they provide the error details, summarize it and call the 'logErrorReport' tool using their userId: ${input.userId || 'unknown'} and userEmail: ${input.userEmail || 'unknown'}.
      - Confirm to the user that the error has been transmitted to the Technical Desk with the reference ID provided by the tool.
      
      Maintain the institutional tone: use terms like 'Capital Hub', 'Trade Terminal', and 'Market Registry'.`,
      messages: [
        ...(input.history?.map(h => ({
          role: h.role,
          content: [{ text: h.content }]
        })) || []),
        { role: 'user', content: userMessageContent }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("AI Assistant Failure:", error);
    return "I am experiencing a handshake interruption with our core nodes. Please refer to the Help Center for immediate assistance.";
  }
}
