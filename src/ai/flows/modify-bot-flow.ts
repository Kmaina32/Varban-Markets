'use server';

/**
 * @fileOverview Bot Configuration AI Assistant Flow.
 * Proposes safe, typed configuration patches for trading strategies.
 * 
 * - modifyBot - Primary function to generate a configuration proposal.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BotIdSchema = z.enum([
  'bm-liquidity-sweep',
  'trend-continuation',
  'breakout-retest',
  'mean-reversion',
  'momentum-scanner'
]);

const ModifyBotInputSchema = z.object({
  botId: BotIdSchema,
  currentConfig: z.any().describe('The current active configuration for the bot.'),
  userRequest: z.string().describe('The natural language description of the desired changes.'),
  locale: z.string().optional()
});

const ProposalPatchSchema = z.object({
  field: z.string(),
  value: z.any(),
  reason: z.string()
});

const ModifyBotOutputSchema = z.object({
  bot_id: BotIdSchema,
  summary: z.string().describe('Concise summary of the proposed changes.'),
  patch: z.array(ProposalPatchSchema).describe('List of field updates.'),
  warnings: z.array(z.string()).describe('Safety or performance warnings.'),
  assumptions: z.array(z.string()).describe('Logical assumptions made by the AI.'),
  tests_to_run: z.array(z.string()).describe('Recommended validation tests.'),
  requires_human_review: z.boolean(),
  clarification_question: z.string().nullable()
});

export type ModifyBotOutput = z.infer<typeof ModifyBotOutputSchema>;

export async function modifyBot(input: z.infer<typeof ModifyBotInputSchema>): Promise<ModifyBotOutput> {
  const prompt = ai.definePrompt({
    name: 'modifyBotPrompt',
    input: { schema: ModifyBotInputSchema },
    output: { schema: ModifyBotOutputSchema },
    prompt: `You are the Varban Markets Bot Modification Assistant. 
    You help users tune strategy parameters through safe configuration patches.

    CORE RULES:
    1. NEVER promise profits or risk-free results.
    2. Do NOT generate executable code, SQL, or scripts. Return ONLY JSON patches.
    3. Global risk limits (0.5% max risk) are IMMUTABLE.
    4. Stay within the bot's allowlisted parameter space.
    5. If a request is ambiguous, ask a clarification question.

    BOT CONTEXT:
    - ID: {{botId}}
    - Current Config: {{json currentConfig}}
    
    USER REQUEST:
    "{{userRequest}}"

    Analyze the request and return a structured proposal. Respond in language: {{locale}}.`,
  });

  const { output } = await prompt(input);
  return output!;
}
