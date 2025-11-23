'use server';

/**
 * @fileOverview A flow to generate insights about why a prediction is trending.
 *
 * - getTrendingPredictionInsights - A function that returns insights about a trending prediction.
 * - TrendingPredictionInsightsInput - The input type for the getTrendingPredictionInsights function.
 * - TrendingPredictionInsightsOutput - The return type for the getTrendingPredictionInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrendingPredictionInsightsInputSchema = z.object({
  predictionQuestion: z.string().describe('The prediction question.'),
  yesStake: z.number().describe('The current total stake for the YES side of the prediction.'),
  noStake: z.number().describe('The current total stake for the NO side of the prediction.'),
  recentNews: z.string().describe('The recent news related to the prediction question.'),
});
export type TrendingPredictionInsightsInput = z.infer<typeof TrendingPredictionInsightsInputSchema>;

const TrendingPredictionInsightsOutputSchema = z.object({
  insight: z.string().describe('A short summary explaining why the prediction is trending.'),
});
export type TrendingPredictionInsightsOutput = z.infer<typeof TrendingPredictionInsightsOutputSchema>;

export async function getTrendingPredictionInsights(
  input: TrendingPredictionInsightsInput
): Promise<TrendingPredictionInsightsOutput> {
  return trendingPredictionInsightsFlow(input);
}

const trendingPredictionInsightsPrompt = ai.definePrompt({
  name: 'trendingPredictionInsightsPrompt',
  input: {schema: TrendingPredictionInsightsInputSchema},
  output: {schema: TrendingPredictionInsightsOutputSchema},
  prompt: `You are an expert in analyzing trends related to predictions.

  Given the following information about a prediction, provide a short, one-sentence summary explaining why the prediction is trending.
  Your answer should be factual and avoid speculation beyond the information provided. Focus on summarizing the provided information.

  Prediction Question: {{{predictionQuestion}}}
  YES Stake: {{{yesStake}}}
  NO Stake: {{{noStake}}}
  Recent News: {{{recentNews}}}

  Insight:`,
});

const trendingPredictionInsightsFlow = ai.defineFlow(
  {
    name: 'trendingPredictionInsightsFlow',
    inputSchema: TrendingPredictionInsightsInputSchema,
    outputSchema: TrendingPredictionInsightsOutputSchema,
  },
  async input => {
    const {output} = await trendingPredictionInsightsPrompt(input);
    return output!;
  }
);
