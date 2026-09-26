'use server';

/**
 * @fileOverview Market Intelligence News Analysis Flow.
 * 
 * - getMarketNewsAnalysis - Fetches and analyzes news for a specific asset or general market.
 * - NewsSummaryInput - The input type for the flow.
 * - NewsSummaryOutput - A list of analyzed news items with sentiment and impact.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchMarketNews } from '@/app/lib/news-service';

const NewsSummaryInputSchema = z.object({
  asset: z.string().optional().describe('Asset symbol or name to filter news by'),
});

const NewsSummaryOutputSchema = z.array(z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  sentiment: z.enum(['Bullish', 'Bearish', 'Neutral']),
  impact: z.string().describe('Potential impact on the market or traders'),
  publishedAt: z.string(),
  source: z.string(),
}));

export type NewsSummaryOutput = z.infer<typeof NewsSummaryOutputSchema>;

/**
 * Orchestrates the news fetching and AI analysis process.
 */
export async function getMarketNewsAnalysis(input: { asset?: string }): Promise<NewsSummaryOutput> {
  return marketNewsFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'marketNewsPrompt',
  input: { schema: NewsSummaryInputSchema.extend({ newsItems: z.any() }) },
  output: { schema: NewsSummaryOutputSchema },
  system: "You are a professional institutional financial analyst at Varban Markets. Use NATURAL ENGLISH.",
  prompt: `Analyze the following news headlines related to {{#if asset}}{{asset}}{{else}}global financial markets{{/if}}.
  
  For each news item provided:
  1. "id": Use the uuid provided.
  2. "title": Use the original title.
  3. "summary": Provide a clear, one-sentence summary of the core message.
  4. "sentiment": Categorize as 'Bullish', 'Bearish', or 'Neutral' based on how it typically affects asset prices.
  5. "impact": Briefly explain the potential impact on traders (e.g., "Expect high volatility in USD pairs" or "Positive outlook for crypto liquidity").
  6. "publishedAt": Use the original timestamp.
  7. "source": Use the original publisher name.

  News Headlines:
  {{#each newsItems}}
  - [{{uuid}}] {{title}} (Source: {{publisher}}, Time: {{published_at}})
  {{/each}}
  
  If no news items are provided, return an empty array. Limit your response to only the JSON array of objects.`,
});

const marketNewsFlow = ai.defineFlow(
  {
    name: 'marketNewsFlow',
    inputSchema: NewsSummaryInputSchema,
    outputSchema: NewsSummaryOutputSchema,
  },
  async (input) => {
    const rawNews = await fetchMarketNews(input.asset);
    
    if (!rawNews || rawNews.length === 0) {
      return [];
    }

    // Analyze top 5 news items to ensure speed and focus
    const topNews = rawNews.slice(0, 5);

    const { output } = await analysisPrompt({
      ...input,
      newsItems: topNews,
    });
    
    return output || [];
  }
);
