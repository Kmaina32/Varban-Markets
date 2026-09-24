
'use server';

/**
 * @fileOverview AI Support Agent Flow for Varban Markets.
 * 
 * - supportChat - A wrapper function that handles the conversational AI logic.
 * - SupportChatInput - The input type for the supportChat flow.
 * - SupportChatOutput - The AI-generated response string.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SupportChatInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string(),
});

export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.string();
export type SupportChatOutput = string;

const SYSTEM_PROMPT = `You are the Varban Markets Support Assistant. You provide clear, professional, and friendly help using NATURAL ENGLISH.

PLATFORM IDENTITY:
Varban Markets is a professional platform for trading synthetic indices and derivatives. It is registered in Saint Lucia.

CORE RULES & SPECS:
- TRADING: CALL (Higher) and PUT (Lower) directions.
- PAYOUTS: Standard 85% return on successful trades.
- EARLY CLOSE: Users can close trades early for a fixed 35% return of their stake.
- SETTLEMENT: Trades are settled at the exact second of expiration.
- MARKETS: Synthetic Indices (24/7), Forex (24/5), Equities, Commodities, and Bonds.
- FUNDING: Paystack for cards/bank transfers (USD, NGN, GHS, ZAR, KES). Crypto (USDT, BTC, ETH, SOL).
- WITHDRAWALS: Bank transfers processed in 24 hours. Crypto typically 5-30 minutes.
- IDENTITY (KYC): Tier 1 (Basic - $2k limit), Tier 2 (Verified - ID + Selfie required).

TONE & STYLE:
- Avoid technical jargon like "Remittance," "Conduit," or "Matrix."
- Use natural terms: "Withdrawal," "Add Money," "History," "Market List."
- Be concise but helpful. If a user asks for help with a trade, guide them to the Help Center or Support Desk.

CONTACT INFO:
- Email: desk@varbanmarkets.com
- Phone: +44 (0) 20 7946 0122
- HQ: 25 Bank Street, Canary Wharf, London.

If you don't know the answer to a specific technical or financial question, ask the user to submit a Support Ticket via the Contact page.`;

const supportChatPrompt = ai.definePrompt({
  name: 'supportChatPrompt',
  input: { schema: SupportChatInputSchema },
  output: { schema: SupportChatOutputSchema },
  system: SYSTEM_PROMPT,
  prompt: `History:
{{#each history}}
- {{role}}: {{content}}
{{/each}}
User: {{message}}`,
});

const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async (input) => {
    const { output } = await supportChatPrompt(input);
    return output || "I'm sorry, I couldn't process that request.";
  }
);

/**
 * Handles the conversational AI logic for the support desk.
 * @param input Previous messages and the new prompt.
 * @returns The AI-generated response string.
 */
export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  return supportChatFlow(input);
}
