'use server';

import {
  getTrendingPredictionInsights as getInsights,
  type TrendingPredictionInsightsInput,
} from '@/ai/flows/trending-prediction-insights';

export async function getTrendingPredictionInsights(
  input: TrendingPredictionInsightsInput
) {
  try {
    const result = await getInsights(input);
    return { success: true, insight: result.insight };
  } catch (error) {
    console.error('Error getting trending prediction insights:', error);
    return {
      success: false,
      error: 'Failed to generate insights. Please try again.',
    };
  }
}
